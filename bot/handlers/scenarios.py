from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.content import SCENARIOS, SOS_PHRASES
from bot.keyboards import back_to_menu_kb, scenario_card_kb

router = Router()

DRAFT_FOOTER = "<i>Черновик: фразы ещё не проверены носителем языка.</i>"


def _phrase_lines(phrase: dict) -> list[str]:
    lines = [
        f"<b>«{phrase['sr_cyrillic']}»</b>",
        phrase["sr_latin"],
        f"🔊 {phrase['pronunciation_ru']}",
        f"🇷🇺 {phrase['translation_ru']}",
    ]
    if phrase.get("how_to_react"):
        lines.append(f"↩️ {phrase['how_to_react']}")
    if phrase.get("false_friend_note"):
        lines.append(f"⚠️ {phrase['false_friend_note']}")
    lines.append("")
    return lines


def format_card(scenario: dict) -> str:
    lines = [f"<b>{scenario['title_ru']} · {scenario['title_sr']}</b>", ""]
    lines.append("👂 <b>Что услышишь</b> — и как не поплыть:")
    lines.append("")
    for phrase in scenario["will_hear"]:
        lines.extend(_phrase_lines(phrase))
    lines.append("🗣 <b>Чем ответить</b> — второй слой:")
    lines.append("")
    for phrase in scenario["your_phrases"]:
        lines.extend(_phrase_lines(phrase))
    lines.append(DRAFT_FOOTER)
    return "\n".join(lines)


def format_sos() -> str:
    lines = ["<b>🆘 SOS-фразы</b> — когда поплыл в разговоре:", ""]
    for phrase in SOS_PHRASES:
        lines.extend(_phrase_lines(phrase))
    lines.append(DRAFT_FOOTER)
    return "\n".join(lines)


@router.callback_query(F.data.startswith("scenario:"))
async def show_scenario(callback: CallbackQuery) -> None:
    scenario = SCENARIOS[callback.data.split(":", 1)[1]]
    await callback.message.edit_text(
        format_card(scenario), reply_markup=scenario_card_kb(scenario["id"])
    )
    await callback.answer()


@router.callback_query(F.data.startswith("cheat:"))
async def show_cheatsheet(callback: CallbackQuery) -> None:
    scenario = SCENARIOS[callback.data.split(":", 1)[1]]
    await callback.message.edit_text(format_card(scenario), reply_markup=back_to_menu_kb())
    await callback.answer()


@router.callback_query(F.data == "sos")
async def show_sos(callback: CallbackQuery) -> None:
    await callback.message.edit_text(format_sos(), reply_markup=back_to_menu_kb())
    await callback.answer()


@router.callback_query(F.data.startswith("train:"))
async def train_stub(callback: CallbackQuery) -> None:
    await callback.answer("🥊 Спарринг скоро появится!", show_alert=True)
