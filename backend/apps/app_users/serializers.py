from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Alamat # <-- Import model Alamat

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'role', 'no_telepon', 'alamat_utama', 'first_name', 'last_name', 'foto_profil')
        read_only_fields = ('id', 'email', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'buyer')
        )
        return user

# --- Tambahan Serializer untuk Alamat ---
class AlamatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alamat
        fields = [
            'id', 'nama_penerima', 'no_telepon', 'alamat_lengkap', 
            'kota_kabupaten', 'provinsi', 'kode_pos', 'is_utama', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
