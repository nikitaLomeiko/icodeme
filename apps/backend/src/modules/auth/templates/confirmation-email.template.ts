export interface ConfirmationEmailContent {
  subject: string;
  text: string;
  html: string;
}

export const createConfirmationEmail = (
  code: string,
): ConfirmationEmailContent => ({
  subject: 'Код подтверждения — ICodeme',
  text: `Здравствуйте!\n\nВаш код подтверждения: ${code}\n\nВведите его в приложении ICodeme. Если вы не запрашивали код, просто проигнорируйте это письмо.`,
  html: `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Код подтверждения — ICodeme</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial,Helvetica,sans-serif; color:#172033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6fb; padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px; background:#ffffff; border-radius:20px; overflow:hidden;">
          <tr><td style="height:6px; background:#6757e8; font-size:0; line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:36px 40px 40px;">
            <p style="margin:0 0 28px; color:#6757e8; font-size:18px; font-weight:700; letter-spacing:.3px;">ICodeme</p>
            <h1 style="margin:0 0 14px; font-size:25px; line-height:1.3; color:#172033;">Подтвердите адрес почты</h1>
            <p style="margin:0 0 26px; color:#667085; font-size:15px; line-height:1.6;">Введите этот код в приложении, чтобы продолжить:</p>
            <div style="margin:0 0 26px; padding:20px 16px; border:1px solid #e8e7fb; border-radius:14px; background:#f8f7ff; text-align:center; color:#302879; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:10px;">${code}</div>
            <p style="margin:0 0 8px; color:#667085; font-size:14px; line-height:1.6;">Если вы не запрашивали код, просто проигнорируйте это письмо.</p>
            <p style="margin:28px 0 0; padding-top:20px; border-top:1px solid #eef0f4; color:#98a2b3; font-size:12px; line-height:1.5;">Это автоматическое сообщение от ICodeme. Пожалуйста, не отвечайте на него.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
});
