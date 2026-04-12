from django.db import models

class Notifikasi(models.Model):
    user_id = models.IntegerField() # Siapa yang menerima notif
    judul = models.CharField(max_length=255)
    pesan = models.TextField()
    is_read = models.BooleanField(default=False)
    tanggal_kirim = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tabel_notifikasi'