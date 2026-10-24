from django.db import models

class Crop(models.Model):
    name= models.CharField(max_length= 100)
    icon = models.CharField(max_length=10, blank=True)

    category = models.CharField(max_length= 100)
    growing_period= models.CharField(max_length=100)
    water_requirement = models.CharField(max_length=100)
    ph_min = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)

    ph_max = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    suitable_soil_types = models.JSONField(default=list, blank =True)

    recommended_fertilizer = models.CharField(max_length=200, blank=True)
    notes= models.TextField(blank=True)

    def __str__(self):
        return self.name
# Create your models here.
