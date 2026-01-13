# 🧠 Brainrot Edu

Turn any educational script into a brainrot-style vertical video.  
No API keys. No cost. Fully self-hosted.

**Stack:** `edge-tts` → `stable-whisper` → `ffmpeg`

---

## Install

```bash
git clone https://github.com/yourname/brainrot-edu
cd brainrot-edu
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# CPU-only torch (smaller download):
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

ffmpeg must be installed on your system:
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

---

## Usage

### Web UI
```bash
python app.py
# open http://localhost:7860
```

### CLI
```bash
python cli.py scripts/example.yaml assets/backgrounds/gameplay.mp4
```

With options:
```bash
python cli.py scripts/example.yaml assets/backgrounds/gameplay.mp4 \
  --output output/my_video.mp4 \
  --sfx assets/sfx/ambient.mp3 \
  --model small
```

---

## Script Format

```yaml
persona: rick_morty       # matches personas/<name>.yaml
title: "Big-O Notation"

lines:
  - speaker: rick
    text: "Listen Morty, Big-O is just how fast your stupidity scales."
  - speaker: morty
    text: "W-what does that even mean Rick?"
```

One line per turn. `speaker` must match a key in the persona's `voices` config.

---

## Adding a Persona

Create `personas/my_persona.yaml`:

```yaml
voices:
  host: "en-US-GuyNeural"
  guest: "en-US-JennyNeural"

whisper_model: "base"

caption_style:
  font: "Impact"
  fontsize: 18
  primary_color: "&H00FFFFFF"
  outline_color: "&H00000000"
  bold: -1
```

Available `edge-tts` voices: run `edge-tts --list-voices`

---

## Background Video

Drop any `.mp4` into `assets/backgrounds/`.  
The video will be cropped to **1080×1920** (vertical) and looped to match audio length.

Use royalty-free gameplay footage or your own recordings. Do not use copyrighted material.

---

## Whisper Model Sizes

| Model  | Speed  | Accuracy |
|--------|--------|----------|
| tiny   | fastest | lower   |
| base   | fast    | good    |
| small  | slower  | better  |

`base` is the default and works well for most scripts.
# studioOPERA
