import type { CreateUser, User } from "@zero-agent/contracts/user";
import type { DbClient } from "@zero-agent/data-clients/db";

/**
 * Infrastructure layer — implements data access.
 * Depends on data-clients, NOT directly on db drivers.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(input: CreateUser): Promise<User>;
}

export function createUserRepository(db: DbClient): UserRepository {
  return {
    async findById(id: string) {
      const rows = await db.query<User>("SELECT * FROM users WHERE id = $1", [id]);
      return rows[0] ?? null;
    },
    async create(input: CreateUser) {
      const rows = await db.query<User>(
        "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
        [input.email, input.name],
      );
      return rows[0]!;
    },
  };
}
