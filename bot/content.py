import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "scenarios.json"


def _load() -> dict[str, dict]:
    with open(DATA_FILE, encoding="utf-8") as f:
        return {s["id"]: s for s in json.load(f)}


SCENARIOS = _load()
