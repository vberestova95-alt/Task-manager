# Task Manager Telegram Mini App

Telegram-версия task manager, собранная по макету из Figma на `React + TypeScript + Vite`.

## Что внутри

- Главный экран со списком задач, категориями и нижней навигацией.
- Экран создания задачи.
- Экран выбора даты.
- Безопасная интеграция с `Telegram WebApp API` с graceful fallback для обычного браузера.

## Локальный запуск

```bash
npm install
npm run dev
```

Приложение поднимется на `http://localhost:5173`.

Для production-сборки:

```bash
npm run build
npm run preview
```

## Чек-лист для запуска внутри Telegram

1. Создать бота через `@BotFather`, если его еще нет.
2. Настроить Mini App или кнопку запуска через `@BotFather`:
   - `Menu Button`
   - или команду с `Web App URL`
3. Поднять приложение публично по `HTTPS`.
4. Для локальной разработки пробросить `localhost` наружу через туннель:
   - `ngrok http 5173`
   - или `cloudflared tunnel --url http://localhost:5173`
5. Вставить публичный `https://...` URL в настройки бота как Web App URL.
6. Открыть диалог с ботом в Telegram и запустить Mini App через кнопку.
7. Проверить, что WebApp API доступен:
   - открывается без ошибок
   - подхватывается пользователь из `initDataUnsafe`
   - корректно работают `ready()`, `expand()` и закрытие окна
8. Если приложение использует сервер:
   - валидировать `initData` на backend
   - не доверять данным пользователя только из клиента
   - хранить токены и секреты только на сервере

## Best practices для Telegram Mini App

- Использовать адаптивную мобильную верстку и учитывать `viewport-fit=cover`.
- Делать graceful fallback, чтобы приложение работало и вне Telegram.
- Не завязывать критический UX только на Telegram SDK.
- Держать начальную загрузку легкой: маленький bundle, минимум зависимостей.
- Использовать `HTTPS` всегда, кроме чисто локального браузерного теста.
- На backend обязательно проверять подпись `initData`.

## Структура

- `src/App.tsx` — основные экраны и UI-логика
- `src/lib/telegram.ts` — адаптер для Telegram WebApp API
- `src/styles.css` — визуальная реализация под макет
