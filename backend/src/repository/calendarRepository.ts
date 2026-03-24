import { Unit } from "../db/unit";
import { CalendarEntry } from "../types";

export class CalendarRepository {
    private unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
    }

    public findByUserId(userId: number): CalendarEntry[] {
        const stmt = this.unit.prepare<CalendarEntry>("SELECT * FROM CalenderEntry WHERE userId = :userId", { userId });
        return stmt.all();
    }

    public findById(id: number): CalendarEntry | undefined {
        const stmt = this.unit.prepare<CalendarEntry>("SELECT * FROM CalenderEntry WHERE id = :id", { id });
        return stmt.get();
    }

    public create(calendarEntry: Omit<CalendarEntry, "id">): CalendarEntry {
        const stmt = this.unit.prepare(
            "INSERT INTO CalenderEntry (date, userId, recipeId) VALUES (:date, :userId, :recipeId)",
            {
                date: calendarEntry.date.toISOString(),
                userId: calendarEntry.userId,
                recipeId: calendarEntry.recipeId
            });
        stmt.run();
        const newId = this.unit.getLastRowId();
        const newEntry = this.findById(newId);
        if (!newEntry) {
            throw new Error("Failed to create calendar entry");
        }
        return newEntry;
    }

    public deleteById(id: number): boolean {
        const stmt = this.unit.prepare("DELETE FROM CalenderEntry WHERE id = :id", { id });
        const result = stmt.run();
        return result.changes > 0;
    }
}