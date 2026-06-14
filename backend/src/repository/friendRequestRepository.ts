import { Unit } from "../db/unit";
import { FriendRequest } from "../types";
import { FRIEND_REQUEST_TTL_MS } from "../config";

export class FriendRequestRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    private cutoff(): string {
        return new Date(Date.now() - FRIEND_REQUEST_TTL_MS).toISOString();
    }

    public create(fromUserId: number, toUserId: number): FriendRequest {
        const createdAt = new Date().toISOString();
        // A stale (expired) row may still exist for the same pair; refresh it instead of failing.
        const stmt = this.unit.prepare<FriendRequest>(
            `INSERT INTO FriendRequest (fromUserId, toUserId, createdAt)
             VALUES (:fromUserId, :toUserId, :createdAt)
             ON CONFLICT (fromUserId, toUserId) DO UPDATE SET createdAt = excluded.createdAt
             RETURNING *`,
            { fromUserId, toUserId, createdAt }
        );
        const row = stmt.get();
        if (!row) {
            throw new Error("Failed to create friend request");
        }
        return row;
    }

    public findIncoming(toUserId: number): FriendRequest[] {
        const stmt = this.unit.prepare<FriendRequest>(
            "SELECT * FROM FriendRequest WHERE toUserId = :toUserId AND createdAt > :cutoff ORDER BY createdAt DESC",
            { toUserId, cutoff: this.cutoff() }
        );
        return stmt.all();
    }

    public findById(id: number): FriendRequest | undefined {
        const stmt = this.unit.prepare<FriendRequest>(
            "SELECT * FROM FriendRequest WHERE id = :id AND createdAt > :cutoff",
            { id, cutoff: this.cutoff() }
        );
        return stmt.get();
    }

    public findPending(fromUserId: number, toUserId: number): FriendRequest | undefined {
        const stmt = this.unit.prepare<FriendRequest>(
            "SELECT * FROM FriendRequest WHERE fromUserId = :fromUserId AND toUserId = :toUserId AND createdAt > :cutoff",
            { fromUserId, toUserId, cutoff: this.cutoff() }
        );
        return stmt.get();
    }

    public delete(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM FriendRequest WHERE id = :id",
            { id }
        );
        return stmt.run().changes > 0;
    }

    public deleteExpired(): void {
        const stmt = this.unit.prepare(
            "DELETE FROM FriendRequest WHERE createdAt <= :cutoff",
            { cutoff: this.cutoff() }
        );
        stmt.run();
    }
}
