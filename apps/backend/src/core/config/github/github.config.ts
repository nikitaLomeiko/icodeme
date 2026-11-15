export default () => ({
  clientID: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  callbackURL:
    process.env.GITHUB_CALLBACK_URL ||
    'http://localhost:3000/oauth/github/callback',
  frontendURL: process.env.FRONTEND_URL || 'http://localhost:5173',
});
