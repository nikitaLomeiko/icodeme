# GitHub OAuth настройка

## 1. Создание GitHub OAuth приложения

1. Перейдите в [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Нажмите **New OAuth App**
3. Заполните поля:

   | Поле | Значение (для разработки) |
   |------|---------------------------|
   | **Application name** | ICodeme |
   | **Homepage URL** | `http://localhost:3000` |
   | **Authorization callback URL** | `http://localhost:3000/auth/github/callback` |
   | **Application description** | (необязательно) Платформа для изучения программирования |

4. Нажмите **Register application**
5. После создания скопируйте:
   - **Client ID** (отображается сразу)
   - **Client Secret** (нажмите **Generate a new client secret**)

## 2. Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=ваш_client_id_из_github
GITHUB_CLIENT_SECRET=ваш_client_secret_из_github
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_URL=http://localhost:4200
```

> **Важно**: `FRONTEND_URL` — это URL вашего фронтенд-приложения. После успешной авторизации пользователь будет перенаправлен на `${FRONTEND_URL}/auth/github/success?token=...&refreshToken=...`

## 3. Использование

### Эндпоинты:

- **GET** `/auth/github` — начинает процесс авторизации (редирект на GitHub)
- **GET** `/auth/github/callback` — callback эндпоинт (не вызывать вручную)

### Пример ссылки на фронтенде:

```html
<a href="http://localhost:3000/auth/github">Войти через GitHub</a>
```

### Обработка ответа на фронтенде:

После успешной авторизации пользователь перенаправляется на:
```
${FRONTEND_URL}/auth/github/success?token=ACCESS_TOKEN&refreshToken=REFRESH_TOKEN
```

На фронтенде нужно распарсить URL и сохранить токены:

```typescript
// Пример на Angular/React/Vue
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const refreshToken = params.get('refreshToken');

if (token && refreshToken) {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  // Перенаправить на главную страницу
}
```

При ошибке (пользователь с таким email уже зарегистрирован через password):
```
${FRONTEND_URL}/auth/github/error?error=user_exists
```

## 4. Логика работы

1. Пользователь нажимает "Войти через GitHub"
2. Происходит редирект на GitHub
3. Пользователь авторизуется и подтверждает доступ
4. GitHub перенаправляет обратно на `/auth/github/callback`
5. Сервер:
   - Если пользователь новый — создаёт его с `provider: 'github'` и `isEmailConfirmed: true`
   - Если пользователь уже существует с `provider: 'github'` — просто авторизует
   - Если пользователь с таким email уже существует с `provider: 'local'` или `provider: 'google'` — возвращает ошибку `USER_EXISTS`
6. Пользователь перенаправляется на фронтенд с токенами в URL

## 5. Структура базы данных

В коллекцию `users` добавлены новые поля:

```typescript
{
  provider?: 'local' | 'google' | 'github';  // источник авторизации
  githubId?: string;                          // ID пользователя из GitHub
  picture?: string;                            // URL аватара из GitHub
  username?: string;                           // GitHub username
  password_hash?: string;                     // теперь опционально (не нужно для OAuth)
  isEmailConfirmed: boolean;                  // true для GitHub OAuth
}
```

## 6. Тестирование

1. Убедитесь, что все переменные окружения установлены
2. Запустите сервер: `npm run start:dev`
3. Откройте в браузере: `http://localhost:3000/auth/github`
4. Авторизуйтесь через GitHub
5. После авторизации вы будете перенаправлены на фронтенд с токенами

## 7. Продакшен

Для продакшена не забудьте:

1. Обновить `GITHUB_CALLBACK_URL` на ваш реальный домен
2. Добавить новый callback URL в настройках OAuth приложения на GitHub
3. Установить правильный `FRONTEND_URL`
4. Обновить **Homepage URL** в настройках приложения

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

# Frontend
FRONTEND_URL=http://localhost:4200

# Database
MONGODB_URI=mongodb://localhost:27017/your_database
```
