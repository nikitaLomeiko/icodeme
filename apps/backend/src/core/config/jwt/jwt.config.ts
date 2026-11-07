export default () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === 'secretkey') {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }
  return { secret, expiresIn: '15m' as const, ttl: 30 * 24 * 60 * 60 * 1000 };
};
