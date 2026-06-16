import hashlib
import time
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import midtransclient

from .models import Pembayaran
from .serializers import PembayaranSerializer
from apps.app_pesanan.models import Order
from apps.app_katalog.models import Produk

logger = logging.getLogger(__name__)

# Helper untuk inisiasi SDK Midtrans Snap
def get_midtrans_snap_client():
    return midtransclient.Snap(
        is_production=settings.MIDTRANS_IS_PRODUCTION,
        server_key=settings.MIDTRANS_SERVER_KEY,
        client_key=settings.MIDTRANS_CLIENT_KEY
    )

def update_payment_and_order_status(midtrans_order_id, transaction_status, payment_type, transaction_id):
    """
    Helper untuk memperbarui status Pembayaran dan Order berdasarkan respon Midtrans.
    """
    try:
        # Format midtrans_order_id: ORDER-id_order-timestamp
        parts = midtrans_order_id.split('-')
        if len(parts) >= 2 and parts[0] == 'ORDER':
            order_id = int(parts[1])
        else:
            logger.error(f"Format order_id tidak valid: {midtrans_order_id}")
            return None
    except (IndexError, ValueError) as e:
        logger.error(f"Gagal memparsing order_id dari {midtrans_order_id}: {str(e)}")
        return None

    # Cari atau buat record Pembayaran
    pembayaran, created = Pembayaran.objects.get_or_create(order_id=order_id)
    
    # Cari record Order
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        order = None
        logger.warning(f"Order dengan ID {order_id} tidak ditemukan.")

    pembayaran.midtrans_order_id = midtrans_order_id
    pembayaran.transaction_id = transaction_id
    pembayaran.metode_pembayaran_midtrans = payment_type
    pembayaran.status_transaksi = transaction_status

    # Logika penentuan status
    if transaction_status in ['capture', 'settlement']:
        pembayaran.is_lunas = True
        if order:
            order.status = 'diproses'
            order.save()
    elif transaction_status in ['deny', 'cancel', 'expire']:
        pembayaran.is_lunas = False
        if order:
            order.status = 'dibatalkan'
            order.save()
    elif transaction_status == 'pending':
        pembayaran.is_lunas = False
        if order:
            order.status = 'pending'
            order.save()

    pembayaran.save()
    return pembayaran


