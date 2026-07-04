from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery, Message

from bot.keyboards import main_menu, urgent_menu

router = Router()

GREETING = (
    "Привет! Я помогу подготовиться к бытовым ситуациям в Сербии:\n"
    "готовые фразы + тренировка диалога.\n\n"
    "Выбери ситуацию:"
)


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    await message.answer(GREETING, reply_markup=main_menu())


@router.callback_query(F.data == "menu")
async def show_menu(callback: CallbackQuery) -> None:
    await callback.message.edit_text(GREETING, reply_markup=main_menu())
    await callback.answer()


@router.callback_query(F.data == "urgent")
async def show_urgent(callback: CallbackQuery) -> None:
    await callback.message.edit_text(
        "Выбери ситуацию — сразу пришлю шпаргалку:", reply_markup=urgent_menu()
    )
    await callback.answer()
