import base64
import os
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    from deepface import DeepFace
except Exception:
    DeepFace = None

app = FastAPI(title="Smart Attendance AI Service")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "Facenet512")
RECOGNITION_THRESHOLD = float(os.getenv("RECOGNITION_THRESHOLD", "0.62"))
USE_SIMPLE_EMBEDDING = os.getenv("USE_SIMPLE_EMBEDDING", "false").lower() == "true"
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


class Candidate(BaseModel):
    studentId: str
    name: str
    embeddings: List[List[float]]


class RegisterFacePayload(BaseModel):
    student_id: str
    name: str
    image: str


class RecognizePayload(BaseModel):
    image: str
    candidates: List[Candidate]


def decode_image(data_url: str) -> np.ndarray:
    if "," not in data_url:
        raise HTTPException(status_code=400, detail="Invalid image payload")
    encoded = data_url.split(",", 1)[1]
    image_bytes = base64.b64decode(encoded)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Image decode failed")
    return image


def detect_face(image: np.ndarray) -> np.ndarray:
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(grayscale, scaleFactor=1.1, minNeighbors=5, minSize=(90, 90))
    if len(faces) == 0:
      raise HTTPException(status_code=400, detail="No face detected")
    x, y, w, h = max(faces, key=lambda face: face[2] * face[3])
    return image[y:y + h, x:x + w]


def simple_embedding(image: np.ndarray) -> List[float]:
    face = detect_face(image)
    grayscale = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(grayscale, (32, 32))
    normalized = resized.astype(np.float32).flatten() / 255.0
    norm = np.linalg.norm(normalized)
    if norm == 0:
        return normalized.tolist()
    return (normalized / norm).tolist()


def embedding_from_image(image: np.ndarray) -> List[float]:
    if USE_SIMPLE_EMBEDDING or DeepFace is None:
        return simple_embedding(image)

    face = detect_face(image)
    rgb_face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    result = DeepFace.represent(
        img_path=rgb_face,
        model_name=EMBEDDING_MODEL,
        enforce_detection=False,
    )
    if not result:
        raise HTTPException(status_code=400, detail="Embedding generation failed")
    return result[0]["embedding"]


def cosine_similarity(left: np.ndarray, right: np.ndarray) -> float:
    left_norm = np.linalg.norm(left)
    right_norm = np.linalg.norm(right)
    if left_norm == 0 or right_norm == 0:
      return 0.0
    return float(np.dot(left, right) / (left_norm * right_norm))


@app.get("/health")
def health():
    return {"status": "ok", "model": EMBEDDING_MODEL, "simpleEmbedding": USE_SIMPLE_EMBEDDING or DeepFace is None}


@app.post("/register-face")
def register_face(payload: RegisterFacePayload):
    image = decode_image(payload.image)
    embedding = embedding_from_image(image)
    return {
        "studentId": payload.student_id,
        "name": payload.name,
        "embedding": embedding,
    }


@app.post("/recognize")
def recognize(payload: RecognizePayload):
    image = decode_image(payload.image)
    probe = np.array(embedding_from_image(image), dtype=np.float32)

    best_match = None
    best_score = 0.0

    for candidate in payload.candidates:
        for embedding in candidate.embeddings:
            score = cosine_similarity(probe, np.array(embedding, dtype=np.float32))
            if score > best_score:
                best_score = score
                best_match = {
                    "studentId": candidate.studentId,
                    "name": candidate.name,
                    "confidence": round(score, 4),
                }

    if not best_match or best_score < RECOGNITION_THRESHOLD:
        return {"match": None, "message": "No confident face match"}

    return {"match": best_match}
