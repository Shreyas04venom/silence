from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import shutil
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("silent-classrooms-local-video")

APP_DIR = Path(__file__).resolve().parent
load_dotenv(APP_DIR / ".env")

DEFAULT_MODELS = {
    "hunyuan15": "hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v",
    "wan21": "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
}

OUTPUT_ROOT = Path(os.getenv("LOCAL_VIDEO_OUTPUT_DIR", APP_DIR / "generated")).resolve()
FINAL_DIR = OUTPUT_ROOT / "final"
SCENE_DIR = OUTPUT_ROOT / "scenes"
FINAL_DIR.mkdir(parents=True, exist_ok=True)
SCENE_DIR.mkdir(parents=True, exist_ok=True)

PRIMARY_PROVIDER = os.getenv("LOCAL_VIDEO_PROVIDER", "hunyuan15").strip().lower()
FALLBACK_PROVIDER = os.getenv("LOCAL_VIDEO_FALLBACK_PROVIDER", "wan21").strip().lower()
PRIMARY_MODEL_ID = os.getenv("LOCAL_VIDEO_MODEL_ID", DEFAULT_MODELS.get(PRIMARY_PROVIDER, DEFAULT_MODELS["hunyuan15"]))
FALLBACK_MODEL_ID = os.getenv(
    "LOCAL_VIDEO_FALLBACK_MODEL_ID",
    DEFAULT_MODELS.get(FALLBACK_PROVIDER, DEFAULT_MODELS["wan21"]),
)
WIDTH = int(os.getenv("LOCAL_VIDEO_WIDTH", "832"))
HEIGHT = int(os.getenv("LOCAL_VIDEO_HEIGHT", "480"))
SCENE_FRAMES = int(os.getenv("LOCAL_VIDEO_SCENE_FRAMES", "97"))
FPS = int(os.getenv("LOCAL_VIDEO_FPS", "24"))
GUIDANCE_SCALE = float(os.getenv("LOCAL_VIDEO_GUIDANCE_SCALE", "6.0"))
NUM_INFERENCE_STEPS = int(os.getenv("LOCAL_VIDEO_NUM_INFERENCE_STEPS", "30"))
MAX_SCENES = int(os.getenv("LOCAL_VIDEO_MAX_SCENES", "6"))
SEED = int(os.getenv("LOCAL_VIDEO_SEED", "42"))
DTYPE_NAME = os.getenv("LOCAL_VIDEO_TORCH_DTYPE", "bfloat16").strip().lower()
ENABLE_MODEL_CPU_OFFLOAD = os.getenv("LOCAL_VIDEO_ENABLE_MODEL_CPU_OFFLOAD", "0") == "1"
ENABLE_VAE_TILING = os.getenv("LOCAL_VIDEO_ENABLE_VAE_TILING", "1") == "1"
ENABLE_MULTI_SCENE = os.getenv("LOCAL_VIDEO_ENABLE_MULTI_SCENE", "1") == "1"

