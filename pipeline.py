"""
Core pipeline: script → audio → captions → video
"""

import tempfile
from pathlib import Path

from core import script_parser, tts, captions, composer, persona as persona_mod


def run(
    script_path: Path,
    background: Path,
    output: Path,
    sfx: Path | None = None,
    whisper_model: str | None = None,
) -> Path:
    print(f"\n{'='*50}")
    print(f"  Script:     {script_path.name}")
    print(f"  Background: {background.name}")
    print(f"  Output:     {output}")
    print(f"{'='*50}\n")

    # 1. parse script
    script = script_parser.load(script_path)
    persona = persona_mod.load(script.persona)
    model = whisper_model or persona.whisper_model

    with tempfile.TemporaryDirectory(prefix="brainrot_") as tmp:
        workdir = Path(tmp)

        # 2. TTS
        print("[1/3] Synthesizing audio...")
        audio_files = tts.synthesize_script(script, persona.voices, workdir / "audio")

        # 3. Captions
        print("\n[2/3] Generating captions...")
        ass_file = captions.generate_captions(
            audio_files,
            workdir / "captions",
            model_size=model,
            style=persona.caption_style,
        )

        # 4. Compose
        print("\n[3/3] Composing video...")
        output.parent.mkdir(parents=True, exist_ok=True)
        composer.compose(background, audio_files, ass_file, output, sfx=sfx)

    print(f"\n✓ Done → {output}")
    return output
