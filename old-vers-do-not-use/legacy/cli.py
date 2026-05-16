#!/usr/bin/env python3
import argparse
from pathlib import Path
import pipeline


def main():
    p = argparse.ArgumentParser(description="Brainrot Edu — turn scripts into brainrot educational videos")
    p.add_argument("script",     type=Path, help="Path to script YAML")
    p.add_argument("background", type=Path, help="Path to background video (.mp4)")
    p.add_argument("-o", "--output", type=Path, default=None, help="Output path (default: output/<title>.mp4)")
    p.add_argument("--sfx",     type=Path, default=None, help="Optional background sound effect/music")
    p.add_argument("--model",   default=None, help="Whisper model size: tiny/base/small (default: from persona)")
    args = p.parse_args()

    if not args.script.exists():
        p.error(f"Script not found: {args.script}")
    if not args.background.exists():
        p.error(f"Background not found: {args.background}")

    # default output path
    if args.output is None:
        from core.script_parser import load
        script = load(args.script)
        safe_title = script.title.lower().replace(" ", "_")
        args.output = Path("output") / f"{safe_title}.mp4"

    pipeline.run(
        script_path=args.script,
        background=args.background,
        output=args.output,
        sfx=args.sfx,
        whisper_model=args.model,
    )


if __name__ == "__main__":
    main()
