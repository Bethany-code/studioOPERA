import yaml
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Line:
    speaker: str
    text: str


@dataclass
class Script:
    persona: str
    title: str
    lines: list[Line]


def load(path: str | Path) -> Script:
    with open(path) as f:
        raw = yaml.safe_load(f)

    lines = [Line(speaker=l["speaker"], text=l["text"]) for l in raw["lines"]]
    return Script(
        persona=raw.get("persona", "default"),
        title=raw.get("title", "untitled"),
        lines=lines,
    )


def full_text(script: Script) -> str:
    return " ".join(l.text for l in script.lines)


def per_speaker_text(script: Script) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for line in script.lines:
        result.setdefault(line.speaker, []).append(line.text)
    return result
