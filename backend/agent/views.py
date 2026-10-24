from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView

from .models import AdvisoryRecord, CaseHistory, Location
from .serializers import (
    AdvisoryRecordDetailSerializer,
    AdvisoryRecordListSerializer,
    CaseHistorySerializer,
    LocationSerializer,
)
from .services import (
    ReportValidationError,
    confirm_and_save,
    run_advisory_preview,
)
from .tools import ToolError, searchCropGuidance


class LocationListView(APIView):
    """GET /api/locations/ — available reporting locations."""

    permission_classes = [AllowAny]

    def get(self, request):
        locations = Location.objects.all()
        return Response(LocationSerializer(locations, many=True).data)


class CaseListView(APIView):
    """GET /api/cases/?location_id=CODE — previous case histories.

    `readCaseHistory` under the hood: filtered by location code when given,
    otherwise the most recent cases across all locations (read-only).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        location_code = request.query_params.get("location_id")
        qs = CaseHistory.objects.select_related("location").all()
        if location_code:
            qs = qs.filter(location__code=location_code)
        cases = list(qs[:20])
        return Response(CaseHistorySerializer(cases, many=True).data)


class GuidanceSearchView(APIView):
    """GET /api/guidance/search/?q=&crop= — `searchCropGuidance` under the hood."""

    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "")
        crop = request.query_params.get("crop", "Maize")
        try:
            notes = searchCropGuidance(query=query, crop=crop)
        except ToolError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(notes)


class AdvisoryPreviewView(APIView):
    """POST /api/advisories/preview/ — build a cautious advisory draft.

    NEVER persists anything. Returns 400 with a `missing` list when essential
    report information is absent so the user can be asked for it.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        report = request.data if isinstance(request.data, dict) else {}
        try:
            draft = run_advisory_preview(report)
        except ReportValidationError as exc:
            return Response(
                {"detail": "The report is missing required information.", "missing": exc.missing},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ToolError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(draft)


class AdvisoryConfirmView(APIView):
    """POST /api/advisories/confirm/ — persist ONLY after explicit approval.

    Requires authentication; the record is owned by the requesting user.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.data.get("confirmed"):
            return Response(
                {"detail": "Explicit confirmation is required before saving."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            record = confirm_and_save(request.user, request.data)
        except ToolError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(record, status=status.HTTP_201_CREATED)


class AdvisoryListView(APIView):
    """GET /api/advisories/ — the requesting user's saved records."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = AdvisoryRecord.objects.filter(owner=request.user)
        return Response(AdvisoryRecordListSerializer(records, many=True).data)


class AdvisoryDetailView(RetrieveAPIView):
    """GET /api/advisories/{id}/ — reopen one saved record (owner only)."""

    permission_classes = [IsAuthenticated]
    serializer_class = AdvisoryRecordDetailSerializer
    queryset = AdvisoryRecord.objects.all()

    def get_queryset(self):
        return AdvisoryRecord.objects.filter(owner=self.request.user)
