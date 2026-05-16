import asyncio
import edge_tts
from pathlib import Path
from core.script_parser import Script, Line


# Map speaker names to edge-tts voice strings
# Users can override via persona yaml
DEFAULT_VOICES = {
    "rick":   "en-US-ChristopherNeural",   # deeper, gruff
    "morty":  "en-US-AndrewNeural",         # younger sound
    "narrator": "en-US-GuyNeural",
    "default": "en-US-ChristopherNeural",
}


async def _synthesize(text: str, voice: str, output_path: Path) -> None:
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(output_path))


def synthesize_line(line: Line, voice_map: dict[str, str], output_path: Path) -> Path:
    voice = voice_map.get(line.speaker.lower(), DEFAULT_VOICES["default"])
    asyncio.run(_synthesize(line.text, voice, output_path))
    return output_path


def synthesize_script(
    script: Script,
    voice_map: dict[str, str],
    workdir: Path,
) -> list[Path]:
    """
    Synthesize each line to a separate mp3 in workdir.
    Returns ordered list of audio file paths.
    """
    workdir.mkdir(parents=True, exist_ok=True)
    audio_files = []

    for i, line in enumerate(script.lines):
        out = workdir / f"line_{i:03d}_{line.speaker}.mp3"
        synthesize_line(line, voice_map, out)
        audio_files.append(out)
        print(f"  TTS [{i+1}/{len(script.lines)}] {line.speaker}: {line.text[:50]}...")

    return audio_files
