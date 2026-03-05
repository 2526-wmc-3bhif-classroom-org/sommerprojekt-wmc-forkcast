import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Unit } from "../db/unit";
import { UserRepository } from "../repository/userRepository";
import { User } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey"; // TODO: Use a strong secret from environment variables

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            profilePicture: null
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    public async login(email: string, password: string): Promise<string> {
        const user = this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        return token;
    }

    public verifyToken(token: string): { userId: number; email: string } {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
            return decoded;
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }
}
