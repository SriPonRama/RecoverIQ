import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const keyHex = process.env.RECOVERIQ_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("RECOVERIQ_ENCRYPTION_KEY is not defined in the environment.");
  }

  const keyBuffer = Buffer.from(keyHex, "hex");
  
  if (keyBuffer.length !== 32) {
    throw new Error(`RECOVERIQ_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters). Current length: ${keyBuffer.length}`);
  }

  return keyBuffer;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: iv(hex):authTag(hex):ciphertext(hex)
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a ciphertext string formatted as iv(hex):authTag(hex):ciphertext(hex).
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return cipherText;
  
  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format. Expected iv:authTag:ciphertext");
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Validates if the given text looks like our encrypted format.
 * This is an optimistic structural check, it does not guarantee decryption will succeed.
 */
export function isEncryptedFormat(text: string): boolean {
  if (!text) return false;
  return text.split(":").length === 3;
}
