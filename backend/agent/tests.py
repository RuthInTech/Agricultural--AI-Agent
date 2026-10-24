from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import AdvisoryRecord, CaseHistory, GuidanceNote, Location
from .services import ReportValidationError, run_advisory_preview, validate_report
from .tools import ToolError, readCaseHistory, saveAdvisoryAndFollowUp, searchCropGuidance

User = get_user_model()


def _seed():
    loc = Location.objects.create(code="SITE-A", name="Site A")
    GuidanceNote.objects.create(
        source_id="GUIDE-001", title="Yellowing leaves", topic="Nutrition",
        crop="Maize", section="Section 2.1",
        text="Yellow leaves can have multiple causes; record distribution.",
    )
    CaseHistory.objects.create(
        location=loc, case_ref="CASE-001", farmer_name="Abebe", crop="Maize",
        growth_stage="V8", recorded_facts="Yellow lower leaves after rain.",
        outcome_summary="Drainage improved.", recorded_on=date(2026, 10, 10),
    )
    return loc


def _report(loc):
    return {
        "location_ref": loc.code,
        "location_name": loc.name,
        "farmer_name": "Abebe",
        "crop": "Maize",
        "growth_stage": "Vegetative (V8)",
        "symptoms": "Yellow leaves on the lower canopy following heavy rain.",
        "field_conditions": {"rainfall": "Heavy rain for 3 days", "soil_condition": "Moist"},
    }


class ToolTests(TestCase):
    def setUp(self):
        self.loc = _seed()

    def test_read_case_history_returns_cases_for_location(self):
        cases = readCaseHistory(location_code=self.loc.code)
        self.assertEqual(len(cases), 1)
        self.assertEqual(cases[0]["case_ref"], "CASE-001")

    def test_read_case_history_rejects_unknown_location(self):
        with self.assertRaises(ToolError):
            readCaseHistory(location_code="NOPE")

    def test_search_crop_guidance_returns_source_ids(self):
        notes = searchCropGuidance(query="yellow leaves", crop="Maize")
        self.assertTrue(any(n["source_id"] == "GUIDE-001" for n in notes))

    def test_save_tool_requires_sources(self):
        user = User.objects.create_user(username="u1", email="u1@x.com", password="pass12345")
        with self.assertRaises(ToolError):
            saveAdvisoryAndFollowUp(user, {"symptoms": "yellow", "advisory_text": "text", "sources": []})


class WorkflowTests(TestCase):
    def setUp(self):
        self.loc = _seed()

    def test_validate_report_flags_missing_fields(self):
        missing = validate_report({"location_ref": "SITE-A"})
        fields = {m["field"] for m in missing}
        self.assertIn("growth_stage", fields)
        self.assertIn("symptoms", fields)
        self.assertIn("field_conditions", fields)

    def test_preview_returns_draft_and_persists_nothing(self):
        before = AdvisoryRecord.objects.count()
        draft = run_advisory_preview(_report(self.loc))
        self.assertEqual(draft["status"], "awaiting_approval")
        self.assertTrue(draft["sources"])  # grounded in retrieved guidance
        self.assertEqual(AdvisoryRecord.objects.count(), before)  # preview never saves

    def test_preview_raises_on_invalid_report(self):
        with self.assertRaises(ReportValidationError):
            run_advisory_preview({"location_ref": "SITE-A"})


class EndpointTests(TestCase):
    def setUp(self):
        self.loc = _seed()
        self.client = APIClient()
        self.user = User.objects.create_user(username="farmer", email="f@x.com", password="pass12345")

    def test_locations_public(self):
        res = self.client.get(reverse("agent:locations"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_preview_endpoint_returns_400_with_missing(self):
        res = self.client.post(reverse("agent:advisory-preview"), {"location_ref": "SITE-A"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("missing", res.json())

    def test_confirm_requires_auth(self):
        res = self.client.post(
            reverse("agent:advisory-confirm"),
            {"confirmed": True, "report": _report(self.loc), "advisory": {"sources": []}},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_full_confirm_and_list_flow(self):
        self.client.force_authenticate(user=self.user)
        draft = run_advisory_preview(_report(self.loc))
        payload = {
            "confirmed": True,
            "report": _report(self.loc),
            "advisory": draft,
            "follow_up_task": "Re-inspect",
            "follow_up_due_date": "2026-11-01",
        }
        res = self.client.post(reverse("agent:advisory-confirm"), payload, format="json")
        self.assertEqual(res.status_code, 201)
        record_id = res.json()["id"]

        listing = self.client.get(reverse("agent:advisory-list"))
        self.assertEqual(len(listing.json()), 1)

        detail = self.client.get(reverse("agent:advisory-detail", args=[record_id]))
        self.assertEqual(detail.status_code, 200)
        self.assertIn("advisory_text", detail.json())
