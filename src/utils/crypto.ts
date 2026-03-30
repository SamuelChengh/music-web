import CryptoJS from 'crypto-js';

const SECRET_KEY = 'music-web-2024-secure-key-32bit';

export function encrypt(data: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decrypt<T>(encrypted: string): T {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}
