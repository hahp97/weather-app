import crypto from "crypto";

const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string, SECRET: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string, SECRET: string) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift() || "", "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(SECRET), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  function generateKey(size = 32, format: BufferEncoding = "base64") {
    const buffer = crypto.randomBytes(size);
    return buffer.toString(format);
  }
  function generateSecretHash(key: string) {
    const salt = crypto.randomBytes(8).toString("hex");
    const buffer = crypto.scryptSync(key, salt, 64) as Buffer;
    return `${buffer.toString("hex")}.${salt}`;
  }

  const key = generateKey();
  const secretHash = generateSecretHash(key);

  return {
    publicKey: key,
    privateKey: secretHash,
  };
}

export function verifyKey(storedKey: string, suppliedKey: string) {
  const [hashedPassword, salt] = storedKey.split(".");

  const buffer = crypto.scryptSync(suppliedKey, salt, 64) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer);
}
