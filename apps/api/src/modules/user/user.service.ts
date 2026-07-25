import { createLogger } from "@zero-agent/logger";
import type { CreateUser, User } from "@zero-agent/contracts/user";
import type { UserRepository } from "./user.repo.js";
import { validateUser } from "./user.domain.js";

const logger = createLogger("api:user:service");

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async create(input: CreateUser): Promise<User> {
    validateUser(input);
    const user = await this.userRepo.create(input);
    logger.info("user created", { id: user.id });
    // TODO: publish domain event via user.events.ts → MQ
    return user;
  }
}
