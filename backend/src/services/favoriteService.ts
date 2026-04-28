import { Unit } from "../db/unit";
import { FavoriteRepository } from "../repository/favoriteRepository";
import { FavoriteFood } from "../types";

export class FavoriteService {
    private favoriteRepository: FavoriteRepository;

    constructor(unit: Unit) {
        this.favoriteRepository = new FavoriteRepository(unit);
    }

    public getFavorites(userId: number): FavoriteFood[] {
        return this.favoriteRepository.findByUserId(userId);
    }

    public addFavorite(userId: number, recipeId: number): FavoriteFood {
        return this.favoriteRepository.create(userId, recipeId);
    }

    public removeFavorite(userId: number, recipeId: number): boolean {
        return this.favoriteRepository.delete(userId, recipeId);
    }
}
