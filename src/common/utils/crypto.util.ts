// crypto.util.ts
import * as crypto from 'crypto';

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || 'your-32-byte-secret-key';
const IV = process.env.CRYPTO_IV || 'your-16-byte-init-vector';

export class CryptoUtil {
  static encrypt(text: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(IV));
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  static decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(IV));
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
