from django.apps import AppConfig


class AppPembayaranConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.app_pembayaran'  # <-- Tambahkan 'apps.' di bagian ini
