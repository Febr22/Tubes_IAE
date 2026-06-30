# Tubes_IAE

Tubes_IAE adalah proyek implementasi algoritma kecerdasan buatan untuk tugas besar mata kuliah Intelijensia Buatan (IAE).

## 📋 Daftar Isi
- [Tentang Proyek](##tentang-proyek)
- [Fitur](##fitur)
- [Teknologi yang Digunakan](##teknologi-yang-digunakan)
- [Instalasi](##instalasi)
- [Penggunaan](##penggunaan)
- [Struktur Proyek](##struktur-proyek)
- [Kontribusi](##kontribusi)

## 🎯 Tentang Proyek

Tubes_IAE adalah implementasi dari berbagai algoritma kecerdasan buatan yang dipelajari dalam mata kuliah Intelijensia Buatan. Proyek ini dirancang untuk memberikan pemahaman praktis tentang bagaimana algoritma AI bekerja dan dapat diimplementasikan.

## ✨ Fitur

- Implementasi algoritma pencarian (Search Algorithms)
- Algoritma optimasi dan heuristik
- Sistem representasi pengetahuan
- Implementasi reasoning dan inference
- Interface yang user-friendly
- Dokumentasi lengkap untuk setiap algoritma

## 🛠️ Teknologi yang Digunakan

- **Python** (93.5%) - Backend dan logika utama
- **JavaScript** (2.8%) - Interaksi frontend
- **HTML** (2.7%) - Struktur halaman web
- **Lainnya** (1%) - Tools dan utilities

## 📥 Instalasi

### Prasyarat
- Python 3.7 atau lebih tinggi
- pip (Python package manager)
- Git

### Langkah Instalasi

1. Clone repository ini
```bash
git clone https://github.com/Febr22/Tubes_IAE.git
cd Tubes_IAE
```

2. Buat virtual environment (opsional tetapi recommended)
```bash
python -m venv venv
source venv/bin/activate  # Untuk Linux/Mac
# atau
venv\Scripts\activate  # Untuk Windows
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

## 🚀 Penggunaan

### Menjalankan Program Utama
```bash
python main.py
```

### Menjalankan Algoritma Spesifik
```bash
python -m src.algorithms.nama_algoritma
```

### Dokumentasi API
Lihat folder `docs/` untuk dokumentasi lengkap tentang setiap modul dan fungsi.

## 📁 Struktur Proyek

```
Tubes_IAE/
├── README.md
├── requirements.txt
├── main.py
├── src/
│   ├── __init__.py
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── search/
│   │   ├── optimization/
│   │   └── reasoning/
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── helpers.py
│   │   └── validators.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── core.py
│   └── gui/
│       ├── __init__.py
│       ├── app.py
│       └── templates/
├── tests/
│   ├── __init__.py
│   ├── test_algorithms.py
│   └── test_utils.py
├── docs/
│   ├── README.md
│   ├── algorithms.md
│   └── api_reference.md
└── examples/
    ├── example_1.py
    ├── example_2.py
    └── README.md
```

## 📝 Contoh Penggunaan

### Contoh Sederhana
```python
from src.algorithms.search import BFS

# Inisialisasi
graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': [],
    'F': []
}

# Jalankan BFS
result = BFS(graph, 'A', 'F')
print(f"Path: {result}")
```

Untuk contoh lebih lengkap, lihat folder `examples/`.

## 🧪 Testing

Jalankan unit tests dengan:
```bash
python -m pytest tests/ -v
```

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `docs/`:
- **algorithms.md** - Penjelasan detail setiap algoritma
- **api_reference.md** - Referensi API lengkap
- **examples/** - Contoh-contoh penggunaan

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📋 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file `LICENSE` untuk detail.

## 👤 Penulis

**Febr22**
- GitHub: [@Febr22](https://github.com/Febr22)
- Github: [@sairay-yah](https://github.com/sairay-yah)
- Github: [@cathyptr](https://github.com/cathyptr)
- Github: [@Imaderaditya05](https://github.com/Imaderaditya05)
- Github: [@kyaaddd](https://github.com/kyaaddd)
- Github: [@callmenoi](https://github.com/callmenoi)
- Github: 


Untuk pertanyaan atau saran, silakan buat issue di repository ini atau hubungi melalui email.

---

**Catatan**: Proyek ini adalah hasil dari tugas besar mata kuliah Intelijensia Buatan. Pastikan untuk selalu mengikuti kode etik akademis dan kepada dosen pembimbing.
