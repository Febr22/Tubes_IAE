from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

# Import serializers dan models yang dibutuhkan
from .serializers import RegisterSerializer, UserSerializer, AlamatSerializer
from .models import Alamat

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# Menggunakan RetrieveUpdateAPIView agar bisa Edit Profil
class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        # Mengembalikan data user yang sedang memiliki token (yang sedang login)
        return self.request.user

# --- Tambahan ViewSet untuk Fitur Alamat ---
class AlamatViewSet(viewsets.ModelViewSet):
    serializer_class = AlamatSerializer
    permission_classes = [IsAuthenticated] # Wajib login

    def get_queryset(self):
        # Hanya menampilkan daftar alamat milik user yang sedang login saat ini
        return Alamat.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Otomatis simpan alamat untuk user yang sedang login
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        # Opsional: Jika kamu ingin memberikan logika khusus saat alamat dihapus, bisa ditambahkan di sini.
        # Saat ini akan langsung menggunakan fungsi hapus bawaan (delete).
        instance.delete()