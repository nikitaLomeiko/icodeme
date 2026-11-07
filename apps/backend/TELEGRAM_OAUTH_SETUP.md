# Telegram OAuth настройка

## 1. Создание бота в Telegram

1. Откройте Telegram и найдите бота **@BotFather**
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите **название бота** (например, `ICodeme Login`)
   - Введите **username бота** (должен заканчиваться на `bot`, например `icodeme_login_bot`)
4. После создания BotFather отправит вам:
   - **Token** (например, `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
   - **Username бота** (например, `icodeme_login_bot`)

> **Важно**: Сохраните токен в безопасном месте — он понадобится для настройки сервера.

## 2. Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Telegram OAuth
TELEGRAM_BOT_TOKEN=ваш_токен_бота_от_BotFather
TELEGRAM_BOT_NAME=username_бота_без_собаки (например icodeme_login_bot)
FRONTEND_URL=http://localhost:4200
```

> **Важно**: `TELEGRAM_BOT_NAME` указывается **без** символа `@`.

## 3. Использование

### Эндпоинт:

- **POST** `/auth/telegram` — обрабатывает данные виджета Telegram Login

### Встраивание виджета на фронтенд

Telegram использует не стандартный OAuth редирект, а **виджет авторизации**.

#### Вариант 1: Script-виджет (рекомендуется)

Добавьте на вашу страницу входа:

```html
<script
  async
  src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="YOUR_BOT_NAME"
  data-size="large"
  data-radius="20"
  data-auth-url="http://localhost:3000/auth/telegram"
  data-request-access="write"
></script>
```

Замените:

- `YOUR_BOT_NAME` — username вашего бота (без `@`)
- `data-auth-url` — URL вашего сервера для обработки

#### Вариант 2: Ссылка-виджет (OAuth редирект)

```html
<a
  href="https://oauth.telegram.org/auth?bot_id=8694368343&origin=http://127.0.0.1:3000&return_to=http://127.0.0.1:3000/oauth/telegram"
>
  Войти через Telegram
</a>
```

**Важно**: `return_to` должен указывать на `http://127.0.0.1:3000/oauth/telegram` (или ваш домен).

После авторизации Telegram редиректит на `/oauth/telegram` с данными в hash (`#id=...&first_name=...`).
Сервер автоматически извлекает эти данные на клиенте и отправляет на `/oauth/telegram/verify` для проверки и создания пользователя.

Для этого нужен `bot_id` — числовой ID бота (не токен). Узнать можно через API:

```
https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

#### Вариант 3: Ручная отправка данных (для SPA)

Если вы хотите использовать виджет без `data-auth-url` и сами обработать авторизацию:

```html
<script>
  function onTelegramAuth(user) {
    // user = {
    //   id: "123456",
    //   first_name: "John",
    //   last_name: "Doe",
    //   username: "johndoe",
    //   photo_url: "https://t.me/i/userpic/320/johndoe.jpg",
    //   auth_date: 1623456789,
    //   hash: "abc123..."
    // }

    fetch('http://localhost:3000/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        // Сохранить токены
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
      });
  }
</script>

<script
  async
  src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="YOUR_BOT_NAME"
  data-size="large"
  data-onauth="onTelegramAuth(user)"
  data-request-access="write"
></script>
```

### Обработка ответа на фронтенде:

После успешной авторизации пользователь перенаправляется на:

```
${FRONTEND_URL}/auth/telegram/success?token=ACCESS_TOKEN&refreshToken=REFRESH_TOKEN
```

```typescript
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const refreshToken = params.get('refreshToken');

if (token && refreshToken) {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
}
```

При ошибке:

```
${FRONTEND_URL}/auth/telegram/error?error=invalid_data   // невалидные данные
${FRONTEND_URL}/auth/telegram/error?error=user_exists    // пользователь уже зарегистрирован через другой метод
```

## 4. Логика работы

1. Пользователь нажимает кнопку виджета Telegram на фронтенде
2. Telegram открывает окно авторизации
3. Пользователь подтверждает вход
4. Telegram отправляет данные пользователя на сервер (через виджет) или вызывает callback
5. Сервер:
   - **Проверяет хеш** данных с помощью токена бота (HMAC-SHA256)
   - Проверяет, что данные не старше 24 часов
   - Если пользователь новый — создаёт его с `provider: 'telegram'`
   - Если пользователь уже существует с `provider: 'telegram'` — авторизует
   - Если пользователь уже существует с другим провайдером — ошибка
6. Пользователь перенаправляется на фронтенд с токенами

## 5. Структура базы данных

В коллекцию `users` добавлены новые поля:

```typescript
{
  provider?: 'local' | 'google' | 'github' | 'telegram';
  telegramId?: string;        // Telegram user ID (число как строка)
  picture?: string;            // URL аватара из Telegram
  username?: string;           // Telegram username
  password_hash?: string;     // опционально (не нужно для OAuth)
  isEmailConfirmed: boolean;  // true для Telegram OAuth
  email: string;              // генерируется как username@telegram.com
}
```

## 6. Проверка подлинности данных

Сервер автоматически проверяет:

- **Хеш** данных с помощью HMAC-SHA256 от токена бота
- **Время** — данные не старше 24 часов
- **Целостность** — все поля переданы корректно

Если проверка не проходит — возвращается ошибка `invalid_data`.

## 7. Тестирование

1. Убедитесь, что все переменные окружения установлены
2. Запустите сервер: `npm run start:dev`
3. Разместите виджет на фронтенде
4. Нажмите кнопку входа через Telegram
5. Подтвердите авторизацию в Telegram
6. После авторизации вы будете перенаправлены на фронтенд с токенами

## 8. Полный .env пример

```env
# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Telegram OAuth
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_NAME=icodeme_login_bot

# Frontend
FRONTEND_URL=http://localhost:4200

# Database
MONGODB_URI=mongodb://localhost:27017/your_database
```

## 9. Продакшен

Для продакшена:

1. Обновите `data-auth-url` в виджете на ваш реальный URL
2. Установите правильный `FRONTEND_URL`
3. Убедитесь, что ваш сервер доступен через HTTPS (Telegram требует HTTPS для webhook)
4. Разрешите домен вашего сайта в настройках бота через @BotFather (`/setdomains`)
