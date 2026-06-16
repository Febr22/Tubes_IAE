import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class LokasiView(APIView):
    """
    API untuk mendapatkan daftar provinsi dan kota dari RajaOngkir.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        api_key = getattr(settings, 'RAJAONGKIR_API_KEY', None)
        if not api_key or api_key == 'Taruh_API_Key_RajaOngkir_Anda_Disini':
            return Response({"error": "API_KEY belum diatur di .env"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        headers = {
            'key': api_key
        }

        try:
            # Mencari destinasi berdasarkan query
            search = request.GET.get('search', '')
            
            # Komerce API merekomendasikan minimal 3 karakter untuk pencarian yang efektif
            if len(search) < 3:
                return Response({"status": "success", "data": []}, status=status.HTTP_200_OK)

            # Menggunakan endpoint RajaOngkir Komerce v1
            komerce_url = f"https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search={search}"
            resp = requests.get(komerce_url, headers=headers)
            
            if resp.status_code == 401:
                 return Response({"error": "API Key Anda tidak valid (Unauthenticated). Pastikan API Key Shipping Cost sudah benar."}, status=status.HTTP_401_UNAUTHORIZED)
            
            resp.raise_for_status()
            data = resp.json()
            
            # Komerce RajaOngkir merespons dengan {"data": [{"id": 73914, "label": "KEDATON, ..."}, ...]}
            # Ubah label menjadi name agar sesuai dengan frontend
            formatted_data = []
            for item in data.get('data', []):
                item['name'] = item.get('label')
                formatted_data.append(item)
            
            return Response({"status": "success", "data": formatted_data}, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            error_message = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_message = error_data.get('message', str(e))
                except Exception:
                    pass
            return Response({"error": f"Gagal mengambil data dari Komerce: {error_message}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CekOngkirView(APIView):
    """
    API untuk mengecek ongkos kirim menggunakan RajaOngkir.
    POST data: { "destination": "153", "weight": 2000, "courier": "jne" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        api_key = getattr(settings, 'RAJAONGKIR_API_KEY', None)
        if not api_key or api_key == 'Taruh_API_Key_RajaOngkir_Anda_Disini':
            return Response({"error": "RAJAONGKIR_API_KEY belum diatur di .env"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        destination = request.data.get('destination')
        courier = request.data.get('courier', '').lower()
        weight = request.data.get('weight', 2000) # Default 2kg
        
        # Asumsi toko (origin) di Batununggal, Bandung Kidul (ID Komerce: 4866)
        origin = request.data.get('origin', '4866') 

        if not destination or not courier:
            return Response({"error": "Destination dan courier wajib diisi."}, status=status.HTTP_400_BAD_REQUEST)

        headers = {
            'key': api_key
        }

        # Menggunakan format parameter RajaOngkir klasik untuk endpoint Komerce RajaOngkir
        payload = {
            'origin': origin, 
            'destination': destination,
            'weight': weight, # dalam gram
            'courier': courier
        }

        try:
            resp = requests.post("https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost", data=payload, headers=headers)
            
            if resp.status_code == 401:
                 return Response({"error": "API Key Anda tidak valid (Unauthenticated)."}, status=status.HTTP_401_UNAUTHORIZED)
            
            resp.raise_for_status()
            data = resp.json()
            
            # Komerce RajaOngkir merespons {"data": [{"code": "jne", "service": "REG", "cost": 15000, "etd": "2-3 day"}]}
            results = data.get('data', [])
            
            # Kita filter kurir jika diminta
            if courier:
                results = [r for r in results if r.get('code', '').lower() == courier or r.get('courier', '').lower() == courier]
                
            return Response({"status": "success", "results": results}, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            error_message = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_message = error_data.get('message', str(e))
                except Exception:
                    pass
            return Response({"error": f"Komerce Error: {error_message}"}, status=status.HTTP_400_BAD_REQUEST)
