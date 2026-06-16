from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'no_telepon', 'alamat_utama', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Informasi E-Commerce', {'fields': ('role', 'no_telepon', 'alamat_utama')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informasi E-Commerce', {'fields': ('role', 'no_telepon', 'alamat_utama')}),
    )

