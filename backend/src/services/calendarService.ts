import { Unit } from "../db/unit";
import { CalendarRepository } from "../repository/calendarRepository";
import { CalendarEntry } from "../types";

export class CalendarService {
    private calendarRepository: CalendarRepository;

    constructor(unit: Unit) {
        this.calendarRepository = new CalendarRepository(unit);
    }

    public getCalendarEntries(userId: number): CalendarEntry[] {
        return this.calendarRepository.findByUserId(userId);
    }

    public getCalendarEntryById(id: number): CalendarEntry | undefined {
        return this.calendarRepository.findById(id);
    }

    public addCalendarEntry(userId: number, recipeId: number, date: Date): CalendarEntry {
        return this.calendarRepository.create({
            date,
            userId,
            recipeId
        });
    }

    public removeCalendarEntry(userId: number, calendarEntryId: number): boolean {
        const entry = this.calendarRepository.findById(calendarEntryId);
        if (!entry || entry.userId !== userId) {
            return false;
        }
        return this.calendarRepository.deleteById(calendarEntryId);
    }
}