app = FastAPI(title="Silent Classrooms Local Video Backend", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/videos", StaticFiles(directory=FINAL_DIR), name="videos")

_generation_lock = asyncio.Lock()
_pipelines: dict[str, Any] = {}


class StoryboardStep(BaseModel):
    title: str = ""
    detail: str = ""


class Storyboard(BaseModel):
    displayTitle: str = ""
    subtitle: str = ""
    steps: list[StoryboardStep] = Field(default_factory=list)
    keyTerms: list[str] = Field(default_factory=list)
    flow: str = ""


class GenerateVideoRequest(BaseModel):
    topic: str
    chapter: str = ""
    standard: str = ""
    subject: str = ""
    explanation: str = ""
    storyboard: Storyboard = Field(default_factory=Storyboard)


@dataclass(frozen=True)
class ProviderConfig:
    name: str
    model_id: str


@dataclass(frozen=True)
class ConceptProfile:
    title: str
    subtitle: str
    subject: str
    chapter: str
    domain: str
    visual_style: str
    environment: str
    motion_language: str
    continuity_objects: str
    lesson_goal: str
    flow_label: str


@dataclass(frozen=True)
class ScenePlan:
    index: int
    heading: str
    objective: str
    shot_design: str
    focus_objects: str
    prompt: str
    negative_prompt: str


DOMAIN_LIBRARY = {
    "biology": {
        "visual_style": "premium biological explainer animation with organic forms, transparent cutaways, rich particles, and luminous energy transfer",
        "environment": "a coherent natural science world that can move from macro anatomy to close scientific detail",
        "motion_language": "growth, flow, absorption, circulation, release, and transformation",
        "lesson_goal": "make living processes visually obvious through cause and effect",
    },
    "chemistry": {
        "visual_style": "high-end molecular educational animation with precise reactions, glowing bonds, and clean laboratory realism",
        "environment": "a stylized lab-scale world where molecules and materials stay readable",
        "motion_language": "collision, bonding, separation, reaction, and transformation",
        "lesson_goal": "show hidden chemical changes with visible particle motion",
    },
    "physics": {
        "visual_style": "cinematic scientific animation with fields, forces, trajectories, light, and energy shown clearly in space",
        "environment": "a clean physical world with visible forces, trajectories, and measurable motion",
        "motion_language": "acceleration, orbit, vibration, wave motion, and force transfer",
        "lesson_goal": "turn invisible physical behavior into a concrete visual process",
    },
    "mathematics": {
        "visual_style": "beautiful spatial math animation with tactile geometry, transformations, exact proportions, and elegant motion",
        "environment": "a minimal mathematical world with precise shapes, surfaces, lines, and dynamic transformations",
        "motion_language": "rotation, scaling, partition, balancing, alignment, and stepwise construction",
        "lesson_goal": "teach abstract ideas with concrete moving objects instead of text-heavy formulas",
    },
    "history": {
        "visual_style": "cinematic historical education animation with symbolic environments, maps, architecture, and human activity",
        "environment": "a period-accurate world with scene continuity and clear focus on important events",
        "motion_language": "travel, change over time, assembly, expansion, and consequence",
        "lesson_goal": "show historical change as a visual timeline of causes and outcomes",
    },
    "geography": {
        "visual_style": "immersive earth-science animation with landforms, weather, water movement, and spatial relationships",
        "environment": "a coherent planet-scale world with terrain, atmosphere, and clear environmental motion",
        "motion_language": "erosion, circulation, weathering, flow, uplift, and regional change",
        "lesson_goal": "make systems of earth and place easy to grasp from motion",
    },
    "technology": {
        "visual_style": "advanced technical explainer animation with layered systems, data flow, and mechanical or digital clarity",
        "environment": "a readable machine or digital environment where every component has a clear role",
        "motion_language": "signal flow, assembly, processing, switching, and system interaction",
        "lesson_goal": "show technical systems as visible interacting parts",
    },
    "general": {
        "visual_style": "high-end educational animation with literal objects, rich lighting, clean staging, and strong continuity",
        "environment": "one coherent visual world built around the core concept",
        "motion_language": "stepwise action, transformation, connection, and reveal",
        "lesson_goal": "explain the concept fully through visual storytelling instead of labels",
    },
}


def clean_text(value: str) -> str:
    return " ".join((value or "").replace("\r", " ").replace("\n", " ").split()).strip()


def slugify(value: str) -> str:
    lowered = clean_text(value).lower()
    pieces = ["".join(character for character in chunk if character.isalnum()) for chunk in lowered.split()]
    result = "-".join(filter(None, pieces))
    return result or "lesson"


def unique_values(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        cleaned = clean_text(value)
        if not cleaned:
            continue
        normalized = cleaned.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        result.append(cleaned)

    return result


def get_torch_dtype(torch_module: Any) -> Any:
    mapping = {
        "float16": torch_module.float16,
        "bfloat16": torch_module.bfloat16,
        "float32": torch_module.float32,
    }
    return mapping.get(DTYPE_NAME, torch_module.bfloat16)


def get_runtime_device(torch_module: Any) -> str:
    return "cuda" if torch_module.cuda.is_available() else "cpu"


def provider_sequence() -> list[ProviderConfig]:
    ordered = unique_values([PRIMARY_PROVIDER, FALLBACK_PROVIDER])
    configs: list[ProviderConfig] = []

    for name in ordered:
        if name not in DEFAULT_MODELS:
            continue
        model_id = PRIMARY_MODEL_ID if name == PRIMARY_PROVIDER else FALLBACK_MODEL_ID
        configs.append(ProviderConfig(name=name, model_id=model_id or DEFAULT_MODELS[name]))

    if not configs:
        configs.append(ProviderConfig(name="wan21", model_id=DEFAULT_MODELS["wan21"]))

    return configs


def infer_domain(payload: GenerateVideoRequest) -> str:
    source = " ".join(
        [
            clean_text(payload.subject).lower(),
            clean_text(payload.chapter).lower(),
            clean_text(payload.topic).lower(),
            clean_text(payload.storyboard.displayTitle).lower(),
        ]
    )

    if any(token in source for token in ["plant", "animal", "cell", "body", "blood", "leaf", "photosynthesis", "digestion", "respiration", "ecosystem"]):
        return "biology"
    if any(token in source for token in ["atom", "molecule", "chemical", "reaction", "acid", "base", "compound"]):
        return "chemistry"
    if any(token in source for token in ["force", "motion", "energy", "wave", "electric", "gravity", "magnet", "light"]):
        return "physics"
    if any(token in source for token in ["math", "mathematics", "equation", "fraction", "triangle", "angle", "algebra", "geometry"]):
        return "mathematics"
    if any(token in source for token in ["history", "civilization", "empire", "revolution", "war"]):
        return "history"
    if any(token in source for token in ["geography", "earth", "river", "mountain", "climate", "weather", "continent"]):
        return "geography"
    if any(token in source for token in ["computer", "network", "program", "software", "algorithm", "machine"]):
        return "technology"
    return "general"


def build_concept_profile(payload: GenerateVideoRequest) -> ConceptProfile:
    domain = infer_domain(payload)
    style = DOMAIN_LIBRARY[domain]
    title = clean_text(payload.storyboard.displayTitle or payload.topic or "Concept Overview")
    subtitle = clean_text(payload.storyboard.subtitle)
    continuity_objects = ", ".join(
        unique_values(
            [
                title,
                *payload.storyboard.keyTerms[:4],
                payload.storyboard.flow,
                payload.chapter,
                payload.subject,
            ]
        )[:5]
    )
    lesson_goal = clean_text(payload.explanation.split(".")[0]) or style["lesson_goal"]

    return ConceptProfile(
        title=title,
        subtitle=subtitle,
        subject=clean_text(payload.subject),
        chapter=clean_text(payload.chapter),
        domain=domain,
        visual_style=style["visual_style"],
        environment=style["environment"],
        motion_language=style["motion_language"],
        continuity_objects=continuity_objects or title,
        lesson_goal=lesson_goal,
        flow_label=clean_text(payload.storyboard.flow),
    )


def build_negative_prompt() -> str:
    return (
        "dashboard layout, ui cards, block diagram, split screen, infographic, poster, static slide, text wall, subtitles, "
        "logo, watermark, repeated text, messy collage, overlapping objects, blurry subject, duplicate anatomy, deformed hands, "
        "low quality, noisy frame, cluttered composition, unreadable labels"
    )


def build_scene_prompt(profile: ConceptProfile, scene_heading: str, objective: str, shot_design: str, focus_objects: str) -> str:
    parts = [
        f"Create one clip from a longer premium silent educational animation about {profile.title}.",
        f"Scene heading: {scene_heading}.",
        f"Scene objective: {objective}.",
        f"Subject domain: {profile.domain}.",
        f"Visual style: {profile.visual_style}.",
        f"Environment: {profile.environment}.",
        f"Continuity anchors that must stay recognizable across the full lesson: {profile.continuity_objects}.",
        f"Focus objects for this clip: {focus_objects}.",
        f"Motion language: {profile.motion_language}.",
        f"Shot design: {shot_design}.",
        f"Learning outcome: {profile.lesson_goal}.",
        f"Overall process chain: {profile.flow_label}." if profile.flow_label else "",
        f"Subtitle meaning: {profile.subtitle}." if profile.subtitle else "",
        "Use cinematic lighting, strong object clarity, smooth camera movement, believable animated motion, and precise cause-and-effect staging.",
        "Teach visually through action and transformation, not through on-screen text.",
        "Keep the frame clear and centered so a student can understand the concept quickly.",
        "No subtitles, no labels, no watermarks, no logos, no classroom slides, and no overlapping information panels.",
    ]
    return " ".join(part for part in parts if part)


def build_scene_plans(payload: GenerateVideoRequest, profile: ConceptProfile) -> list[ScenePlan]:
    steps = payload.storyboard.steps[:4] or [
        StoryboardStep(title="Core Idea", detail=f"{profile.title} is introduced clearly."),
        StoryboardStep(title="Key Change", detail="The important transformation happens step by step."),
        StoryboardStep(title="Result", detail="The learner sees the visible result."),
    ]

    scene_specs: list[tuple[str, str, str]] = [
        (
            "Core World",
            profile.subtitle or f"Introduce the main visual world of {profile.title}.",
            "Start with a clean wide establishing shot, then move into the main object with calm cinematic camera motion.",
        )
    ]

    for step in steps:
        scene_specs.append(
            (
                clean_text(step.title or "Key Step"),
                clean_text(step.detail or f"Show the next important stage of {profile.title}."),
                "Use a focused medium shot with clear before-and-after motion so the transformation is easy to follow.",
            )
        )

    scene_specs.append(
        (
            "Full Understanding",
            profile.flow_label or f"Show the complete process and final understanding of {profile.title}.",
            "End with a satisfying summary shot that reveals the full system working correctly in one coherent view.",
        )
    )

    if ENABLE_MULTI_SCENE:
        scene_specs = scene_specs[:MAX_SCENES]
    else:
        scene_specs = scene_specs[:1]

    focus_defaults = profile.continuity_objects or profile.title
    scenes: list[ScenePlan] = []

    for index, (heading, objective, shot_design) in enumerate(scene_specs):
        if index == 0:
            focus_objects = focus_defaults
        elif index == len(scene_specs) - 1:
            focus_objects = ", ".join(unique_values([focus_defaults, profile.flow_label, heading])[:5])
        else:
            step = steps[min(index - 1, len(steps) - 1)]
            focus_objects = ", ".join(unique_values([step.title, step.detail, focus_defaults])[:5])

        scenes.append(
            ScenePlan(
                index=index,
                heading=heading,
                objective=objective,
                shot_design=shot_design,
                focus_objects=focus_objects,
                prompt=build_scene_prompt(profile, heading, objective, shot_design, focus_objects),
                negative_prompt=build_negative_prompt(),
            )
        )

    return scenes


def build_cache_key(payload: GenerateVideoRequest, profile: ConceptProfile, scenes: list[ScenePlan]) -> str:
    source = json.dumps(
        {
            "providers": [asdict(config) for config in provider_sequence()],
            "title": profile.title,
            "profile": asdict(profile),
            "payload": payload.model_dump(),
            "scenes": [asdict(scene) for scene in scenes],
            "width": WIDTH,
            "height": HEIGHT,
            "sceneFrames": SCENE_FRAMES,
            "fps": FPS,
            "guidanceScale": GUIDANCE_SCALE,
            "steps": NUM_INFERENCE_STEPS,
        },
        sort_keys=True,
    )
    return hashlib.sha1(source.encode("utf-8")).hexdigest()[:16]


def load_pipeline(provider: ProviderConfig) -> Any:
    cached = _pipelines.get(provider.name)
    if cached is not None:
        return cached

    try:
        import torch
        from diffusers import AutoencoderKLWan, HunyuanVideo15Pipeline, UniPCMultistepScheduler, WanPipeline
    except ImportError as error:
        raise RuntimeError(
            "Backend dependencies are missing. Install a CUDA-enabled PyTorch build first, then pip install -r requirements.txt."
        ) from error

    dtype = get_torch_dtype(torch)
    device = get_runtime_device(torch)
    logger.info("Loading provider %s with model %s on %s", provider.name, provider.model_id, device)

    if provider.name == "hunyuan15":
        pipe = HunyuanVideo15Pipeline.from_pretrained(provider.model_id, torch_dtype=dtype)
    elif provider.name == "wan21":
        vae = AutoencoderKLWan.from_pretrained(provider.model_id, subfolder="vae", torch_dtype=torch.float32)
        pipe = WanPipeline.from_pretrained(provider.model_id, vae=vae, torch_dtype=dtype)
        flow_shift = 3.0 if HEIGHT <= 480 else 5.0
        pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config, flow_shift=flow_shift)
    else:
        raise RuntimeError(f"Unsupported provider: {provider.name}")

    if ENABLE_VAE_TILING and hasattr(pipe, "vae") and hasattr(pipe.vae, "enable_tiling"):
        pipe.vae.enable_tiling()

    if ENABLE_MODEL_CPU_OFFLOAD and device == "cuda":
        pipe.enable_model_cpu_offload()
    else:
        pipe.to(device)

    _pipelines[provider.name] = pipe
    return pipe


def generate_scene_clip(scene: ScenePlan, scene_key: str) -> tuple[Path, str]:
    import torch
    from diffusers.utils import export_to_video

    errors: list[str] = []

    for provider in provider_sequence():
        clip_path = SCENE_DIR / f"{scene_key}-{provider.name}.mp4"
        if clip_path.exists() and clip_path.stat().st_size > 0:
            return clip_path, provider.name

        try:
            pipe = load_pipeline(provider)
            device = get_runtime_device(torch)
            generator = torch.Generator(device=device).manual_seed(SEED + scene.index * 97)

            call_kwargs = {
                "prompt": scene.prompt,
                "height": HEIGHT,
                "width": WIDTH,
                "num_frames": SCENE_FRAMES,
                "num_inference_steps": NUM_INFERENCE_STEPS,
                "guidance_scale": GUIDANCE_SCALE,
                "generator": generator,
            }
            if provider.name == "wan21":
                call_kwargs["negative_prompt"] = scene.negative_prompt

            frames = pipe(**call_kwargs).frames[0]
            export_to_video(frames, str(clip_path), fps=FPS)

            if not clip_path.exists() or clip_path.stat().st_size == 0:
                raise RuntimeError("clip export finished but no playable MP4 was written")

            if torch.cuda.is_available():
                torch.cuda.empty_cache()

            return clip_path, provider.name
        except Exception as error:  # noqa: BLE001
            if clip_path.exists():
                clip_path.unlink(missing_ok=True)
            error_message = f"{provider.name}: {error}"
            logger.warning("Scene %s failed on provider %s: %s", scene.index, provider.name, error)
            errors.append(error_message)

    raise RuntimeError(" | ".join(errors) or "all providers failed to generate the scene")


def concatenate_scene_clips(scene_paths: list[Path], output_path: Path) -> None:
    if len(scene_paths) == 1:
        shutil.copyfile(scene_paths[0], output_path)
        return

    import imageio_ffmpeg

    concat_file = output_path.with_suffix(".concat.txt")
    lines = [f"file '{path.resolve().as_posix()}'" for path in scene_paths]
    concat_file.write_text("\n".join(lines), encoding="utf-8")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    command = [
        ffmpeg_exe,
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_file),
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        str(output_path),
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    concat_file.unlink(missing_ok=True)

    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "ffmpeg concat failed")


