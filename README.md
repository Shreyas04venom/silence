# Silent Classrooms App

This project is now prepared to use a free local video-generation backend instead of Veo. The app will:

- call `LOCAL_VIDEO_API_URL` first for lesson videos
- cache generated MP4 files in `public/generated-videos`
- stream them correctly to the browser with `Range` support
- fall back to deterministic local lesson content when `GEMINI_API_KEY` is missing

## Important reality check

This current laptop is not a good machine for modern local video generation:

- AMD integrated graphics
- no NVIDIA CUDA GPU
- 8 GB RAM

That means the app can run here, but the sample local backend is meant for a stronger NVIDIA laptop or desktop.

## App setup

1. Copy `.env.example` to `.env.local`.
2. Fill in Supabase values if your app flow needs them.
3. Set `LOCAL_VIDEO_API_URL=http://127.0.0.1:8000/generate-video` when the backend is running.
4. Start the app:

```bash
pnpm dev
```

## Local video backend

A sample backend is included in [local-video-backend/README.md](./local-video-backend/README.md).

That backend:

- accepts the same payload the Next.js app already sends
- generates a real MP4 with a local open-source model
- returns a JSON `videoUrl` that this app can consume directly

## Current behavior

- If `LOCAL_VIDEO_API_URL` is set, `/api/generate-video` uses the local backend first.
- If the local backend is not configured, the app falls back to Veo.
- If `GEMINI_API_KEY` is missing, the app now still creates fallback explanation, storyboard, SVG illustration, and sign-language SVG locally.

## Notes for testing on a stronger laptop

- Use Python 3.10 or 3.11 for the local backend.
- Use an NVIDIA GPU with CUDA support.
- Expect the first model load to be slow because weights must load into VRAM.
- Generated videos are cached by topic/context, so repeated requests should be much faster.
