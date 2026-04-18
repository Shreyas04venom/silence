# Local Video Backend

This is an advanced free local backend for the Silent Classrooms app. It is designed for a stronger NVIDIA laptop or desktop and uses a multi-scene open-source text-to-video pipeline.

## Recommended machine

- NVIDIA GPU with CUDA
- 12 GB+ VRAM recommended for the stronger Hunyuan 1.5 path
- 8 GB VRAM can still use the Wan 2.1 fallback path
- Python 3.10 or 3.11

Do not expect this to run well on the current Ryzen 3 + integrated AMD laptop.

## What this backend does

- accepts `POST /generate-video`
- builds a concept-specific visual profile from the topic, explanation, and storyboard
- creates multiple educational scenes instead of one short clip
- tries a stronger primary provider first and a lighter fallback provider second
- stitches the scenes into one longer MP4 locally
- caches videos in `generated/`
- serves them back from `/videos/...`

## 1. Install PyTorch for your GPU

Install a CUDA-enabled PyTorch build first using the official PyTorch selector for the machine you are using.

After that, install the rest:

```bash
pip install -r requirements.txt
```

## 2. Configure

Copy `.env.example` to `.env` and adjust values if needed.

Important defaults:

- primary provider: `hunyuan15`
- fallback provider: `wan21`
- primary model: `hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v`
- output: `832x480`
- fps: `24`
- frames per scene: `97`
- max scenes: `6`

## 3. Run the backend

```bash
uvicorn server:app --host 127.0.0.1 --port 8000
```

## 4. Point the Next.js app at it

In the main app `.env.local`:

```bash
LOCAL_VIDEO_API_URL=http://127.0.0.1:8000/generate-video
```

## API contract

Request body:

```json
{
  "topic": "photosynthesis",
  "chapter": "Nutrition in Plants",
  "standard": "7",
  "subject": "Science",
  "explanation": "Short explanation text...",
  "storyboard": {
    "displayTitle": "Photosynthesis",
    "subtitle": "Plants make food from sunlight",
    "steps": [
      { "title": "Input", "detail": "Water and carbon dioxide enter." },
      { "title": "Light", "detail": "Sunlight reaches the leaves." },
      { "title": "Process", "detail": "Chlorophyll helps convert energy." },
      { "title": "Result", "detail": "Glucose forms and oxygen is released." }
    ],
    "keyTerms": ["Sunlight", "Water", "Glucose"],
    "flow": "Input -> Process -> Result"
  }
}
```

Response body:

```json
{
  "videoUrl": "/videos/photosynthesis-1234567890abcdef.mp4",
  "fileName": "photosynthesis-1234567890abcdef.mp4",
  "mimeType": "video/mp4"
}
```

## Notes

- Only one generation job is allowed at a time in this backend to avoid GPU overcommit.
- The first request can take a long time because the primary model and scene plan are heavier than the earlier sample backend.
- Generated files are cached, so repeated requests for the same payload are faster.
- If the stronger provider fails, the backend can still fall back to the lighter provider automatically.
