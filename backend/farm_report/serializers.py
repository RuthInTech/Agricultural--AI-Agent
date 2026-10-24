
from rest_framework import serializers
from .models import FarmerReport


class FarmerReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerReport
        fields = [
            "id",
            "farmer_name",
            "crop",
            "growth_stage",
            "symptoms",
            "field_conditions",
            "location_id",
            "case_id",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_farmer_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Farmer name cannot be empty."
            )
        return value.strip()

    def validate_symptoms(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Please provide at least 10 characters describing symptoms."
            )
        return value.strip()
