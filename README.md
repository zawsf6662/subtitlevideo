## Getting Started

ส่วนของ frontend

```bash
npm install

npm run dev
```



ส่วนของ backend
```bash
ต้องลง [`NVIDIA Driver`](https://www.nvidia.com/en-us/drivers/) ล่าสุด
ติดตั้ง [`CUDA Toolkit 12`](https://developer.nvidia.com/cuda-12-0-0-download-archive) ขึ้นไป แต่ 12 เสถียรสุด
#ต้องติดตั้ง (python 3.10 up)
pip install fastapi uvicorn python-multipart faster-whisper python-dotenv

#สำหลับการ์ดจอ
pip install nvidia-cublas-cu12 nvidia-cudnn-cu12
```

สำหรับคน "ไม่มี CUDA" (ไม่มีการ์ดจอ NVIDIA)

ให้แก้ model = WhisperModel("base", device=cpu, compute_type=int8)

และ ถ้าเครื่องไม่ไหว้ก็มี model อื่น
จากต่ำไปมากก (กิน ram)

tiny

base

small

medium

large-v3 (แนะนำ GPU)

turbo

ในส่วนการหา [tokens](https://huggingface.co/)

ถ้าไม่อยากหา tokens ก็หา Offline Mode เอานะ


