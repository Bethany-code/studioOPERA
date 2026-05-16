"""
Composes final video:
  - loops background to match total audio duration
  - concatenates all line audio into one track
  - burns ASS captions
  - adds optional sound effects
"""

import subprocess
import json
from pathlib import Path


def get_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_format", str(path)],
        capture_output=True, text=True, check=True
    )
    return float(json.loads(result.stdout)["format"]["duration"])


def concat_audio(audio_files: list[Path], output: Path) -> Path:
    """Concatenate mp3s into a single wav."""
    list_file = output.parent / "concat_list.txt"
    list_file.write_text(
        "\n".join(f"file '{f.resolve()}'" for f in audio_files)
    )
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c", "copy", str(output)
    ], check=True, capture_output=True)
    list_file.unlink()
    return output


def compose(
    background: Path,
    audio_files: list[Path],
    captions_ass: Path,
    output: Path,
    sfx: Path | None = None,
    crop: str = "1080:1920",   # vertical by default
) -> Path:
    workdir = output.parent
    workdir.mkdir(parents=True, exist_ok=True)

    # 1. merge audio lines
    merged_audio = workdir / "merged_audio.mp3"
    concat_audio(audio_files, merged_audio)

    total_duration = get_duration(merged_audio)
    print(f"  Total duration: {total_duration:.1f}s")

    # 2. build ffmpeg command
    # loop background video, crop to vertical, overlay audio, burn subs
    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", "-1", "-i", str(background),   # looped background
        "-i", str(merged_audio),
    ]

    filter_parts = []
    input_count = 2

    if sfx:
        cmd += ["-i", str(sfx)]
        # mix sfx at lower volume with speech
        filter_parts.append(
            f"[1:a][2:a]amix=inputs=2:weights=1 0.15[aout]"
        )
        audio_map = "[aout]"
        input_count = 3
    else:
        audio_map = "1:a"

    # crop + scale background to 1080x1920
    vf = f"crop={crop},scale=1080:1920,ass={captions_ass.resolve()}"

    if filter_parts:
        cmd += ["-filter_complex", ";".join(filter_parts)]
        cmd += ["-map", "0:v", "-map", audio_map]
    else:
        cmd += ["-map", "0:v", "-map", "1:a"]

    cmd += [
        "-vf", vf,
        "-t", str(total_duration),
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        str(output)
    ]

    print(f"  Composing video...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed:\n{result.stderr}")

    print(f"  Output → {output}")
    return output
