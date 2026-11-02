import forge from 'node-forge'

/**
 * 用后端下发的 SPKI PEM 公钥做 RSA-OAEP(SHA-256) 加密，返回 base64。
 */
export function encryptPassword(password: string, publicKeyPem: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
  const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  })
  return forge.util.encode64(encrypted)
}
