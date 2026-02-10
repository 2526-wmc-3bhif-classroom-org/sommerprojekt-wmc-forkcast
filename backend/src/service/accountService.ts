import { AccountRepository } from "../repository/accountRepository";
import { Unit } from "../db/unit";
import { hashPassword } from "../utils";

export class AccountService {
    public async createAccount(username: string, email: string, password: string): Promise<void> {
        const unit = new Unit(false);
        try {
            const repo = new AccountRepository(unit);
            if (repo.exists(username)) {
                throw new Error("Username already taken");
            }

            const hashedPassword = await hashPassword(password);
            console.log(hashedPassword);
            repo.createAccount(username, email, hashedPassword);

            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }
}
