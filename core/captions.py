"""
Transcribes audio files with word-level timestamps using stable-ts,
then produces an ASS subtitle file styled for brainrot (big, centered, highlighted).
"""

import stable_whisper
from pathlib import Path


_model = None


def _get_model(model_size: str = "base"):
    global _model
    if _model is None:
        print(f"  Loading Whisper model ({model_size})...")
        _model = stable_whisper.load_model(model_size)
    return _model


def transcribe_audio(audio_path: Path, model_size: str = "base") -> stable_whisper.WhisperResult:
    model = _get_model(model_size)
    result = model.transcribe(str(audio_path), word_timestamps=True)
    return result


def result_to_ass(
    result: stable_whisper.WhisperResult,
    output_path: Path,
    style: dict | None = None,
) -> Path:
    """
    Dumps word-level ASS subtitle file.
    Style overrides: fontsize, primary_color, outline_color, bold
    """
    s = style or {}
    fontsize     = s.get("fontsize", 18)
    font         = s.get("font", "Impact")
    primary_color = s.get("primary_color", "&H00FFFFFF")   # white
    outline_color = s.get("outline_color", "&H00000000")   # black outline
    bold         = s.get("bold", -1)                        # -1 = bold in ASS

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, Bold, Alignment, MarginV, BorderStyle, Outline
Style: Default,{font},{fontsize},{primary_color},{outline_color},{bold},2,80,1,3

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    lines = []
    for segment in result.segments:
        for word in segment.words:
            start = _fmt_time(word.start)
            end   = _fmt_time(word.end)
            text  = word.word.strip().upper()
            lines.append(f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}")

    output_path.write_text(header + "\n".join(lines), encoding="utf-8")
    return output_path


def generate_captions(
    audio_files: list[Path],
    workdir: Path,
    time_offset: float = 0.0,
    model_size: str = "base",
    style: dict | None = None,
) -> Path:
    """
    Transcribes all audio segments, offsets timestamps, merges into one ASS file.
    """
    workdir.mkdir(parents=True, exist_ok=True)
    all_words = []
    current_offset = time_offset

    for audio_path in audio_files:
        print(f"  Transcribing {audio_path.name}...")
        result = transcribe_audio(audio_path, model_size)

        # get actual audio duration for offset tracking
        import subprocess, json
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_streams", str(audio_path)],
            capture_output=True, text=True
        )
        duration = float(json.loads(probe.stdout)["streams"][0]["duration"])

        for seg in result.segments:
            for word in seg.words:
                all_words.append({
                    "start": word.start + current_offset,
                    "end":   word.end   + current_offset,
                    "word":  word.word,
                })

        current_offset += duration

    # build merged ASS
    s = style or {}
    fontsize      = s.get("fontsize", 18)
    font          = s.get("font", "Impact")
    primary_color = s.get("primary_color", "&H00FFFFFF")
    outline_color = s.get("outline_color", "&H00000000")
    bold          = s.get("bold", -1)

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, Bold, Alignment, MarginV, BorderStyle, Outline
Style: Default,{font},{fontsize},{primary_color},{outline_color},{bold},2,80,1,3

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [
        f"Dialogue: 0,{_fmt_time(w['start'])},{_fmt_time(w['end'])},Default,,0,0,0,,{w['word'].strip().upper()}"
        for w in all_words
    ]

    out = workdir / "captions.ass"
    out.write_text(header + "\n".join(lines), encoding="utf-8")
    print(f"  Captions → {out}")
    return out


def _fmt_time(seconds: float) -> str:
    h  = int(seconds // 3600)
    m  = int((seconds % 3600) // 60)
    s  = int(seconds % 60)
    cs = int((seconds - int(seconds)) * 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"
