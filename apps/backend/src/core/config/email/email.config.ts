export default () => {
  const emailUser = process.env.EMAIL_USER || '';
  const providerHost = emailUser.toLowerCase().endsWith('@mail.ru')
    ? 'smtp.mail.ru'
    : 'smtp.gmail.com';
  const host = process.env.EMAIL_HOST || providerHost;
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secureSetting = process.env.EMAIL_SECURE?.trim().toLowerCase();

  return {
    email: {
      host,
      port,
      // Port 465 uses implicit TLS; port 587 starts with a plaintext
      // connection and upgrades to TLS via STARTTLS.
      secure: secureSetting === undefined ? port === 465 : secureSetting === 'true',
      user: emailUser,
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || '',
    },
  };
};
