import crypto from 'crypto';

export function generateConfirmCode() {
  const randomNumber = crypto.randomInt(0, 100000);
  return randomNumber.toString().padStart(5, '0');
}
