import BetterSqlite3 from "better-sqlite3";
import { Database, Statement } from "better-sqlite3";

const dbFileName = "forkcast.db";

export class Unit {

    private readonly db: Database;
    private completed: boolean;

    public constructor(public readonly readOnly: boolean) {
        this.completed = false;
        this.db = DB.createDBConnection();
        if (!this.readOnly) {
            DB.beginTransaction(this.db);
        }
    }

    public prepare<TResult, TParams extends Record<string, unknown> = Record<string, unknown>>(
        sql: string,
        bindings?: TParams
    ): ITypedStatement<TResult, TParams> {
        const stmt = this.db.prepare<unknown[], TResult>(sql);
        if (bindings != null) {
            stmt.bind(bindings as unknown);
        }
        return stmt as unknown as ITypedStatement<TResult, TParams>;
    }

    public getLastRowId(): number {
        const stmt = this.prepare<{ id: number }>("SELECT last_insert_rowid() as \"id\"");
        const result = stmt.get();
        if (!result) {
            throw new Error("Unable to retrieve last inserted row id");
        }
        return result.id;
    }

    public complete(commit: boolean | null = null): void {
        if (this.completed) {
            return;
        }
        this.completed = true;

        if (commit !== null) {
            (commit ? DB.commitTransaction(this.db) : DB.rollbackTransaction(this.db));
        } else if (!this.readOnly) {
            throw new Error("transaction has been opened, requires information if commit or rollback needed");
        }
        this.db.close();
    }
}

class DB {
    public static createDBConnection(): Database {
        const db = new BetterSqlite3(dbFileName, {
            fileMustExist: false,
            verbose: (s: unknown) => DB.logStatement(s)
        });
        db.pragma("foreign_keys = ON");

        DB.ensureTablesCreated(db);
        DB.ensureFiltersSeeded(db);

        return db;
    }

    public static beginTransaction(connection: Database): void {
        connection.exec("begin transaction;");
    }

    public static commitTransaction(connection: Database): void {
        connection.exec("commit;");
    }

    public static rollbackTransaction(connection: Database): void {
        connection.exec("rollback;");
    }

    private static logStatement(statement: string | unknown): void {
        if (typeof statement !== "string") {
            return;
        }
        const start = statement.slice(0, 6).trim().toLowerCase();
        if (start.startsWith("pragma") || start.startsWith("create")) {
            return;
        }
        console.log(`SQL: ${statement}`);
    }

