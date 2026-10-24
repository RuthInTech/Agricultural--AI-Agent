"""Free-tier LLM integration for advisory drafting.

Policy (AGENTS.md §2, §3, §6):
  - Uses the Google Gemini API **free tier** only. The key comes from the
    `GEMINI_API_KEY` environment variable; when it is absent the function
    returns `None` and the caller falls back to the built-in rule-based
    drafter — no paid service is ever silently substituted.
  - The model is instructed to use ONLY the retrieved guidance/cases as its
    source of truth, to never invent source IDs, to distinguish observations
    from possibilities, to never present a possibility as a confirmed
    diagnosis, and to never prescribe pesticides or chemicals.

This module talks to the Gemini REST endpoint directly with `requests` to keep
dependencies minimal (no vendor SDK required).
"""

import json
import os

import requests

GEMINI_BASE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)
DEFAULT_MODEL = "gemini-2.5-flash"
REQUEST_TIMEOUT = 25  # seconds — bounded so a slow API cannot hang the workflow

SYSTEM_INSTRUCTION = """You are a cautious agricultural extension assistant for maize.
You are given ONLY the retrieved guidance notes and previous case histories below.
Hard rules:
- Use the retrieved guidance as your ONLY source of truth. Never invent facts,
  sources, or source IDs. If the evidence is insufficient, say so plainly.
- Separate OBSERVATIONS (what was reported) from POSSIBLE EXPLANATIONS.
- Never present a possibility as a confirmed diagnosis. Never use words like
  "confirmed", "definitely", "the cause is".
- Do NOT recommend any pesticide, chemical, or specific treatment. Recommend
  monitoring, recording, and consulting a qualified local agricultural
  professional where warranted.
- Every explanation must be grounded in a retrieved guidance note; cite its
  source_id in the text when relevant.
- Keep the tone plain and non-alarming. Write for a farmer and an extension
  worker.
Respond ONLY with a JSON object of this exact shape:
{
  "possible_explanations": [{"label": "Possibility", "text": "..."}],
  "next_steps": [{"text": "..."}],
  "advisory_text": "...",
  "follow_up_task": "...",
  "evidence_warning": null or "string when evidence is thin"
}"""


def _api_key():
    return os.environ.get("GEMINI_API_KEY", "").strip()


def _model():
    return os.environ.get("GEMINI_MODEL", "").strip() or DEFAULT_MODEL


def llm_available():
    """True when a Gemini key is configured (free tier)."""
    return bool(_api_key())


def _build_prompt(context):
    """Assemble the grounding context from the report, cases and guidance."""
    report = context.get("report", {})
    cases = context.get("cases", [])
    guidance = context.get("guidance", [])

    lines = ["REPORTED FIELD REPORT", f"Location: {report.get('location_name', '')}",
             f"Crop: {report.get('crop', 'Maize')}",
             f"Growth stage: {report.get('growth_stage', '')}",
             f"Symptoms: {report.get('symptoms', '')}"]
    conditions = report.get("field_conditions", {})
    for key in ("affected_area", "rainfall", "soil_condition", "date_observed"):
        if conditions.get(key):
            lines.append(f"{key.replace('_', ' ').title()}: {conditions[key]}")

    lines.append("\nPREVIOUS CASE HISTORIES (same location)")
    if cases:
        for case in cases:
            lines.append(
                f"- [{case.get('case_ref')}] {case.get('growth_stage', '')}: "
                f"{case.get('symptom_summary', '')} Outcome: {case.get('outcome_summary', '')}"
            )
    else:
        lines.append("- None recorded for this location.")

    lines.append("\nRETRIEVED GUIDANCE NOTES (source of truth)")
    if guidance:
        for note in guidance:
            lines.append(
                f"- [{note.get('source_id')}] {note.get('title')} "
                f"({note.get('section', '')}, {note.get('topic', '')}): {note.get('text')}"
            )
    else:
        lines.append("- None retrieved.")

    return "\n".join(lines)


def generate_advisory_draft(context):
    """Return advisory sections from the free-tier LLM, or None to fall back.

    Never raises: any missing key, HTTP error, timeout, or malformed response
    results in `None` so the caller uses the offline rule-based drafter.
    """
    key = _api_key()
    if not key:
        return None

    url = GEMINI_BASE.format(model=_model())
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": [{"text": _build_prompt(context)}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    try:
        response = requests.post(
            url, params={"key": key}, json=body, timeout=REQUEST_TIMEOUT
        )
        if response.status_code != 200:
            return None
        payload = response.json()
        text = payload["candidates"][0]["content"]["parts"][0]["text"]
        data = json.loads(text)
    except (requests.RequestException, KeyError, IndexError, ValueError, TypeError):
        return None

    if not isinstance(data, dict):
        return None

    # Light validation: coerce to the shape the workflow expects.
    return {
        "possible_explanations": data.get("possible_explanations")
        if isinstance(data.get("possible_explanations"), list)
        else [],
        "next_steps": data.get("next_steps")
        if isinstance(data.get("next_steps"), list)
        else [],
        "advisory_text": str(data.get("advisory_text") or ""),
        "follow_up_task": str(data.get("follow_up_task") or ""),
        "evidence_warning": data.get("evidence_warning"),
        "llm_used": True,
    }
