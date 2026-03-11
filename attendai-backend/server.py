import base64
import os
from io import BytesIO

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

app = FastAPI()

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
configured_origins = os.getenv("ALLOWED_ORIGINS", "")
allow_origins = [
    origin.strip()
    for origin in configured_origins.split(",")
    if origin.strip()
] or default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageData(BaseModel):
    image: str


class FaceRegistration(BaseModel):
    student_id: str
    student_name: str
    image: str


FACE_REGISTRY = {}
MATCH_THRESHOLD = 0.78


def decode_data_url(image_data: str) -> Image.Image:
    _, encoded = image_data.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    return Image.open(BytesIO(image_bytes)).convert("RGB")


def image_signature(image_data: str) -> np.ndarray:
    image = decode_data_url(image_data)
    image = image.resize((32, 32)).convert("L")
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    signature = pixels.flatten()
    norm = np.linalg.norm(signature)
    if norm == 0:
      return signature
    return signature / norm


def cosine_similarity(left: np.ndarray, right: np.ndarray) -> float:
    return float(np.dot(left, right))


@app.get("/")
def root():
    return {
        "message": "AttendAI backend is running.",
        "allowed_origins": allow_origins,
        "routes": {
            "health": "/health",
            "recognize": "/recognize",
            "register_face": "/register-face",
            "registered_faces": "/registered-faces",
            "docs": "/docs",
        },
    }


@app.get("/health")
def health():
    return {"status": "ok", "registered_faces": len(FACE_REGISTRY)}


@app.get("/registered-faces")
def registered_faces():
    return {
        "count": len(FACE_REGISTRY),
        "students": [
            {
                "student_id": item["student_id"],
                "student_name": item["student_name"],
            }
            for item in FACE_REGISTRY.values()
        ],
    }


@app.post("/register-face")
def register_face(payload: FaceRegistration):
    signature = image_signature(payload.image)

    FACE_REGISTRY[payload.student_id] = {
        "student_id": payload.student_id,
        "student_name": payload.student_name,
        "signature": signature,
    }

    return {
        "status": "registered",
        "student_id": payload.student_id,
        "student_name": payload.student_name,
        "registered_faces": len(FACE_REGISTRY),
    }


@app.post("/recognize")
def recognize(data: ImageData):
    if not FACE_REGISTRY:
        return {"recognized": [], "message": "No registered faces available."}

    probe_signature = image_signature(data.image)

    best_match = None
    best_score = 0.0

    for item in FACE_REGISTRY.values():
        score = cosine_similarity(probe_signature, item["signature"])
        if score > best_score:
            best_score = score
            best_match = item

    if best_match is None or best_score < MATCH_THRESHOLD:
        return {"recognized": [], "message": "No confident face match found."}

    return {
        "recognized": [
            {
                "id": best_match["student_id"],
                "name": best_match["student_name"],
                "confidence": round(best_score, 4),
            }
        ]
    }