    private static ensureTablesCreated(connection: Database): void {
        connection.exec(`
            CREATE TABLE IF NOT EXISTS User (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                profilePicture TEXT,
                isVerified BOOLEAN NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS Recipe (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                image TEXT,
                sourceName TEXT,
                sourceUrl TEXT,
                readyInMinutes INTEGER NOT NULL DEFAULT 0,
                calories INTEGER NOT NULL DEFAULT 0,
                servings INTEGER NOT NULL DEFAULT 1,
                vegetarian BOOLEAN NOT NULL DEFAULT 0,
                vegan BOOLEAN NOT NULL DEFAULT 0,
                glutenFree BOOLEAN NOT NULL DEFAULT 0,
                dairyFree BOOLEAN NOT NULL DEFAULT 0,
                updatedAt DATETIME DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS RecipeDetails (
                recipeId INTEGER PRIMARY KEY,
                readyInMinutes INTEGER NOT NULL DEFAULT 0,
                servings INTEGER NOT NULL DEFAULT 0,
                stepCount INTEGER NOT NULL DEFAULT 0,
                ingredientCount INTEGER NOT NULL DEFAULT 0,
                pricePerServing REAL NOT NULL DEFAULT 0,
                effortScore INTEGER NOT NULL DEFAULT 1,
                rating INTEGER NOT NULL DEFAULT 1,
                aggregateLikes INTEGER NOT NULL DEFAULT 0,
                vegetarian BOOLEAN NOT NULL DEFAULT 0,
                vegan BOOLEAN NOT NULL DEFAULT 0,
                glutenFree BOOLEAN NOT NULL DEFAULT 0,
                dairyFree BOOLEAN NOT NULL DEFAULT 0,
                calories REAL NOT NULL DEFAULT 0,
                carbs REAL NOT NULL DEFAULT 0,
                protein REAL NOT NULL DEFAULT 0,
                fat REAL NOT NULL DEFAULT 0,
                alcohol REAL NOT NULL DEFAULT 0,
                caffeine REAL NOT NULL DEFAULT 0,
                sugar REAL NOT NULL DEFAULT 0,
                sodium REAL NOT NULL DEFAULT 0,
                fiber REAL NOT NULL DEFAULT 0,
                cholesterol REAL NOT NULL DEFAULT 0,
                saturatedFat REAL NOT NULL DEFAULT 0,
                vitaminA REAL NOT NULL DEFAULT 0,
                vitaminC REAL NOT NULL DEFAULT 0,
                vitaminD REAL NOT NULL DEFAULT 0,
                vitaminE REAL NOT NULL DEFAULT 0,
                vitaminK REAL NOT NULL DEFAULT 0,
                vitaminB1 REAL NOT NULL DEFAULT 0,
                vitaminB2 REAL NOT NULL DEFAULT 0,
                vitaminB3 REAL NOT NULL DEFAULT 0,
                vitaminB5 REAL NOT NULL DEFAULT 0,
                vitaminB6 REAL NOT NULL DEFAULT 0,
                vitaminB12 REAL NOT NULL DEFAULT 0,
                calcium REAL NOT NULL DEFAULT 0,
                copper REAL NOT NULL DEFAULT 0,
                fluoride REAL NOT NULL DEFAULT 0,
                iodine REAL NOT NULL DEFAULT 0,
                iron REAL NOT NULL DEFAULT 0,
                magnesium REAL NOT NULL DEFAULT 0,
                manganese REAL NOT NULL DEFAULT 0,
                phosphorus REAL NOT NULL DEFAULT 0,
                potassium REAL NOT NULL DEFAULT 0,
                selenium REAL NOT NULL DEFAULT 0,
                zinc REAL NOT NULL DEFAULT 0,
                choline REAL NOT NULL DEFAULT 0,
                folate REAL NOT NULL DEFAULT 0,
                folicAcid REAL NOT NULL DEFAULT 0,
                FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Notification (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                isRead BOOLEAN NOT NULL DEFAULT 0,
                userId INTEGER NOT NULL,
                FOREIGN KEY (userId) REFERENCES User(id)
            );

            CREATE TABLE IF NOT EXISTS Friend (
                userId INTEGER NOT NULL,
                friendId INTEGER NOT NULL,
                PRIMARY KEY (userId, friendId),
                FOREIGN KEY (userId) REFERENCES User(id),
                FOREIGN KEY (friendId) REFERENCES User(id)
            );

            CREATE TABLE IF NOT EXISTS CalenderEntry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATETIME NOT NULL,
                userId INTEGER NOT NULL,
                recipeId INTEGER NOT NULL,
                FOREIGN KEY (userId) REFERENCES User(id),
                FOREIGN KEY (recipeId) REFERENCES Recipe(id)
            );

            CREATE TABLE IF NOT EXISTS FavoriteFood (
                userId INTEGER NOT NULL,
                recipeId INTEGER NOT NULL,
                PRIMARY KEY (userId, recipeId),
                FOREIGN KEY (userId) REFERENCES User(id),
                FOREIGN KEY (recipeId) REFERENCES Recipe(id)
            );

            CREATE TABLE IF NOT EXISTS RecipeRating (
                userId INTEGER NOT NULL,
                recipeId INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                createdAt DATETIME DEFAULT (datetime('now')),
                PRIMARY KEY (userId, recipeId),
                FOREIGN KEY (userId) REFERENCES User(id),
                FOREIGN KEY (recipeId) REFERENCES Recipe(id)
            );

            CREATE TABLE IF NOT EXISTS RecipeIngredient (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipeId INTEGER NOT NULL,
                name TEXT NOT NULL,
                amount REAL NOT NULL DEFAULT 0,
                unit TEXT NOT NULL DEFAULT '',
                usAmount REAL,
                usUnit TEXT,
                metricAmount REAL,
                metricUnit TEXT,
                FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS RecipeInstruction (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipeId INTEGER NOT NULL,
                sectionName TEXT NOT NULL DEFAULT '',
                stepNumber INTEGER NOT NULL,
                stepText TEXT NOT NULL,
                lengthMinutes INTEGER,
                FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS FilterGroup (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                icon TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Filter (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                groupId INTEGER NOT NULL,
                name TEXT NOT NULL UNIQUE,
                prettyName TEXT NOT NULL,
                type TEXT NOT NULL,
                min REAL,
                max REAL,
                FOREIGN KEY (groupId) REFERENCES FilterGroup(id) ON DELETE CASCADE
            );
        `);

        const migrations = [
            "ALTER TABLE Recipe ADD COLUMN updatedAt DATETIME DEFAULT (datetime('now'))",
            "ALTER TABLE Recipe ADD COLUMN readyInMinutes INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE Recipe ADD COLUMN calories INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE Recipe ADD COLUMN servings INTEGER NOT NULL DEFAULT 1",
            "ALTER TABLE Recipe ADD COLUMN vegetarian BOOLEAN NOT NULL DEFAULT 0",
            "ALTER TABLE Recipe ADD COLUMN vegan BOOLEAN NOT NULL DEFAULT 0",
            "ALTER TABLE Recipe ADD COLUMN glutenFree BOOLEAN NOT NULL DEFAULT 0",
            "ALTER TABLE Recipe ADD COLUMN dairyFree BOOLEAN NOT NULL DEFAULT 0",
            "ALTER TABLE Recipe ADD COLUMN sourceName TEXT",
            "ALTER TABLE Recipe ADD COLUMN sourceUrl TEXT",
            "ALTER TABLE RecipeDetails ADD COLUMN pricePerServing REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN calories REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN carbs REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN protein REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN fat REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN alcohol REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN caffeine REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN sugar REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN sodium REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN fiber REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN cholesterol REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN saturatedFat REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminA REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminC REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminD REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminE REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminK REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminB1 REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminB2 REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminB3 REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminB5 REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminB6 REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN vitaminB12 REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN calcium REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN copper REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN fluoride REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN iodine REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN iron REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN magnesium REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN manganese REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN phosphorus REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN potassium REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN selenium REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN zinc REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN choline REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN folate REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeDetails ADD COLUMN folicAcid REAL NOT NULL DEFAULT 0",
            "ALTER TABLE RecipeInstruction ADD COLUMN ingredients TEXT NOT NULL DEFAULT '[]'",
            "ALTER TABLE RecipeInstruction ADD COLUMN equipment TEXT NOT NULL DEFAULT '[]'",
        ];
        for (const migration of migrations) {
            try {
                connection.exec(migration);
            } catch (_) {
                // Column already exists — expected on subsequent startups.
            }
        }
    }

     public static ensureFiltersSeeded(connection: Database): void {
         try {
             const filterCount = connection.prepare("SELECT COUNT(*) as count FROM Filter").get() as any;
             if (filterCount && filterCount.count === 0) {
                 // Seed happens in app.ts to avoid recursion during DB init
             }
         } catch {
             // Table might not exist yet, skip seeding
         }
     }
}

// Expose a tiny test-only hook so tests can exercise internal log branches (harmless)
export function __test_logStatement(input: unknown): void {
    // access internal DB implementation for testing
    // (keeps production behavior unchanged)
    (DB as any).logStatement(input);
}

type RawStatement<TResult> = BetterSqlite3.Statement<unknown[], TResult>;
type RunResult = ReturnType<RawStatement<unknown>["run"]>;

export interface ITypedStatement<TResult = unknown, TParams = unknown> {
    // phantom type, just carries the params type for tooling
    readonly _params?: TParams;

    get(): TResult | undefined;

    all(): TResult[];

    run(): RunResult;
}