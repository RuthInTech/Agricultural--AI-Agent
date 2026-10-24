from django.db import models
from django.conf import settings

class Farm(models.Model):
    owner= models.OneToOneField(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE,
                                related_name='farm')

    farm_name = models.CharField(max_length=150)
    location= models.CharField(max_length=255)
    farm_size= models.CharField(max_length=100)
    soil_type= models.CharField(max_length=150, blank=True)
    elevation= models.CharField(max_length=100, blank=True)
    topography= models.CharField(max_length=150, blank=True)
    water_availability= models.CharField(max_length=200, blank=True)
   
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at= models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.farm_name

# Create your models here.
