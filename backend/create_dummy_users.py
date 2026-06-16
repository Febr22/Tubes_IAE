# backend/create_dummy_users.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Hapus akun lama jika ada (optional)
User.objects.filter(email__in=['buyer@test.com', 'admin@test.com']).delete()

# Buat akun Buyer/Pelanggan
buyer = User.objects.create_user(
    email='buyer@test.com',
    username='pembeli1',
    password='password123',
    role='buyer',
    first_name='Budi',
    last_name='Setiawan',
    no_telepon='081234567890',
    alamat_utama='Jalan Merdeka No. 123, Jakarta'
)
print(f"[OK] Akun Buyer dibuat: {buyer.email}")

# Buat akun Admin
admin = User.objects.create_user(
    email='admin@test.com',
    username='adminstore',
    password='admin123456',
    role='admin',
    first_name='Admin',
    last_name='UnivStore',
    no_telepon='082111111111',
    alamat_utama='Jalan Admin No. 1, Jakarta'
)
print(f"[OK] Akun Admin dibuat: {admin.email}")

print("\n" + "="*50)
print("AKUN SIAP DITEST:")
print("="*50)
print("\n[User] AKUN BUYER (Pelanggan):")
print(f"  Email    : buyer@test.com")
print(f"  Password : password123")
print(f"  Akses   : https://localhost:3000/login")
print("\n[Admin] AKUN ADMIN (Penjual):")
print(f"  Email    : admin@test.com")
print(f"  Password : admin123456")
print(f"  Akses   : https://localhost:3000/login")
print(f"  Django   : http://localhost:8000/admin/")
print("="*50 + "\n")