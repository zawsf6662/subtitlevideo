import os
import sys
import shutil
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
os.environ["HF_TOKEN"] = os.getenv("HF_TOKEN", "")

def setup_dll_paths():
    # Path จาก pip nvidia-cublas
    nvidia_path = os.path.join(
        os.environ.get("LOCALAPPDATA", ""), 
        r"Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\site-packages\nvidia\cublas\bin"
    )
    # Path จาก CUDA Toolkit
    cuda_toolkit_path = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\bin"

    for path in [nvidia_path, cuda_toolkit_path]:
        if os.path.exists(path):
            os.add_dll_directory(path)
            print(f"✅ Loaded DLL Path: {path}")

setup_dll_paths()

from faster_whisper import WhisperModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = WhisperModel("large-v3", device="cuda", compute_type="float16")

UPLOAD_DIR = "uploads"

@app.post("/transcribe")
async def upload_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="ต้องอัปโหลดไฟล์วิดีโอเท่านั้น")

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    segments, info = model.transcribe(file_path, beam_size=5)

    subtitles = []
    for segment in segments:
        subtitles.append({
            "id": len(subtitles) + 1,
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })
    
    return {
        "filename": unique_filename,
        "language": info.language,
        "subtitles": subtitles
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)