import { randomBytes } from "crypto"

export function generateId(): string {
  return randomBytes(12).toString("hex")
}

export function shortId(): string {
  return randomBytes(6).toString("hex")
}
