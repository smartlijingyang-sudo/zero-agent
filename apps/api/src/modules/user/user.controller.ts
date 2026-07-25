import { CreateUserSchema } from "@zero-agent/contracts/user";
import { createLogger } from "@zero-agent/logger";
import { UserService } from "./user.service.js";

const logger = createLogger("api:user:controller");

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUser(id: string) {
    logger.info("getUser", { id });
    return this.userService.findById(id);
  }

  async createUser(input: unknown) {
    const data = CreateUserSchema.parse(input);
    logger.info("createUser", { email: data.email });
    return this.userService.create(data);
  }
}
