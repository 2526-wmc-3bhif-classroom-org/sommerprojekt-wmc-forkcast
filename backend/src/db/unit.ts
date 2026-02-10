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
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                profilePicture TEXT
            );

            CREATE TABLE IF NOT EXISTS Recipe (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                image TEXT
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
        `);
    }
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