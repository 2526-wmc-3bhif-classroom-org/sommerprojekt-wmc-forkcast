export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    profilePicture: string | null;
}

export interface Recipe {
    id: number;
    name: string;
    image: string;
    updatedAt?: Date;
}

export interface Notification {
    id: number;
    type: string;
    content: string;
    isRead: boolean;
    userId: number;
}

export interface Friend {
    userId: number;
    friendId: number;
}

export interface CalendarEntry {
    id: number;
    date: Date;
    userId: number;
    recipeId: number;
}

export interface FavoriteFood {
    userId: number;
    recipeId: number;
}
