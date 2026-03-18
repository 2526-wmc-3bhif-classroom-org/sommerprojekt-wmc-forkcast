import type {User} from "~/assets/model/user";

export type AuthResponse = {
    user: User;
    token: string;
}