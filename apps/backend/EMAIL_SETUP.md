# 📧 Email Service - Инструкция по настройке и использованию

## 📋 Содержание

1. [Настройка SMTP](#настройка-smtp)
2. [Настройка для популярных почтовых сервисов](#настройка-для-популярных-почтовых-сервисов)
3. [Использование в коде](#использование-в-коде)
4. [Тестирование через API](#тестирование-через-api)
5. [Устранение проблем](#устранение-проблем)

---

## ⚙️ Настройка SMTP

### Шаг 1: Создайте файл `.env`

В корне проекта создайте файл `.env` (скопируйте `.env.example`):

```bash
copy .env.example .env
```

### Шаг 2: Заполните настройки email

Откройте `.env` и раскомментируйте настройки для вашего почтового сервиса.

**Обязательные параметры:**

- `EMAIL_HOST` - SMTP сервер (например, `smtp.gmail.com`)
- `EMAIL_PORT` - порт (обычно `465` или `587`)
- `EMAIL_USER` - ваш email адрес
- `EMAIL_PASSWORD` - пароль приложения (не обычный пароль от почты!)
- `EMAIL_FROM` - адрес отправителя
- `EMAIL_SECURE` - использовать ли SSL (`true` для порта 465, `false` для 587)

---

## 📮 Настройка для популярных почтовых сервисов

### Gmail

#### 1. Включите двухфакторную аутентификацию

Перейдите в [Google Account](https://myaccount.google.com/) → Безопасность → Включите двухфакторную аутентификацию

#### 2. Создайте пароль приложения

1. Перейдите на страницу [Пароли приложений](https://myaccount.google.com/apppasswords)
2. Выберите "Другое (название устройства)"
3. Введите название, например "Email Service"
4. Нажмите "Создать"
5. Скопируйте 16-значный пароль

#### 3. Заполните `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Пароль приложения (без пробелов)
EMAIL_FROM=your-email@gmail.com
```

---

### Яндекс Почта

#### 1. Включите двухфакторную аутентификацию

Перейдите на [страницу безопасности Яндекс](https://passport.yandex.ru/profile) → Безопасность → Включите двухфакторную аутентификацию

#### 2. Создайте пароль для приложений

1. Перейдите в [Пароли для приложений](https://passport.yandex.ru/am3app)
2. Введите название, например "Email Service"
3. Нажмите "Создать"
4. Скопируйте пароль

#### 3. Заполните `.env`:

```env
EMAIL_HOST=smtp.yandex.ru
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@yandex.ru
EMAIL_PASSWORD=your-app-password  # Пароль для приложений
EMAIL_FROM=your-email@yandex.ru
```

---

### Mail.ru

#### 1. Включите двухфакторную аутентификацию

Перейдите в [настройки безопасности Mail.ru](https://e.mail.ru/my/security) → Включите двухфакторную аутентификацию

#### 2. Создайте пароль для внешних приложений

1. Перейдите в раздел "Пароли для внешних приложений"
2. Нажмите "Создать пароль"
3. Введите название, например "Email Service"
4. Скопируйте пароль

#### 3. Заполните `.env`:

```env
EMAIL_HOST=smtp.mail.ru
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@mail.ru
EMAIL_PASSWORD=your-app-password  # Пароль для внешних приложений
EMAIL_FROM=your-email@mail.ru
```

---

## 💻 Использование в коде

### 1. Импортируйте EmailService в ваш модуль

```typescript
import { Module } from '@nestjs/common';
import { EmailModule } from '@services/email';
import { YourService } from './your.service';

@Module({
  imports: [EmailModule],
  providers: [YourService],
})
export class YourModule {}
```

### 2. Инжектируйте и используйте в сервисе

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from '@services/email';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  // Отправка произвольного email
  async sendCustomEmail() {
    await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Тема письма',
      text: 'Текст письма (plain text)',
      html: '<h1>Текст письма (HTML)</h1>',
    });
  }

  // Отправка приветственного email
  async sendWelcome() {
    await this.emailService.sendWelcomeEmail(
      'user@example.com',
      'Имя пользователя',
    );
  }

  // Отправка кода подтверждения
  async sendVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.emailService.sendVerificationCode('user@example.com', code);
  }

  // Отправка email для сброса пароля
  async sendPasswordReset() {
    const resetToken = 'your-reset-token-here';
    await this.emailService.sendPasswordResetEmail(
      'user@example.com',
      resetToken,
    );
  }
}
```

---

## 🧪 Тестирование через API

После настройки запустите сервер:

```bash
npm run start:dev
```

### 1. Отправка произвольного email

**Запрос:**

```bash
POST http://localhost:3000/email/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Тестовое письмо",
  "text": "Это тестовое письмо",
  "html": "<h1>Это тестовое письмо</h1>"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"recipient@example.com\",\"subject\":\"Тестовое письмо\",\"text\":\"Это тестовое письмо\"}"
```

### 2. Отправка приветственного email

**Запрос:**

```bash
POST http://localhost:3000/email/welcome
Content-Type: application/json

{
  "email": "recipient@example.com",
  "name": "Иван"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/email/welcome \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"recipient@example.com\",\"name\":\"Иван\"}"
```

### 3. Отправка кода подтверждения

**Запрос:**

```bash
POST http://localhost:3000/email/verify
Content-Type: application/json

{
  "email": "recipient@example.com",
  "code": "123456"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/email/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"recipient@example.com\",\"code\":\"123456\"}"
```

### 4. Отправка email для сброса пароля

**Запрос:**

```bash
POST http://localhost:3000/email/reset-password
Content-Type: application/json

{
  "email": "recipient@example.com",
  "token": "your-reset-token"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/email/reset-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"recipient@example.com\",\"token\":\"your-reset-token\"}"
```

---

## ❌ Устранение проблем

### Ошибка: "Invalid login"

**Причина:** Неправильный логин или пароль

**Решение:**

- Убедитесь, что используете **пароль приложения**, а не обычный пароль от почты
- Проверьте правильность email адреса в `EMAIL_USER`

### Ошибка: "connect ETIMEDOUT"

**Причина:** SMTP сервер недоступен

**Решение:**

- Проверьте правильность `EMAIL_HOST` и `EMAIL_PORT`
- Убедитесь, что файрвол не блокирует соединение
- Попробуйте изменить `EMAIL_SECURE` на `false`

### Ошибка: "self signed certificate"

**Причина:** Проблемы с SSL сертификатом

**Решение:**
В файле `email.module.ts` добавьте опцию `tls`:

```typescript
transport: {
  host: configService.get<string>('EMAIL_HOST'),
  port: configService.get<number>('EMAIL_PORT'),
  secure: configService.get<boolean>('EMAIL_SECURE', false),
  auth: {
    user: configService.get<string>('EMAIL_USER'),
    pass: configService.get<string>('EMAIL_PASSWORD'),
  },
  tls: {
    rejectUnauthorized: false,  // Только для тестирования!
  },
},
```

### Письма не доходят

**Возможные причины:**

1. Письмо попало в спам - проверьте папку "Спам"
2. Письмо заблокировано сервером - проверьте логи сервера
3. Неправильный email получателя - убедитесь, что email корректный

**Решение:**

- Проверьте логи приложения на наличие ошибок
- Проверьте папку "Спам" у получателя
- Убедитесь, что `EMAIL_FROM` содержит валидный email

### Gmail блокирует письма

**Причина:** Gmail может блокировать письма, если не настроена безопасность

**Решение:**

1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения (не используйте обычный пароль!)
3. Разрешите менее безопасным приложениям (не рекомендуется):
   - Перейдите на [страницу настроек](https://myaccount.google.com/lesssecureapps)
   - Включите "Разрешить менее безопасные приложения"

---

## 📝 Дополнительные рекомендации

### 1. Используйте переменные окружения в продакшене

Никогда не коммитьте `.env` файл в git! Добавьте его в `.gitignore`:

```
.env
```

### 2. Добавьте логирование

EmailService уже логирует успешные отправки и ошибки. Проверяйте логи при проблемах.

### 3. Обработка ошибок

Всегда оборачивайте вызовы email сервиса в try-catch:

```typescript
try {
  await this.emailService.sendWelcomeEmail(email, name);
} catch (error) {
  // Обработка ошибки
  this.logger.error(`Не удалось отправить email: ${error.message}`);
}
```

### 4. Шаблоны писем

Для сложных шаблонов рассмотрите использование:

- `@nestjs-modules/mailer` с поддержкой Handlebars/Pug
- Или создайте отдельную директорию с HTML шаблонами

---

## 🎯 Быстрый старт (на примере Gmail)

1. **Создайте `.env`:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
```

2. **Запустите сервер:**

```bash
npm run start:dev
```

3. **Отправьте тестовое письмо:**

```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"recipient@example.com\",\"subject\":\"Привет!\",\"text\":\"Тестовое письмо\"}"
```

4. **Проверьте почту!** 📬

---

## 📚 Ресурсы

- [NestJS Mailer Documentation](https://www.npmjs.com/package/@nestjs-modules/mailer)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Yandex SMTP Settings](https://yandex.ru/support/mail/mail-clients.html)
