from rest_framework import serializers

from .models import AdvisoryRecord, CaseHistory, GuidanceNote, Location


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "code", "name", "demo"]


class CaseHistorySerializer(serializers.ModelSerializer):
    # The frontend expects an `id` that is a readable case reference and a
    # flattened `location` name, so expose both explicitly.
    id = serializers.CharField(source="case_ref", read_only=True)
    location = serializers.CharField(source="location.name", read_only=True)
    location_ref = serializers.CharField(source="location.code", read_only=True)
    symptom_summary = serializers.ReadOnlyField()

    class Meta:
        model = CaseHistory
        fields = [
            "id",
            "case_ref",
            "location",
            "location_ref",
            "farmer_name",
            "crop",
            "growth_stage",
            "symptom_summary",
            "recorded_facts",
            "outcome_summary",
            "previous_follow_ups",
            "recorded_on",
            "demo",
        ]


class GuidanceNoteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="source_id", read_only=True)

    class Meta:
        model = GuidanceNote
        fields = [
            "id",
            "source_id",
            "title",
            "topic",
            "crop",
            "section",
            "text",
            "demo",
        ]


class AdvisoryRecordListSerializer(serializers.ModelSerializer):
    location = serializers.CharField(source="location_name", read_only=True)

    class Meta:
        model = AdvisoryRecord
        fields = [
            "id",
            "location",
            "location_ref",
            "farmer_name",
            "crop",
            "growth_stage",
            "symptom_summary",
            "approval_status",
            "follow_up_status",
            "created_at",
        ]


class AdvisoryRecordDetailSerializer(AdvisoryRecordListSerializer):
    class Meta(AdvisoryRecordListSerializer.Meta):
        model = AdvisoryRecord
        fields = AdvisoryRecordListSerializer.Meta.fields + [
            "symptoms",
            "field_conditions",
            "observations",
            "case_history",
            "possible_explanations",
            "next_steps",
            "sources",
            "advisory_text",
            "follow_up_task",
            "follow_up_due_date",
            "updated_at",
        ]
