"""The AgriGuide advisory workflow.

Implements AGENTS.md §4 and §5:
  - validate the report and ask for essential missing information,
  - run the two read tools inside a BOUNDED loop,
  - generate a cautious, evidence-referenced advisory (LLM free tier when
    configured, otherwise a deterministic rule-based drafter),
  - and only ever persist via the confirm step (explicit user approval).

Nothing in here invents sources or diagnoses; the retrieved guidance is the
source of truth and insufficient evidence is stated plainly.
"""

from datetime import date, timedelta

from .llm import generate_advisory_draft, llm_available
from .tools import (
    MAX_TOOL_CALLS,
    ToolError,
    readCaseHistory,
    saveAdvisoryAndFollowUp,
    searchCropGuidance,
)

DEFAULT_FOLLOW_UP_DAYS = 7


class ReportValidationError(Exception):
    """The report is missing essential information the agent needs."""

    def __init__(self, missing):
        self.missing = missing  # list of {"field", "message"}
        super().__init__("The report is missing required information.")


def _filled(value):
    return bool(str(value or "").strip())


def validate_report(report):
    """Return a list of missing essential fields ([] when the report is valid)."""
    missing = []

    location_ref = report.get("location_ref")
    location_name = report.get("location_name")
    if not _filled(location_ref) and not _filled(location_name):
        missing.append({"field": "location", "message": "A reporting location is required."})

    if not _filled(report.get("growth_stage")):
        missing.append({"field": "growth_stage", "message": "Growth stage is required."})

    symptoms = str(report.get("symptoms") or "").strip()
    if not symptoms:
        missing.append({"field": "symptoms", "message": "Observed symptoms are required."})
    elif len(symptoms) < 10:
        missing.append(
            {"field": "symptoms", "message": "Please describe the symptoms in more detail (at least 10 characters)."}
        )

    conditions = report.get("field_conditions") or {}
    has_condition = any(
        _filled(conditions.get(k)) for k in ("affected_area", "rainfall", "soil_condition", "date_observed")
    )
    if not has_condition:
        missing.append(
            {"field": "field_conditions", "message": "At least one field condition (rainfall, soil, affected area or date) is required."}
        )

    return missing


def _build_observations(report, cases):
    """Deterministic observations straight from the report (facts, not causes)."""
    location = report.get("location_name") or report.get("location_ref") or "the selected location"
    stage = str(report.get("growth_stage") or "").strip().lower()
    observations = [
        f"Reported a {stage} maize crop at {location} with symptoms: {report.get('symptoms', '').strip()}"
    ]

    conditions = report.get("field_conditions") or {}
    if _filled(conditions.get("affected_area")):
        observations.append(f"Affected area / distribution: {conditions['affected_area']}")
    if _filled(conditions.get("rainfall")):
        observations.append(f"Recent rainfall: {conditions['rainfall']}")
    if _filled(conditions.get("soil_condition")):
        observations.append(f"Soil condition: {conditions['soil_condition']}")
    if _filled(conditions.get("date_observed")):
        observations.append(f"Date observed: {conditions['date_observed']}")

    count = len(cases)
    observations.append(
        f"{count} previous case {'record' if count == 1 else 'records'} {'was' if count == 1 else 'were'} retrieved for this location."
    )
    return observations


def _sources_from_guidance(guidance):
    return [
        {
            "source_id": note.get("source_id", ""),
            "title": note.get("title", ""),
            "section": note.get("section", ""),
            "snippet": note.get("text", ""),
            "demo": note.get("demo", False),
        }
        for note in guidance
    ]


def _plus_days(days):
    return (date.today() + timedelta(days=days)).isoformat()


def _rule_based_draft(report, cases, guidance):
    """Deterministic, offline advisory drafter grounded in retrieved guidance.

    Used whenever the free-tier LLM is unavailable or fails. Each explanation
    cites a real retrieved source; no diagnosis is asserted.
    """
    possibilities = [
        {
            "label": "Possibility",
            "text": f"{note.get('text', '').strip()} (source {note.get('source_id')}, {note.get('section', '')})",
        }
        for note in guidance[:3]
    ]

    if not possibilities:
        possibilities = [
            {
                "label": "Possibility",
                "text": "The reported symptoms do not match any stored guidance note. More observation is needed before any explanation can be offered, and a qualified local agricultural professional should be consulted.",
            }
        ]

    next_steps = [
        {"text": "Re-inspect at least ten plants across the affected area and record where symptoms appear first."},
        {"text": "Note whether symptoms are concentrated in one part of the field or spread evenly."},
        {"text": "Compare the observations with the retrieved guidance notes before deciding on any action."},
        {"text": "If the evidence stays unclear or the problem spreads, consult a qualified local agricultural professional."},
    ]

    location = report.get("location_name") or report.get("location_ref") or "the selected location"
    explanation_sentence = " ".join(p["text"] for p in possibilities)
    advisory_text = (
        f"Observations reported at {location} may be consistent with several conditions; "
        f"the retrieved guidance suggests: {explanation_sentence} "
        "This is a cautious, evidence-referenced draft — it is not a confirmed diagnosis. "
        "Follow-up: re-inspect the affected area, record what changes, and consult a qualified "
        "local agricultural professional if symptoms worsen or remain unexplained."
    )

    follow_up = f"Re-inspect the affected maize at {location} and record whether symptoms have changed."
    evidence_warning = None if guidance else "No relevant guidance was found for this report — treat the advisory as unverified."

    return {
        "possible_explanations": possibilities,
        "next_steps": next_steps,
        "advisory_text": advisory_text,
        "follow_up_task": follow_up,
        "evidence_warning": evidence_warning,
        "llm_used": False,
    }


