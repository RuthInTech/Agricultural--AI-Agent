from django.contrib import admin

from .models import AdvisoryRecord, CaseHistory, GuidanceNote, Location

admin.site.register(Location)
admin.site.register(CaseHistory)
admin.site.register(GuidanceNote)
admin.site.register(AdvisoryRecord)
