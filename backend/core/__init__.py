import pymysql

# 1. Mengelabui Django agar mengira versi PyMySQL sudah memenuhi syarat (minimal 2.2.1)
pymysql.version_info = (2, 2, 1, 'final', 0)
pymysql.install_as_MySQLdb()

# 2. Mematikan sensor pengecekan versi MySQL/MariaDB bawaan Django
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None