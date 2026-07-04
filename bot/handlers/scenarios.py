from aiogram import F, Router
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import CallbackQuery

from bot.content import SCENARIOS, SOS_PHRASES
from bot.keyboards import back_to_menu_kb, card_kb, sos_kb

router = Router()

SECTION_TITLES = {"hear": "👂 Что услышишь", "say": "🗣 Чем ответить"}


def _phrases(scenario: dict, section: str) -> list[dict]:
    return scenario["will_hear"] if section == "hear" else scenario["your_phrases"]


def render_card(scenario: dict, section: str, idx: int) -> str:
    phrases = _phrases(scenario, section)
    phrase = phrases[idx]
    lines = [f"{scenario['title_ru']} · <b>{SECTION_TITLES[section]}</b>", ""]
    lines.append(f"<blockquote><b>{phrase['sr_cyrillic']}</b>\n{phrase['sr_latin']}</blockquote>")
    lines.append(f"🔊 <code>{phrase['pronunciation_ru']}</code>")
    lines.append("")
    lines.append(f"🇷🇺 {phrase['translation_ru']}")
    if phrase.get("react_sr"):
        lines.append("")
        lines.append("↩️ <b>Твой ход:</b>")
        lines.append(f"<blockquote><b>{phrase['react_sr']}</b></blockquote>")
        lines.append(f"🔊 <code>{phrase['react_pron']}</code>")
        lines.append(f"🇷🇺 {phrase['react_ru']}")
    if phrase.get("false_friend_note"):
        lines.append("")
        lines.append(f"⚠️ <i>{phrase['false_friend_note']}</i>")
    return "\n".join(lines)


def format_cheatsheet(scenario: dict) -> str:
    lines = [f"{scenario['title_ru']} · <b>шпаргалка</b>", ""]
    lines.append("👂 <b>Что услышишь:</b>")
    for phrase in scenario["will_hear"]:
        lines.append(f"▪️ {phrase['sr_cyrillic']} — <i>{phrase['translation_ru']}</i>")
        lines.append(f"↩️ <code>{phrase['react_pron']}</code> — {phrase['react_ru']}")
        lines.append("")
    lines.append("🗣 <b>Чем ответить:</b>")
    for phrase in scenario["your_phrases"]:
        lines.append(f"▪️ <code>{phrase['pronunciation_ru']}</code>")
        lines.append(f"<i>{phrase['translation_ru']}</i>")
        lines.append("")
    return "\n".join(lines)


def render_sos(idx: int) -> str:
    phrase = SOS_PHRASES[idx]
    lines = ["<b>🆘 SOS — когда поплыл</b>", ""]
    lines.append(f"<blockquote><b>{phrase['sr_cyrillic']}</b>\n{phrase['sr_latin']}</blockquote>")
    lines.append(f"🔊 <code>{phrase['pronunciation_ru']}</code>")
    lines.append("")
    lines.append(f"🇷🇺 {phrase['translation_ru']}")
    return "\n".join(lines)


async def _safe_edit(callback: CallbackQuery, text: str, reply_markup) -> None:
    try:
        await callback.message.edit_text(text, reply_markup=reply_markup)
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise
    await callback.answer()


@router.callback_query(F.data.startswith("scenario:"))
async def open_scenario(callback: CallbackQuery) -> None:
    scenario = SCENARIOS[callback.data.split(":", 1)[1]]
    total = len(scenario["will_hear"])
    await _safe_edit(
        callback,
        render_card(scenario, "hear", 0),
        card_kb(scenario["id"], "hear", 0, total),
    )


@router.callback_query(F.data.startswith("card:"))
async def flip_card(callback: CallbackQuery) -> None:
    _, scenario_id, section, idx_raw = callback.data.split(":")
    scenario = SCENARIOS[scenario_id]
    phrases = _phrases(scenario, section)
    idx = int(idx_raw) % len(phrases)
    await _safe_edit(
        callback,
        render_card(scenario, section, idx),
        card_kb(scenario_id, section, idx, len(phrases)),
    )


@router.callback_query(F.data.startswith("cheat:"))
async def show_cheatsheet(callback: CallbackQuery) -> None:
    scenario = SCENARIOS[callback.data.split(":", 1)[1]]
    await _safe_edit(callback, format_cheatsheet(scenario), back_to_menu_kb())


@router.callback_query(F.data.startswith("sos:"))
async def show_sos(callback: CallbackQuery) -> None:
    idx = int(callback.data.split(":")[1]) % len(SOS_PHRASES)
    await _safe_edit(callback, render_sos(idx), sos_kb(idx, len(SOS_PHRASES)))


@router.callback_query(F.data == "noop")
async def noop(callback: CallbackQuery) -> None:
    await callback.answer()


@router.callback_query(F.data.startswith("train:"))
async def train_stub(callback: CallbackQuery) -> None:
    await callback.answer("🥊 Спарринг скоро появится!", show_alert=True)
