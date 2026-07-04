from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from bot.content import SCENARIOS


def _scenario_rows(prefix: str) -> list[list[InlineKeyboardButton]]:
    return [
        [InlineKeyboardButton(text=s["title_ru"], callback_data=f"{prefix}:{sid}")]
        for sid, s in SCENARIOS.items()
    ]


def main_menu() -> InlineKeyboardMarkup:
    rows = _scenario_rows("scenario")
    rows.append([InlineKeyboardButton(text="🆘 SOS-фразы", callback_data="sos:0")])
    rows.append([InlineKeyboardButton(text="🚨 Мне срочно", callback_data="urgent")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def urgent_menu() -> InlineKeyboardMarkup:
    rows = _scenario_rows("cheat")
    rows.append([InlineKeyboardButton(text="🆘 SOS-фразы", callback_data="sos:0")])
    rows.append([InlineKeyboardButton(text="⬅️ Меню", callback_data="menu")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _nav_row(prefix: str, idx: int, total: int) -> list[InlineKeyboardButton]:
    return [
        InlineKeyboardButton(text="◀️", callback_data=f"{prefix}:{(idx - 1) % total}"),
        InlineKeyboardButton(text=f"{idx + 1} / {total}", callback_data="noop"),
        InlineKeyboardButton(text="▶️", callback_data=f"{prefix}:{(idx + 1) % total}"),
    ]


def card_kb(scenario_id: str, section: str, idx: int, total: int) -> InlineKeyboardMarkup:
    other = "say" if section == "hear" else "hear"
    other_label = "🗣 Чем ответить →" if section == "hear" else "👂 Что услышишь →"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            _nav_row(f"card:{scenario_id}:{section}", idx, total),
            [InlineKeyboardButton(text=other_label, callback_data=f"card:{scenario_id}:{other}:0")],
            [
                InlineKeyboardButton(text="🥊 Спарринг", callback_data=f"train:{scenario_id}"),
                InlineKeyboardButton(text="⬅️ Меню", callback_data="menu"),
            ],
        ]
    )


def sos_kb(idx: int, total: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            _nav_row("sos", idx, total),
            [InlineKeyboardButton(text="⬅️ Меню", callback_data="menu")],
        ]
    )


def back_to_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="⬅️ Меню", callback_data="menu")]]
    )