def _run_read_tools(report):
    """Execute the two read tools inside a bounded loop with per-tool error handling."""
    location_code = report.get("location_ref")
    query = " ".join(
        str(report.get(k) or "")
        for k in ("symptoms", "growth_stage")
    ) + " " + str((report.get("field_conditions") or {}).get("soil_condition") or "")

    steps = [
        ("readCaseHistory", lambda: readCaseHistory(location_code=location_code)),
        ("searchCropGuidance", lambda: searchCropGuidance(query=query, crop=report.get("crop") or "Maize")),
    ]

    results = {"cases": [], "guidance": []}
    tool_calls = []

    for name, fn in steps:
        if len(tool_calls) >= MAX_TOOL_CALLS:  # bounded agent loop
            break
        try:
            output = fn()
        except ToolError as exc:
            tool_calls.append({"tool": name, "status": "error", "message": exc.message})
            output = []
        else:
            tool_calls.append({"tool": name, "status": "ok", "count": len(output)})

        if name == "readCaseHistory":
            results["cases"] = output
        else:
            results["guidance"] = output

    return results, tool_calls


def run_advisory_preview(report):
    """Build a cautious advisory draft. NEVER persists anything.

    Raises ReportValidationError when essential information is missing so the
    caller (the view) can ask the user for it.
    """
    missing = validate_report(report)
    if missing:
        raise ReportValidationError(missing)

    results, tool_calls = _run_read_tools(report)
    cases = results["cases"]
    guidance = results["guidance"]

    observations = _build_observations(report, cases)

    context = {
        "report": {
            **{k: report.get(k) for k in ("location_name", "crop", "growth_stage", "symptoms")},
            "field_conditions": report.get("field_conditions") or {},
        },
        "cases": cases,
        "guidance": guidance,
    }

    draft = generate_advisory_draft(context)
    if not draft:
        draft = _rule_based_draft(context["report"], cases, guidance)

    return {
        "observations": observations,
        "case_history": cases,
        "possible_explanations": draft.get("possible_explanations", []),
        "next_steps": draft.get("next_steps", []),
        "sources": _sources_from_guidance(guidance),
        "advisory_text": draft.get("advisory_text", ""),
        "follow_up_task": draft.get("follow_up_task", ""),
        "follow_up_due_date": _plus_days(DEFAULT_FOLLOW_UP_DAYS),
        "status": "awaiting_approval",
        "evidence_warning": draft.get("evidence_warning"),
        "demo": False,
        "llm_used": bool(draft.get("llm_used")),
        "tool_calls": tool_calls,
    }


def confirm_and_save(owner, payload):
    """Persist the user-approved advisory via the save tool (explicit approval)."""
    report = payload.get("report") or {}
    advisory = payload.get("advisory") or {}

    conditions = report.get("field_conditions") or {}

    save_payload = {
        "location_ref": report.get("location_ref", ""),
        "location_name": report.get("location_name", ""),
        "farmer_name": report.get("farmer_name", ""),
        "crop": report.get("crop", "Maize"),
        "growth_stage": report.get("growth_stage", ""),
        "symptoms": report.get("symptoms", ""),
        "field_conditions": conditions,
        "observations": advisory.get("observations", []),
        "case_history": advisory.get("case_history", []),
        "possible_explanations": advisory.get("possible_explanations", []),
        "next_steps": advisory.get("next_steps", []),
        "sources": advisory.get("sources", []),
        "advisory_text": advisory.get("advisory_text", ""),
        "follow_up_task": payload.get("follow_up_task", advisory.get("follow_up_task", "")),
        "follow_up_due_date": payload.get("follow_up_due_date", advisory.get("follow_up_due_date", "")),
    }

    # saveAdvisoryAndFollowUp raises ToolError when the record is not safe to
    # save (e.g. no sources); the view converts that into an HTTP error.
    return saveAdvisoryAndFollowUp(owner, save_payload)


def llm_configured():
    return llm_available()
