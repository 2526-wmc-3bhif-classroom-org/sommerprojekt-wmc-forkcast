import { UserRepository } from "../repository/userRepository";
import { Unit } from "../db/unit";
import { hashPassword, comparePassword } from "../utils";

export class UserService {

    public async createAccount(username: string, email: string, password: string): Promise<void> {
        const unit = new Unit(false);
        try {
            const repo = new UserRepository(unit);

            if (repo.exists(username)) {
                throw new Error("Username already taken");
            }

            const hashedPassword = await hashPassword(password);
            repo.createAccount(username, email, hashedPassword);

            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public async loginAccount(username: string, password: string): Promise<boolean> {
        const unit = new Unit(true);
        try {
            const repo = new UserRepository(unit);

            const user = repo.findByUsername(username);
            if (!user) return false;

            return await comparePassword(password, user.password);
        } finally {
            unit.complete();
        }
    }
}
