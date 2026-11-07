export default () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botName: process.env.TELEGRAM_BOT_NAME || '',
  frontendURL: process.env.FRONTEND_URL || 'http://localhost:4200',
});
