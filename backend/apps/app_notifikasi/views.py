from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notifikasi
from .serializers import NotifikasiSerializer


class NotifikasiListView(generics.ListAPIView):
    """GET /api/notifikasi/  → daftar notif user yang login."""
    serializer_class = NotifikasiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notifikasi.objects.filter(
            user_id=self.request.user.id
        ).order_by('-tanggal_kirim')


class UnreadCountView(APIView):
    """GET /api/notifikasi/unread-count/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notifikasi.objects.filter(
            user_id=request.user.id, is_read=False
        ).count()
        return Response({"unread_count": count})


class MarkAsReadView(APIView):
    """POST /api/notifikasi/<id>/read/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            notif = Notifikasi.objects.get(id=id, user_id=request.user.id)
        except Notifikasi.DoesNotExist:
            return Response({"error": "Notifikasi tidak ditemukan"},
                            status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save()
        return Response(NotifikasiSerializer(notif).data)


class MarkAllAsReadView(APIView):
    """POST /api/notifikasi/read-all/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notifikasi.objects.filter(
            user_id=request.user.id, is_read=False
        ).update(is_read=True)
        return Response({"updated": updated})
# Create your views here.
