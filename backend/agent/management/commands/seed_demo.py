"""Seed the clearly-labelled fictional demonstration data for the maize demo.

Idempotent (update_or_create), so it is safe to re-run. All content is
fictional demonstration data for the hackathon (AGENTS.md §6).
"""

from datetime import date

from django.core.management.base import BaseCommand

from agent.models import CaseHistory, GuidanceNote, Location

GUIDANCE = [
    {
        "source_id": "GUIDE-001",
        "title": "Yellowing leaves",
        "topic": "Nutrition and water",
        "crop": "Maize",
        "section": "Section 2.1",
        "text": (
            "Yellow leaves can have multiple possible causes. Record which leaves are affected, "
            "the crop growth stage, the distribution of symptoms, the soil condition, and recent "
            "field conditions. Do not conclude the cause from leaf colour alone."
        ),
    },
    {
        "source_id": "GUIDE-002",
        "title": "Ragged holes and leaf chewing",
        "topic": "Pests",
        "crop": "Maize",
        "section": "Section 5.2",
        "text": (
            "Holes or chewed areas on leaves often indicate pest activity such as Fall Armyworm "
            "larvae in the whorl. Record the percentage of affected plants, presence of frass, and "
            "recent weather patterns. Avoid assuming chemical treatment is necessary without "
            "checking infestation levels."
        ),
    },
    {
        "source_id": "GUIDE-003",
        "title": "Midday leaf rolling and wilt",
        "topic": "Water management",
        "crop": "Maize",
        "section": "Section 3.4",
        "text": (
            "Leaves rolling inward during midday indicate moisture stress or drought conditions. "
            "Record whether leaves recover overnight, soil moisture levels, and the current growth "
            "stage (especially around tasseling). Distinguish temporary heat stress from permanent "
            "water deficit."
        ),
    },
]

LOCATIONS = [
    {"code": "SITE-A", "name": "Site A"},
    {"code": "SITE-B", "name": "Site B"},
    {"code": "SITE-C", "name": "Site C"},
]

CASES = [
    {
        "case_ref": "CASE-001",
        "location_code": "SITE-A",
        "farmer_name": "Abebe Tadesse",
        "crop": "Maize",
        "growth_stage": "Vegetative (V8)",
        "recorded_facts": "Farmer reported yellow lower leaves following heavy rain. No insect frass observed.",
        "outcome_summary": "Drainage was improved and re-inspection was scheduled.",
        "recorded_on": date(2026, 10, 10),
        "previous_follow_ups": [
            {"date": "2026-10-10", "task": "Monitor if yellowing spreads from lower leaves upward.", "status": "Completed"}
        ],
    },
    {
        "case_ref": "CASE-002",
        "location_code": "SITE-B",
        "farmer_name": "Tigist Bekele",
        "crop": "Maize",
        "growth_stage": "Early Whorl",
        "recorded_facts": "Observed scattered ragged holes in central leaves during dry spell inspection.",
        "outcome_summary": "Monitoring count increased to inspect more whorls for larvae.",
        "recorded_on": date(2026, 10, 18),
        "previous_follow_ups": [
            {"date": "2026-10-18", "task": "Inspect 20 random plant whorls for larvae.", "status": "Pending"}
        ],
    },
]


class Command(BaseCommand):
    help = "Seed clearly-labelled fictional demo data (locations, guidance notes, case histories)."

    def handle(self, *args, **options):
        for item in LOCATIONS:
            Location.objects.update_or_create(
                code=item["code"], defaults={"name": item["name"], "demo": True}
            )
        self.stdout.write(self.style.SUCCESS(f"Locations: {Location.objects.count()}"))

        for item in GUIDANCE:
            GuidanceNote.objects.update_or_create(
                source_id=item["source_id"],
                defaults={k: v for k, v in item.items() if k != "source_id"} | {"demo": True},
            )
        self.stdout.write(self.style.SUCCESS(f"Guidance notes: {GuidanceNote.objects.count()}"))

        for item in CASES:
            location = Location.objects.get(code=item["location_code"])
            CaseHistory.objects.update_or_create(
                case_ref=item["case_ref"],
                defaults={
                    "location": location,
                    "farmer_name": item["farmer_name"],
                    "crop": item["crop"],
                    "growth_stage": item["growth_stage"],
                    "recorded_facts": item["recorded_facts"],
                    "outcome_summary": item["outcome_summary"],
                    "recorded_on": item["recorded_on"],
                    "previous_follow_ups": item["previous_follow_ups"],
                    "demo": True,
                },
            )
        self.stdout.write(self.style.SUCCESS(f"Case histories: {CaseHistory.objects.count()}"))
        self.stdout.write(self.style.WARNING("All seeded content is FICTIONAL demonstration data."))
