export const allowedOrigins = (): string[] => {
  const configured = (
    process.env.FRONTEND_ORIGINS ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((value) => new URL(value.trim()).origin);

  if (process.env.NODE_ENV !== 'production' && !process.env.FRONTEND_ORIGINS) {
    for (const origin of [...configured]) {
      const url = new URL(origin);
      if (url.protocol === 'http:' && url.hostname === 'localhost') {
        configured.push(`http://127.0.0.1${url.port ? `:${url.port}` : ''}`);
      } else if (url.protocol === 'http:' && url.hostname === '127.0.0.1') {
        configured.push(`http://localhost${url.port ? `:${url.port}` : ''}`);
      }
    }
  }

  return [...new Set(configured)];
};
