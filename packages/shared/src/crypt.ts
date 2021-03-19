import crypto from 'crypto'

const CRYPT_ALGO = 'aes-256-cbc'

/**
 * Generate the random passprase
 * @returns {string} A random passphrase with base64
 */
export function randomPass(): string {
  return crypto.randomBytes(32).toString('base64')
}

/**
 * Generate the random salt
 * @returns {string} A random salt with base64
 */
export function randomSalt(): string {
  return crypto.randomBytes(16).toString('base64')
}

/**
 * Genearte a secret key
 * @param {string} pass 32 byte password
 * @param {string} salt 16 byte salt
 * @returns {string} secrent hash key
 */
export function generateSecret(pass: string, salt: string): string {
  pass = pass || randomPass()
  salt = salt || randomSalt()
  return crypto.scryptSync(pass, salt, 32).toString('hex')
}

/**
 * Encrypt
 * @param {string} secret A secret hash key
 * @param {string} data A target data
 * @returns {Object} An IV and encryped data that these are encdoed with base64
 */
export function encrypt(
  secret: string,
  data: string
): { iv: string; encryptedData: string } {
  // secret key from buffer
  const key = Buffer.from(secret, 'hex')
  // generate IV
  const iv = crypto.randomBytes(16)
  // create chiper
  const cipher = crypto.createCipheriv(CRYPT_ALGO, key, iv)
  // encrype data
  let encryptedData = cipher.update(data, 'utf-8', 'base64')
  encryptedData += cipher.final('base64')
  return { iv: iv.toString('base64'), encryptedData }
}

/**
 * Decrypt
 * @param {string} secret A secret hash key
 * @param {string} iv An IV that encoded with base64
 * @param {string} encryptedData An encrypted data that encoded with base64
 * @returns {string} The decrypted data
 */
export function decrypt(
  secret: string,
  iv: string,
  encryptedData: string
): string {
  // secret key from buffer
  const key = Buffer.from(secret, 'hex')
  // IV from buffer
  const ivRaw = Buffer.from(iv, 'base64')
  // create dechiper
  const decipher = crypto.createDecipheriv(CRYPT_ALGO, key, ivRaw)
  // decrypt data
  let decryptedData = decipher.update(encryptedData, 'base64', 'utf-8')
  decryptedData += decipher.final('utf-8')
  return decryptedData
}
