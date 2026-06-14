import { Unit } from "../db/unit";
import { RatingAggregate, RatingRepository } from "../repository/ratingRepository";

export interface RatingResult {
    rating: { rating: number; count: number };
    userRating: number;
}

export class RatingService {
    private ratingRepository: RatingRepository;

    constructor(unit: Unit) {
        this.ratingRepository = new RatingRepository(unit);
    }

    public rate(userId: number, recipeId: number, rating: number): RatingResult {
        this.ratingRepository.upsert(userId, recipeId, rating);
        const aggregate = this.ratingRepository.getAggregate(recipeId);
        return {
            rating: { rating: Math.round(aggregate.average * 10) / 10, count: aggregate.count },
            userRating: rating,
        };
    }

    public getAggregate(recipeId: number): RatingAggregate {
        return this.ratingRepository.getAggregate(recipeId);
    }
}
