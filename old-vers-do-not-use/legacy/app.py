import gradio as gr
import tempfile
import shutil
from pathlib import Path
import pipeline
import yaml


PERSONAS = [p.stem for p in Path("personas").glob("*.yaml")]
EXAMPLE_SCRIPT = Path("scripts/example.yaml").read_text()


def build_script_yaml(persona: str, title: str, lines_text: str) -> str:
    """Convert textarea input to YAML."""
    lines = []
    for line in lines_text.strip().splitlines():
        if ":" not in line:
            continue
        speaker, _, text = line.partition(":")
        lines.append({"speaker": speaker.strip().lower(), "text": text.strip()})
    
    doc = {"persona": persona, "title": title, "lines": lines}
    return yaml.dump(doc, allow_unicode=True)


def generate(persona, title, lines_text, background_file, sfx_file, whisper_model):
    if not background_file:
        return None, "❌ Background video required."
    if not lines_text.strip():
        return None, "❌ Script lines required."

    script_yaml = build_script_yaml(persona, title, lines_text)

    with tempfile.TemporaryDirectory(prefix="brainrot_ui_") as tmp:
        tmp = Path(tmp)

        script_path = tmp / "script.yaml"
        script_path.write_text(script_yaml)

        bg_path = tmp / "background.mp4"
        shutil.copy(background_file, bg_path)

        sfx_path = None
        if sfx_file:
            sfx_path = tmp / "sfx.mp3"
            shutil.copy(sfx_file, sfx_path)

        output_path = tmp / "output.mp4"

        try:
            pipeline.run(
                script_path=script_path,
                background=bg_path,
                output=output_path,
                sfx=sfx_path,
                whisper_model=whisper_model if whisper_model != "auto" else None,
            )
            # copy out before tempdir is deleted
            final = Path("output") / f"{title.lower().replace(' ', '_')}.mp4"
            final.parent.mkdir(exist_ok=True)
            shutil.copy(output_path, final)
            return str(final), "✅ Done!"
        except Exception as e:
            return None, f"❌ Error: {e}"


PLACEHOLDER = """\
rick: Listen Morty, Big-O notation is just how fast your stupidity scales.
morty: W-what does that even mean Rick?
rick: Loop inside a loop? That's O of n squared. It's just math, Morty.
"""

with gr.Blocks(title="🧠 Brainrot Edu", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🧠 Brainrot Edu\nTurn any script into a brainrot educational video. No API keys needed.")

    with gr.Row():
        with gr.Column():
            persona    = gr.Dropdown(PERSONAS, value="rick_morty", label="Persona")
            title      = gr.Textbox(value="My Video", label="Title")
            lines_text = gr.Textbox(
                value=PLACEHOLDER,
                label="Script lines (speaker: text, one per line)",
                lines=10,
                placeholder="rick: ...\nmorty: ..."
            )
            background = gr.File(label="Background video (.mp4)", file_types=[".mp4"])
            sfx        = gr.File(label="Sound effect / music (optional)", file_types=[".mp3", ".wav"])
            model      = gr.Dropdown(["auto", "tiny", "base", "small"], value="base", label="Whisper model")
            btn        = gr.Button("🎬 Generate", variant="primary")

        with gr.Column():
            video  = gr.Video(label="Output")
            status = gr.Textbox(label="Status", interactive=False)

    btn.click(generate, inputs=[persona, title, lines_text, background, sfx, model], outputs=[video, status])


if __name__ == "__main__":
    demo.launch()
