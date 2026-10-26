
from django.db import models


class FarmerReport(models.Model):
    farmer_name = models.CharField(max_length=150)
    crop = models.CharField(max_length=100)
    growth_stage = models.CharField(max_length=150)
    symptoms = models.TextField()
    field_conditions = models.TextField()

    location_id = models.CharField(max_length=50)
    case_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.farmer_name} - {self.crop} - {self.location_id}"


# Create your models here.
