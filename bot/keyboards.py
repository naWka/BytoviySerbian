from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from bot.content import SCENARIOS


def _scenario_rows(prefix: str) -> list[list[InlineKeyboardButton]]:
    return [
        [InlineKeyboardButton(text=s["title_ru"], callback_data=f"{prefix}:{sid}")]
        for sid, s in SCENARIOS.items()
    ]


def main_menu() -> InlineKeyboardMarkup:
    rows = _scenario_rows("scenario")
    rows.append([InlineKeyboardButton(text="🆘 SOS-фразы", callback_data="sos")])
    rows.append([InlineKeyboardButton(text="🚨 Мне срочно", callback_data="urgent")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def urgent_menu() -> InlineKeyboardMarkup:
    rows = _scenario_rows("cheat")
    rows.append([InlineKeyboardButton(text="🆘 SOS-фразы", callback_data="sos")])
    rows.append([InlineKeyboardButton(text="⬅️ Меню", callback_data="menu")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def scenario_card_kb(scenario_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🥊 Спарринг", callback_data=f"train:{scenario_id}")],
            [InlineKeyboardButton(text="⬅️ Меню", callback_data="menu")],
        ]
    )


def back_to_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="⬅️ Меню", callback_data="menu")]]
    )
