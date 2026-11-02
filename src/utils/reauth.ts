import { getPublicKey, verifyPassword } from '@/api/auth'
import { encryptPassword } from '@/utils/crypto'

/**
 * 校验当前密码并换取短期 reauth token。
 */
export async function verifyCurrentPassword(password: string): Promise<string> {
  const { publicKey } = await getPublicKey()
  const result = await verifyPassword({
    password: encryptPassword(password, publicKey),
    encrypted: true
  })

  if (!result.valid) {
    throw new Error('密码不正确')
  }

  return result.reauthToken
}
