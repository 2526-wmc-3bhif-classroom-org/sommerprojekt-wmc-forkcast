import { Recipe } from '../types';
import { LocalRecipeRepository } from '../repository/localRecipeRepository';
import { RemoteRecipeRepository } from '../repository/remoteRecipeRepository';

export class RecipeService {
    private localRepo: LocalRecipeRepository;
    private remoteRepo: RemoteRecipeRepository;

    constructor() {
        this.localRepo = new LocalRecipeRepository();
        this.remoteRepo = new RemoteRecipeRepository();
    }

    async searchRecipes(query: string, userIp?: string, number: number = 4): Promise<Recipe[]> {
        const localRecipes = await this.localRepo.searchRecipes(query);
        if (localRecipes.length >= number) {
            return localRecipes.slice(0, number);
        }

        const remoteRecipes = await this.remoteRepo.searchRecipes(query, userIp, number);
        
        // Save new recipes to local database asynchronously
        for (const recipe of remoteRecipes) {
            this.localRepo.saveRecipe(recipe).catch(console.error);
        }

        // Merge results ensuring uniqueness by ID
        const existingIds = new Set(localRecipes.map(r => r.id));
        const combined = [...localRecipes];
        for (const r of remoteRecipes) {
            if (!existingIds.has(r.id)) {
                combined.push(r);
            }
        }

        return combined.slice(0, number);
    }

    async getRecipeById(id: number, userIp?: string): Promise<Recipe | undefined> {
        const localRecipe = await this.localRepo.findRecipeById(id);
        if (localRecipe) {
            return localRecipe;
        }

        try {
            const remoteRecipe = await this.remoteRepo.getRecipeById(id, userIp);
            await this.localRepo.saveRecipe(remoteRecipe);
            return remoteRecipe;
        } catch (error) {
            console.error(`Failed to fetch recipe ${id} from remote source`, error);
            return undefined;
        }
    }

    async removeExpiredRecipes(): Promise<void> {
        await this.localRepo.removeExpiredRecipes();
    }
}
