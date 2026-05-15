import yaml
from pathlib import Path
from dataclasses import dataclass, field


PERSONAS_DIR = Path(__file__).parent.parent / "personas"


@dataclass
class Persona:
    name: str
    voices: dict[str, str] = field(default_factory=dict)
    caption_style: dict = field(default_factory=dict)
    whisper_model: str = "base"


def load(name: str) -> Persona:
    path = PERSONAS_DIR / f"{name}.yaml"
    if not path.exists():
        path = PERSONAS_DIR / "default.yaml"

    with open(path) as f:
        raw = yaml.safe_load(f)

    return Persona(
        name=name,
        voices=raw.get("voices", {}),
        caption_style=raw.get("caption_style", {}),
        whisper_model=raw.get("whisper_model", "base"),
    )
