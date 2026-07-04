from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.content import SCENARIOS
from bot.keyboards import back_to_menu_kb, scenario_card_kb

router = Router()


def format_card(scenario: dict) -> str:
    lines = [f"<b>{scenario['title_ru']} · {scenario['title_sr']}</b>", ""]
    for phrase in scenario["phrases"]:
        lines.append(f"🇷🇸 <b>{phrase['sr_cyrillic']}</b>")
        lines.append(phrase["sr_latin"])
        lines.append(f"🗣 {phrase['pronunciation_ru']}")
        lines.append(f"🇷🇺 {phrase['translation_ru']}")
        if phrase["false_friend_note"]:
            lines.append(f"⚠️ {phrase['false_friend_note']}")
        lines.append("")
    lines.append("<i>Фразы — черновик, ещё не проверены носителем языка.</i>")
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


@router.callback_query(F.data.startswith("train:"))
async def train_stub(callback: CallbackQuery) -> None:
    await callback.answer("🎭 Тренировка скоро появится!", show_alert=True)
