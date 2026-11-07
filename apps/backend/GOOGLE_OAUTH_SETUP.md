# Google OAuth настройка

## 1. Создание Google Cloud проекта

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите **Google+ API**:
   - Перейдите в **APIs & Services** > **Library**
   - Найдите **Google+ API** и нажмите **Enable**

## 2. Создание OAuth учетных данных

1. Перейдите в **APIs & Services** > **Credentials**
2. Нажмите **Create Credentials** > **OAuth client ID**
3. Если спрашивают, настройте **OAuth consent screen**:
   - Выберите **External** (или **Internal** для рабочей области Google)
   - Заполните обязательные поля:
     - **App name**: ICodeme (или ваше название)
     - **User support email**: ваш email
     - **Developer contact email**: ваш email
   - В разделе **Scopes** добавьте:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Сохраните

4. При создании OAuth client ID:
   - **Application type**: Web application
   - **Name**: ICodeme Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (для разработки)
     - `https://yourdomain.com` (для продакшена)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback` (для разработки)
     - `https://yourdomain.com/auth/google/callback` (для продакшена)

5. После создания скопируйте:
   - **Client ID**
   - **Client Secret**

## 3. Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Google OAuth
GOOGLE_CLIENT_ID=ваш_client_id_из_google
GOOGLE_CLIENT_SECRET=ваш_client_secret_из_google
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:4200
```

> **Важно**: `FRONTEND_URL` — это URL вашего фронтенд-приложения. После успешной авторизации пользователь будет перенаправлен на `${FRONTEND_URL}/auth/google/success?token=...&refreshToken=...`

## 4. Использование

### Эндпоинты:

- **GET** `/auth/google` — начинает процесс авторизации (редирект на Google)
- **GET** `/auth/google/callback` — callback эндпоинт (не вызывать вручную)

### Пример ссылки на фронтенде:

```html
<a href="http://localhost:3000/auth/google">Войти через Google</a>
```

### Обработка ответа на фронтенде:

После успешной авторизации пользователь перенаправляется на:
```
${FRONTEND_URL}/auth/google/success?token=ACCESS_TOKEN&refreshToken=REFRESH_TOKEN
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
${FRONTEND_URL}/auth/google/error?error=user_exists
```

## 5. Логика работы

1. Пользователь нажимает "Войти через Google"
2. Происходит редирект на Google
3. Пользователь выбирает аккаунт Google
4. Google перенаправляет обратно на `/auth/google/callback`
5. Сервер:
   - Если пользователь новый — создаёт его с `provider: 'google'` и `isEmailConfirmed: true`
   - Если пользователь уже существует с `provider: 'google'` — просто авторизует
   - Если пользователь с таким email уже существует с `provider: 'local'` — возвращает ошибку `USER_EXISTS`
6. Пользователь перенаправляется на фронтенд с токенами в URL

## 6. Структура базы данных

В коллекцию `users` добавлены новые поля:

```typescript
{
  provider?: 'local' | 'google';     // источник авторизации
  googleId?: string;                  // ID пользователя из Google
  picture?: string;                   // URL аватара из Google
  password_hash?: string;            // теперь опционально (не нужно для OAuth)
  isEmailConfirmed: boolean;         // true для Google OAuth
}
```

## 7. Тестирование

1. Убедитесь, что все переменные окружения установлены
2. Запустите сервер: `npm run start:dev`
3. Откройте в браузере: `http://localhost:3000/auth/google`
4. Выберите Google аккаунт
5. После авторизации вы будете перенаправлены на фронтенд с токенами

## 8. Продакшен

Для продакшена не забудьте:

1. Обновить `GOOGLE_CALLBACK_URL` на ваш реальный домен
2. Добавить домен в **Authorized redirect URIs** в Google Cloud Console
3. Установить правильный `FRONTEND_URL`
4. Пройти верификацию приложения в Google (если требуется для вашего уровня доступа)
