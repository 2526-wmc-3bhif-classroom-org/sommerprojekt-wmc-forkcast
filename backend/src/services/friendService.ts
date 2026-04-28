import { Unit } from "../db/unit";
import { FriendRepository } from "../repository/friendRepository";
import { Friend } from "../types";

export class FriendService {
    private friendRepository: FriendRepository;

    constructor(unit: Unit) {
        this.friendRepository = new FriendRepository(unit);
    }

    public getFriends(userId: number): Friend[] {
        return this.friendRepository.findByUserId(userId);
    }

    public addFriend(userId: number, friendId: number): Friend {
        if (userId === friendId) {
            throw new Error("Cannot add yourself as a friend");
        }
        return this.friendRepository.create(userId, friendId);
    }

    public removeFriend(userId: number, friendId: number): boolean {
        return this.friendRepository.delete(userId, friendId);
    }
}
