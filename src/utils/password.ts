import bcrypt from "bcryptjs";

// 盐值轮数
const SALT_ROUNDS = 10;

// 密码加密函数
export function saltAndHashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

// 密码验证函数
export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}
