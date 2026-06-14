import { Unit } from "../db/unit";
import { FriendRepository } from "../repository/friendRepository";
import { FriendRequestRepository } from "../repository/friendRequestRepository";
import { UserRepository } from "../repository/userRepository";
import { Friend, PublicUser, User } from "../types";

export type FriendServiceErrorCode =
    | "NOT_FOUND"
    | "SELF"
    | "ALREADY_FRIENDS"
    | "DUPLICATE"
    | "FORBIDDEN";

export class FriendServiceError extends Error {
    constructor(public code: FriendServiceErrorCode, message: string) {
        super(message);
        this.name = "FriendServiceError";
    }
}

export interface SendRequestResult {
    status: "pending" | "accepted";
    user: PublicUser;
}

export interface IncomingRequest extends PublicUser {
    requestId: number;
}

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
    };
}

export class FriendService {
    private friendRepository: FriendRepository;
    private requestRepository: FriendRequestRepository;
    private userRepository: UserRepository;

    constructor(unit: Unit) {
        this.friendRepository = new FriendRepository(unit);
        this.requestRepository = new FriendRequestRepository(unit);
        this.userRepository = new UserRepository(unit);
    }

    public getFriends(userId: number): Friend[] {
        return this.friendRepository.findByUserId(userId);
    }

    public removeFriend(userId: number, friendId: number): boolean {
        const a = this.friendRepository.delete(userId, friendId);
        const b = this.friendRepository.delete(friendId, userId);
        return a || b;
    }

    public sendRequest(fromUserId: number, username: string): SendRequestResult {
        const target = this.userRepository.findByName(username);
        if (!target) {
            throw new FriendServiceError("NOT_FOUND", "User not found");
        }
        if (target.id === fromUserId) {
            throw new FriendServiceError("SELF", "Cannot add yourself as a friend");
        }
        if (this.areFriends(fromUserId, target.id)) {
            throw new FriendServiceError("ALREADY_FRIENDS", "You are already friends");
        }

        // Both sides want it: a pending request the other way already exists -> auto-accept.
        const reverse = this.requestRepository.findPending(target.id, fromUserId);
        if (reverse) {
            this.addFriendship(fromUserId, target.id);
            this.requestRepository.delete(reverse.id);
            return { status: "accepted", user: toPublicUser(target) };
        }

        if (this.requestRepository.findPending(fromUserId, target.id)) {
            throw new FriendServiceError("DUPLICATE", "Friend request already sent");
        }

        this.requestRepository.create(fromUserId, target.id);
        return { status: "pending", user: toPublicUser(target) };
    }

    public getIncomingRequests(toUserId: number): IncomingRequest[] {
        return this.requestRepository.findIncoming(toUserId).flatMap(req => {
            const sender = this.userRepository.findById(req.fromUserId);
            if (!sender) return [];
            return [{ requestId: req.id, ...toPublicUser(sender) }];
        });
    }

    public acceptRequest(meId: number, requestId: number): PublicUser {
        const request = this.requestRepository.findById(requestId);
        if (!request || request.toUserId !== meId) {
            throw new FriendServiceError("NOT_FOUND", "Friend request not found");
        }
        const sender = this.userRepository.findById(request.fromUserId);
        if (!sender) {
            throw new FriendServiceError("NOT_FOUND", "Requesting user no longer exists");
        }
        this.addFriendship(meId, request.fromUserId);
        this.requestRepository.delete(requestId);
        return toPublicUser(sender);
    }

    public declineRequest(meId: number, requestId: number): void {
        const request = this.requestRepository.findById(requestId);
        if (!request || request.toUserId !== meId) {
            throw new FriendServiceError("NOT_FOUND", "Friend request not found");
        }
        this.requestRepository.delete(requestId);
    }

    private areFriends(userId: number, friendId: number): boolean {
        return this.friendRepository.findByUserId(userId).some(f => f.friendId === friendId);
    }

    private addFriendship(userId: number, friendId: number): void {
        this.friendRepository.create(userId, friendId);
        this.friendRepository.create(friendId, userId);
    }

    public static removeExpiredRequests(): void {
        const unit = new Unit(false);
        try {
            new FriendRequestRepository(unit).deleteExpired();
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }
}
