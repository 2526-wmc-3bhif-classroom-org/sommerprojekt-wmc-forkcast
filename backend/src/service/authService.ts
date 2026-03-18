import { Unit } from "../db/unit";
import { UserRepository } from "../repository/userRepository";
import { User } from "../types";
import { hashPassword, comparePassword } from "../utils";
import { generateJWT } from "../utils/jwtUtils";
import {sendEmail} from "../services/emailValidationService";

export class AuthService {
    private userRepository: UserRepository;

    constructor(unit: Unit) {
        this.userRepository = new UserRepository(unit);
    }

    public async register(name: string, email: string, password: string): Promise<Omit<User, "password">> {
        const existingUser = this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const hashedPassword = await hashPassword(password);

        const newUser = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            profilePicture: null,
            isVerified: false
        });

        sendEmail(email).catch(error => {
            console.error(`Failed to send verification email to ${email}:`, error);
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    public async login(email: string, password: string) {
        const user = this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        
        if (!user.isVerified) {
            throw new Error("Account not verified. Please check your email.");
        }

        const token = generateJWT(user.id.toString());
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        }
    }

    public async verifyUser(email: string): Promise<void> {
        const user = this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        this.userRepository.updateVerificationStatus(email, true);
    }
}