def generate_video_file(payload: GenerateVideoRequest) -> tuple[Path, str, dict[str, Any]]:
    profile = build_concept_profile(payload)
    scenes = build_scene_plans(payload, profile)
    cache_key = build_cache_key(payload, profile, scenes)
    file_name = f"{slugify(profile.title)}-{cache_key}.mp4"
    final_path = FINAL_DIR / file_name

    if final_path.exists() and final_path.stat().st_size > 0:
        metadata = {
            "title": profile.title,
            "sceneCount": len(scenes),
            "durationSeconds": round((len(scenes) * SCENE_FRAMES) / FPS, 2),
            "providers": [config.name for config in provider_sequence()],
            "cached": True,
        }
        return final_path, file_name, metadata

    scene_paths: list[Path] = []
    used_providers: list[str] = []

    for scene in scenes:
        scene_key = f"{file_name[:-4]}-scene-{scene.index + 1:02d}"
        scene_path, provider_name = generate_scene_clip(scene, scene_key)
        scene_paths.append(scene_path)
        used_providers.append(provider_name)

    concatenate_scene_clips(scene_paths, final_path)

    if not final_path.exists() or final_path.stat().st_size == 0:
        raise RuntimeError("final video stitching finished but no playable MP4 was written")

    metadata = {
        "title": profile.title,
        "sceneCount": len(scenes),
        "durationSeconds": round((len(scenes) * SCENE_FRAMES) / FPS, 2),
        "providers": unique_values(used_providers),
        "cached": False,
    }
    return final_path, file_name, metadata


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse(
        {
            "ok": True,
            "primaryProvider": PRIMARY_PROVIDER,
            "fallbackProvider": FALLBACK_PROVIDER,
            "primaryModelId": PRIMARY_MODEL_ID,
            "fallbackModelId": FALLBACK_MODEL_ID,
            "width": WIDTH,
            "height": HEIGHT,
            "sceneFrames": SCENE_FRAMES,
            "fps": FPS,
            "maxScenes": MAX_SCENES,
            "multiScene": ENABLE_MULTI_SCENE,
            "loadedPipelines": sorted(_pipelines.keys()),
        }
    )


@app.post("/generate-video")
async def generate_video(payload: GenerateVideoRequest) -> JSONResponse:
    if not clean_text(payload.topic):
        raise HTTPException(status_code=400, detail="topic is required")

    logger.info("Starting local generation for topic: %s", payload.topic)

    async with _generation_lock:
        try:
            file_path, file_name, metadata = await asyncio.to_thread(generate_video_file, payload)
        except Exception as error:  # noqa: BLE001
            logger.exception("Local generation failed for topic %s", payload.topic)
            raise HTTPException(status_code=500, detail=str(error)) from error

    logger.info("Finished local generation for topic: %s -> %s", payload.topic, file_name)

    return JSONResponse(
        {
            "videoUrl": f"/videos/{file_name}",
            "fileName": file_name,
            "mimeType": "video/mp4",
            "size": file_path.stat().st_size,
            **metadata,
        }
    )
