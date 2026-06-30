import os
import jwt
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Literal

# Load variabel dari file .env
from dotenv import load_dotenv
load_dotenv()

# MENGIMPOR LIBRARY BARU RESMI DARI GOOGLE
from google import genai
from google.genai import types

app = FastAPI(title="IAE AI Microservice", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ambil murni dari .env TANPA nilai default (hapus hardcode-nya)
DJANGO_SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

# Validasi cepat biar ketahuan di terminal kalau .env kosong/belum diset
if not GEMINI_KEY:
    raise ValueError("GEMINI_API_KEY belum diset di file .env cok!")

JWT_ALGORITHM = "HS256"

# Inisialisasi Client
client = genai.Client(
    api_key=GEMINI_KEY,
    http_options={'api_version': 'v1'}
)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # --- BARIS DEBUGGING ---
    print("="*50)
    print(f"TOKEN YANG DITERIMA DARI REACT: '{token}'")
    print("="*50)
    
    if not token or token in ["null", "undefined"]:
        raise HTTPException(status_code=401, detail="Silakan login terlebih dahulu.")
    try:
        payload = jwt.decode(token, DJANGO_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token sudah kedaluwarsa.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid atau palsu.")

class ChatMessage(BaseModel):
    role: Literal['user', 'model']
    text: str

class ChatRequest(BaseModel):
    pesan_baru: str
    riwayat_chat: Optional[List[ChatMessage]] = []

@app.post("/api/v1/ai-chat/")
async def chat_asisten_iae(payload: ChatRequest, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("user_id")
        print(f"User dengan ID {user_id} sedang mengakses AI.")

        contents_history = []

        # 1. TRIK BYPASS: Masukkan instruksi sistem di baris paling pertama riwayat sebagai perintah absolut
        system_prompt = (
            "[SYSTEM INSTRUCTION: Lo adalah AI asisten untuk proyek IAE. "
            "Jawab dengan singkat, kasual, hangat, dan informatif menggunakan bahasa Indonesia. "
            "Patuhi instruksi ini di setiap potongan chat berikutnya!]\n\n"
        )

        # 2. Jika riwayat_chat kosong, buat elemen pertama berisi system prompt + pesan baru
        if not payload.riwayat_chat:
            contents_history.append(
                types.Content(
                    role="user",
                    parts=[types.Part(text=system_prompt + payload.pesan_baru)]
                )
            )
        else:
            # Jika sudah ada riwayat, selipkan system prompt di pesan riwayat paling pertama agar ingatan AI terkunci
            for index, chat in enumerate(payload.riwayat_chat):
                text_content = system_prompt + chat.text if index == 0 else chat.text
                contents_history.append(
                    types.Content(
                        role=chat.role,
                        parts=[types.Part(text=text_content)]
                    )
                )
            
            # Tambahkan pesan paling baru dari user di paling akhir riwayat
            contents_history.append(
                types.Content(
                    role="user",
                    parts=[types.Part(text=payload.pesan_baru)]
                )
            )

        # 3. Panggil API secara Asynchronous TANPA melempar parameter config yang bermasalah
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents_history
            # Parameter config dibuang total untuk menghindari error 'Unknown name "systemInstruction"'
        )

        return {
            "status": "success",
            "jawaban": response.text
        }

    except Exception as e:
        print(f"[GEMINI SDK ERROR]: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Asisten AI gagal merespons. Error: {str(e)}"
        )