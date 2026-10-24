from django.shortcuts import render
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from .serializer import FarmSerializer
from .models import Farm


class FarmViewSet(viewsets.ModelViewSet):
    serializer_class= FarmSerializer
    permission_classes= [IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(owner= self.request.user)

    def perform_create(self, serializer):
       if Farm.objects.filter(owner= self.request.user):
           raise serializers.ValidationError({
               "detail":"You already have a farm profile"
           })

       serializer.save(owner= self.request.user)

# Create your views here.
