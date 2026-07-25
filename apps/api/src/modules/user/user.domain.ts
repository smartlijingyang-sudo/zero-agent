import type { CreateUser } from "@zero-agent/contracts/user";

/**
 * Pure business rules — no framework, no db, no side effects.
 */
export function validateUser(input: CreateUser): void {
  if (input.name.trim().length === 0) {
    throw new Error("User name must not be empty");
  }
  if (!input.email.includes("@")) {
    throw new Error("Invalid email");
  }
}
