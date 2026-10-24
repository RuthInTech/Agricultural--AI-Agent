from django.conf import settings
from django.db import models


class Location(models.Model):
    """A demo reporting location (clearly labelled fictional demonstration data)."""

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    # Every seeded location is fictional demonstration data for the hackathon.
    demo = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "locations"
        ordering = ["name"]

    def __str__(self):
        return self.name


class CaseHistory(models.Model):
    """A previous case recorded at a location — the `readCaseHistory` source."""

    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="cases"
    )
    case_ref = models.CharField(max_length=50, unique=True)
    farmer_name = models.CharField(max_length=120, blank=True)
    crop = models.CharField(max_length=60, default="Maize")
    growth_stage = models.CharField(max_length=80, blank=True)
    recorded_facts = models.TextField()
    outcome_summary = models.TextField(blank=True)
    previous_follow_ups = models.JSONField(default=list, blank=True)
    recorded_on = models.DateField(null=True, blank=True)
    demo = models.BooleanField(default=True)

    class Meta:
        ordering = ["-recorded_on", "-id"]

    def __str__(self):
        return self.case_ref


class GuidanceNote(models.Model):
    """A stored guidance note — the `searchCropGuidance` source of truth."""

    source_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    topic = models.CharField(max_length=100, blank=True)
    crop = models.CharField(max_length=60, default="Maize")
    section = models.CharField(max_length=50, blank=True)
    text = models.TextField()
    demo = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "guidance notes"
        ordering = ["source_id"]

    def __str__(self):
        return f"{self.source_id} — {self.title}"


class AdvisoryRecord(models.Model):
    """A saved, approved advisory + follow-up — the `saveAdvisoryAndFollowUp` target.

    A record is only ever written through the confirm step after the user has
    explicitly approved the advisory (AGENTS.md §4 steps 8-9).
    """

    APPROVAL_STATUS = [
        ("approved", "Approved"),
        ("awaiting_approval", "Awaiting approval"),
        ("rejected", "Rejected"),
    ]
    FOLLOW_UP_STATUS = [
        ("pending", "Pending"),
        ("in_progress", "In progress"),
        ("completed", "Completed"),
        ("overdue", "Overdue"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="advisories",
    )

    # Submitted report
    location_ref = models.CharField(max_length=50, blank=True)
    location_name = models.CharField(max_length=120, blank=True)
    farmer_name = models.CharField(max_length=120, blank=True)
    crop = models.CharField(max_length=60, default="Maize")
    growth_stage = models.CharField(max_length=80, blank=True)
    symptoms = models.TextField()
    field_conditions = models.JSONField(default=dict, blank=True)

    # Generated advisory (evidence-referenced, edited by the user before save)
    observations = models.JSONField(default=list, blank=True)
    case_history = models.JSONField(default=list, blank=True)
    possible_explanations = models.JSONField(default=list, blank=True)
    next_steps = models.JSONField(default=list, blank=True)
    sources = models.JSONField(default=list, blank=True)
    advisory_text = models.TextField(blank=True)

    # Follow-up
    follow_up_task = models.TextField(blank=True)
    follow_up_due_date = models.CharField(max_length=30, blank=True)

    approval_status = models.CharField(
        max_length=30, choices=APPROVAL_STATUS, default="approved"
    )
    follow_up_status = models.CharField(
        max_length=30, choices=FOLLOW_UP_STATUS, default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Advisory #{self.pk} ({self.location_name or 'unknown location'})"

    @property
    def symptom_summary(self):
        text = (self.symptoms or "").strip()
        return text if len(text) <= 160 else text[:157].rstrip() + "..."
