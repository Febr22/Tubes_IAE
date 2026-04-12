class MicroserviceRouter:
    """
    Router untuk memisahkan data antar database berdasarkan aplikasi (app_label).
    """
    route_app_labels = {
        # 'app_users': 'users_db',
        'app_katalog': 'katalog_db',
        'app_pesanan': 'pesanan_db',
        'app_pembayaran': 'pembayaran_db',
        'app_notifikasi': 'notifikasi_db',
        'app_pengiriman': 'pengiriman_db',
    }

    def db_for_read(self, model, **hints):
        return self.route_app_labels.get(model._meta.app_label, 'default')

    def db_for_write(self, model, **hints):
        return self.route_app_labels.get(model._meta.app_label, 'default')

    def allow_relation(self, obj1, obj2, **hints):
        # Mencegah relasi lintas database
        if obj1._state.db == obj2._state.db:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Menentukan migrasi app mana masuk ke DB mana
        target_db = self.route_app_labels.get(app_label, 'default')
        return db == target_db