class GenerateSnapTokenView(APIView):
    """
    Endpoint untuk generate Snap Token dari Midtrans.
    POST /api/pembayaran/token/
    Request Body: { "order_id": 1 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response(
                {"error": "order_id wajib disertakan."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Ambil detail Order
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order tidak ditemukan."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Cek apakah pembayaran untuk order ini sudah lunas
        try:
            existing_payment = Pembayaran.objects.get(order_id=order_id)
            if existing_payment.is_lunas:
                return Response(
                    {"message": "Order ini sudah dibayar lunas.", "is_lunas": True},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Jika token sudah ada dan status masih pending, kita bisa kirim token lama untuk efisiensi
            if existing_payment.snap_token and existing_payment.status_transaksi == 'pending':
                return Response({
                    "snap_token": existing_payment.snap_token,
                    "midtrans_order_id": existing_payment.midtrans_order_id,
                    "amount": existing_payment.gross_amount
                }, status=status.HTTP_200_OK)
        except Pembayaran.DoesNotExist:
            existing_payment = None

        # Jika belum ada atau butuh transaksi baru, buat Snap Token baru
        try:
            snap_client = get_midtrans_snap_client()
            
            # Buat order ID unik untuk Midtrans (Format: ORDER-orderId-timestamp)
            midtrans_order_id = f"ORDER-{order_id}-{int(time.time())}"
            
            # Hitung detail item dan total harga secara dinamis
            item_details = []
            total_items_price = 0
            order_items = order.items.all()
            
            for item in order_items:
                try:
                    produk = Produk.objects.get(id=item.laptop_id)
                    nama_produk = produk.nama
                except Produk.DoesNotExist:
                    nama_produk = f"Laptop ID {item.laptop_id}"
                
                price = int(item.harga_saat_beli)
                qty = int(item.jumlah)
                total_items_price += price * qty
                
                item_details.append({
                    "id": str(item.laptop_id),
                    "price": price,
                    "quantity": qty,
                    "name": nama_produk[:50] # Midtrans max name length is 50 chars
                })
            
            # Deteksi diskon dari selisih total_items_price dengan order.total_harga
            discrepancy = total_items_price - int(order.total_harga)
            if discrepancy > 0:
                item_details.append({
                    "id": "discount",
                    "price": -int(discrepancy),
                    "quantity": 1,
                    "name": "Diskon Voucher"
                })
            
            # Tambahkan Biaya Layanan Flat Rp 5.000
            biaya_layanan = 5000
            item_details.append({
                "id": "biaya-layanan",
                "price": biaya_layanan,
                "quantity": 1,
                "name": "Biaya Layanan"
            })
            
            # Tambahkan Ongkos Kirim
            ongkos_kirim = int(order.ongkos_kirim) if order.ongkos_kirim else 0
            if ongkos_kirim > 0:
                item_details.append({
                    "id": "ongkos-kirim",
                    "price": ongkos_kirim,
                    "quantity": 1,
                    "name": f"Ongkos Kirim ({order.kurir.upper() if order.kurir else 'Kurir'})"
                })
            
            gross_amount = total_items_price - max(0, discrepancy) + biaya_layanan + ongkos_kirim

            # Detail Pelanggan dari User login
            user = request.user
            customer_details = {
                "first_name": user.username,
                "email": user.email,
            }
            if hasattr(user, 'no_telepon') and user.no_telepon:
                customer_details["phone"] = user.no_telepon

            transaction_payload = {
                "transaction_details": {
                    "order_id": midtrans_order_id,
                    "gross_amount": gross_amount
                },
                "item_details": item_details,
                "customer_details": customer_details,
                "credit_card": {
                    "secure": True
                }
            }

            # Panggil Midtrans API
            transaction = snap_client.create_transaction(transaction_payload)
            snap_token = transaction['token']

            # Simpan atau update record Pembayaran
            if existing_payment:
                existing_payment.midtrans_order_id = midtrans_order_id
                existing_payment.snap_token = snap_token
                existing_payment.gross_amount = gross_amount
                existing_payment.status_transaksi = 'pending'
                existing_payment.save()
            else:
                Pembayaran.objects.create(
                    order_id=order_id,
                    metode='midtrans',
                    midtrans_order_id=midtrans_order_id,
                    snap_token=snap_token,
                    gross_amount=gross_amount,
                    status_transaksi='pending'
                )

            return Response({
                "snap_token": snap_token,
                "midtrans_order_id": midtrans_order_id,
                "amount": gross_amount
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Gagal generate Midtrans Snap Token: {str(e)}")
            return Response(
                {"error": f"Gagal menghubungi Midtrans: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MidtransNotificationView(APIView):
    """
    Webhook Endpoint untuk menerima notifikasi otomatis dari Midtrans.
    POST /api/pembayaran/notification/
    (Akses bebas/Public, tidak perlu JWT)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        
        # Ambil field penting untuk verifikasi signature
        order_id = data.get('order_id')
        status_code = data.get('status_code')
        gross_amount = data.get('gross_amount')
        signature_key = data.get('signature_key')

        if not all([order_id, status_code, gross_amount, signature_key]):
            return Response({"error": "Data notifikasi tidak lengkap"}, status=status.HTTP_400_BAD_REQUEST)

        # Verifikasi Signature Key untuk keamanan
        # Format: SHA512(order_id + status_code + gross_amount + ServerKey)
        server_key = settings.MIDTRANS_SERVER_KEY
        payload = f"{order_id}{status_code}{gross_amount}{server_key}"
        hashed = hashlib.sha512(payload.encode('utf-8')).hexdigest()

        if hashed != signature_key:
            return Response({"error": "Signature Key tidak valid!"}, status=status.HTTP_403_FORBIDDEN)

        transaction_status = data.get('transaction_status')
        payment_type = data.get('payment_type')
        transaction_id = data.get('transaction_id')

        # Update status database
        pembayaran = update_payment_and_order_status(order_id, transaction_status, payment_type, transaction_id)
        
        if pembayaran:
            return Response({"message": "Notifikasi berhasil diproses"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Gagal memproses pembayaran"}, status=status.HTTP_400_BAD_REQUEST)


class CheckPaymentStatusView(APIView):
    """
    Endpoint manual untuk mengecek & memperbarui status dari API Midtrans ke DB lokal.
    Sangat berguna untuk testing di Localhost (karena localhost tidak bisa menerima webhook dari internet).
    GET /api/pembayaran/check-status/<int:order_id>/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            pembayaran = Pembayaran.objects.get(order_id=order_id)
            if not pembayaran.midtrans_order_id:
                return Response({"error": "Pembayaran belum diinisiasi"}, status=status.HTTP_400_BAD_REQUEST)
        except Pembayaran.DoesNotExist:
            return Response({"error": "Data pembayaran tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Panggil API Midtrans untuk mendapatkan status transaksi terkini
            snap_client = get_midtrans_snap_client()
            status_response = snap_client.transactions.status(pembayaran.midtrans_order_id)

            transaction_status = status_response.get('transaction_status')
            payment_type = status_response.get('payment_type')
            transaction_id = status_response.get('transaction_id')

            # Update DB lokal
            updated_pembayaran = update_payment_and_order_status(
                pembayaran.midtrans_order_id, 
                transaction_status, 
                payment_type, 
                transaction_id
            )

            serializer = PembayaranSerializer(updated_pembayaran)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Gagal memeriksa status pembayaran: {str(e)}")
            return Response(
                {"error": f"Gagal mengecek status ke Midtrans: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from rest_framework.parsers import MultiPartParser, FormParser

class ConfirmManualPaymentView(APIView):
    """
    Endpoint untuk mengunggah bukti bayar transfer bank manual.
    POST /api/pembayaran/konfirmasi-manual/
    Content-Type: multipart/form-data
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        order_id = request.data.get('order_id')
        bukti_bayar = request.FILES.get('bukti_bayar')

        if not order_id:
            return Response({"error": "order_id wajib disertakan."}, status=status.HTTP_400_BAD_REQUEST)
        if not bukti_bayar:
            return Response({"error": "bukti_bayar wajib disertakan."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Ambil detail Order
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)

        # Cek apakah user yang login adalah pemilik order
        if order.pembeli_id != request.user.id:
            return Response({"error": "Anda tidak memiliki akses ke order ini."}, status=status.HTTP_403_FORBIDDEN)

        # Cek apakah pembayaran sudah lunas
        pembayaran, created = Pembayaran.objects.get_or_create(order_id=order_id)
        if pembayaran.is_lunas:
            return Response({"error": "Order ini sudah dibayar lunas."}, status=status.HTTP_400_BAD_REQUEST)

        # Simpan bukti bayar dan perbarui status ke manual transfer
        pembayaran.metode = 'transfer'
        pembayaran.bukti_bayar = bukti_bayar
        pembayaran.status_transaksi = 'pending'  # Tetap pending sampai dikonfirmasi admin
        
        # Set gross_amount manual jika belum diisi/masih 0
        if pembayaran.gross_amount == 0:
            pembayaran.gross_amount = order.total_harga + 5000 # Order total_harga + admin fee
            
        pembayaran.save()

        # Update order status to konfirmasi (Menunggu Konfirmasi)
        if order.status != 'konfirmasi':
            order.status = 'konfirmasi'
            order.save()

        # Gunakan serializer untuk response
        serializer = PembayaranSerializer(pembayaran)
        return Response({
            "message": "Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.",
            "payment": serializer.data
        }, status=status.HTTP_200_OK)

