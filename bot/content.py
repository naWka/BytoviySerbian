import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_scenarios() -> dict[str, dict]:
    with open(DATA_DIR / "scenarios.json", encoding="utf-8") as f:
        return {s["id"]: s for s in json.load(f)}


def _load_sos() -> list[dict]:
    with open(DATA_DIR / "sos.json", encoding="utf-8") as f:
        return json.load(f)


SCENARIOS = _load_scenarios()
SOS_PHRASES = _load_sos()
