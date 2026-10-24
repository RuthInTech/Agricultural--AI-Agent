"""The three agent tools required by AGENTS.md §5.

Each tool validates its own inputs, only ever reports success when it actually
succeeded, and raises `ToolError` (never a silent failure) when it cannot
complete. Nothing here invents agricultural facts — tools only read stored,
clearly-sourced data.
"""

import re

from django.db import transaction

from .models import AdvisoryRecord, CaseHistory, GuidanceNote, Location
from .serializers import (
    AdvisoryRecordListSerializer,
    CaseHistorySerializer,
    GuidanceNoteSerializer,
)

# Bounded agent loop: the workflow never issues more than this many tool calls
# per advisory preview (AGENTS.md §5 — bounded agent/tool loop).
MAX_TOOL_CALLS = 6


class ToolError(Exception):
    """A tool received invalid input or could not complete safely."""

    def __init__(self, tool, message):
        self.tool = tool
        self.message = message
        super().__init__(f"{tool}: {message}")


def _tokenize(text):
    return [t for t in re.split(r"[^a-z0-9]+", (text or "").lower()) if t]


# Tool 1 --------------------------------------------------------------------------
def readCaseHistory(location_code=None, limit=5):
    """Retrieve previous case histories for a selected location.

    Returns a list of case dicts. Raises ToolError when no location code is
    given or the location does not exist — it never fabricates case data.
    """
    if not location_code or not str(location_code).strip():
        raise ToolError("readCaseHistory", "A location code is required.")

    try:
        location = Location.objects.get(code=str(location_code).strip())
    except Location.DoesNotExist:
        raise ToolError(
            "readCaseHistory", f"Location '{location_code}' was not found."
        )

    limit = max(1, min(int(limit or 5), 20))
    cases = list(
        location.cases.order_by("-recorded_on", "-id")[:limit]
    )
    return CaseHistorySerializer(cases, many=True).data


# Tool 2 --------------------------------------------------------------------------
def searchCropGuidance(query="", crop="Maize", limit=3):
    """Retrieve relevant guidance notes and source references.

    Simple, transparent token-overlap ranking over stored guidance. Returns a
    list of guidance dicts. Never invents a note: only stored notes are
    returned, each carrying its real `source_id`.
    """
    crop = (crop or "").strip() or "Maize"
    tokens = _tokenize(query)

    qs = GuidanceNote.objects.all()
    # Keep the requested crop plus crop-agnostic ("General") notes.
    qs = qs.filter(crop__iexact=crop) | qs.filter(crop__iexact="General")

    scored = []
    crop_lower = crop.lower()
    for note in qs.distinct():
        haystack = _tokenize(
            f"{note.title} {note.topic} {note.section} {note.text}"
        )
        if tokens:
            overlap = sum(1 for t in set(tokens) if t in haystack)
            # A note that is not about the crop and shares no token is dropped.
            if overlap == 0 and note.crop.lower() != crop_lower:
                continue
            score = overlap
        else:
            score = 1 if note.crop.lower() == crop_lower else 0
        if score > 0:
            scored.append((score, note))

    scored.sort(key=lambda pair: (-pair[0], pair[1].source_id))
    notes = [note for _, note in scored[: max(1, min(int(limit or 3), 10))]]
    return GuidanceNoteSerializer(notes, many=True).data


# Tool 3 --------------------------------------------------------------------------
_REQUIRED_SAVE_FIELDS = ("symptoms", "advisory_text")


def saveAdvisoryAndFollowUp(owner, payload):
    """Persist an approved advisory and its follow-up task.

    This is the ONLY tool that writes data, and it is invoked exclusively from
    the confirm step after explicit user approval. It refuses to save a record
    that carries no evidence (sources) or no advisory text, and it will not
    silently drop fields.
    """
    if owner is None or not owner.is_authenticated:
        raise ToolError(
            "saveAdvisoryAndFollowUp", "An authenticated user is required."
        )
    if not isinstance(payload, dict):
        raise ToolError(
            "saveAdvisoryAndFollowUp", "The payload must be an object."
        )

    for field in _REQUIRED_SAVE_FIELDS:
        if not str(payload.get(field) or "").strip():
            raise ToolError(
                "saveAdvisoryAndFollowUp", f"'{field}' is required to save."
            )

    sources = payload.get("sources") or []
    if not isinstance(sources, list) or len(sources) == 0:
        # Evidence and safety (AGENTS.md §6): never store an advisory with no
        # source references.
        raise ToolError(
            "saveAdvisoryAndFollowUp",
            "At least one source reference is required before saving.",
        )

    field_conditions = payload.get("field_conditions") or {}
    if not isinstance(field_conditions, dict):
        raise ToolError(
            "saveAdvisoryAndFollowUp", "'field_conditions' must be an object."
        )

    try:
        with transaction.atomic():
            record = AdvisoryRecord.objects.create(
                owner=owner,
                location_ref=str(payload.get("location_ref") or ""),
                location_name=str(payload.get("location_name") or ""),
                farmer_name=str(payload.get("farmer_name") or ""),
                crop=str(payload.get("crop") or "Maize"),
                growth_stage=str(payload.get("growth_stage") or ""),
                symptoms=str(payload.get("symptoms") or "").strip(),
                field_conditions=field_conditions,
                observations=payload.get("observations") or [],
                case_history=payload.get("case_history") or [],
                possible_explanations=payload.get("possible_explanations") or [],
                next_steps=payload.get("next_steps") or [],
                sources=sources,
                advisory_text=str(payload.get("advisory_text") or "").strip(),
                follow_up_task=str(payload.get("follow_up_task") or "").strip(),
                follow_up_due_date=str(payload.get("follow_up_due_date") or ""),
                approval_status="approved",
                follow_up_status="pending",
            )
    except Exception as exc:  # pragma: no cover - defensive
        raise ToolError(
            "saveAdvisoryAndFollowUp", f"The record could not be saved: {exc}"
        )

    return AdvisoryRecordListSerializer(record).data
