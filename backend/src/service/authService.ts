import { Unit } from "../db/unit";
import { UserRepository } from "../repository/userRepository";
import { User } from "../types";
import { hashPassword, comparePassword } from "../utils";
import { generateJWT } from "../utils/jwtUtils";
import { Response } from "express";

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
            profilePicture: null
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    public async login(res: Response, email: string, password: string): Promise<Omit<User, "password">> {
        const user = this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        generateJWT(res, user.id.toString()); // Assuming user.id is a number, convert to string for jwtUtils
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
