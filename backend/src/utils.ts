import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(plain, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

export function parseDurationToMilliseconds(duration: string | undefined, defaultMs: number): number {
    if (!duration) return defaultMs;

    // Check if it's already a number string
    if (/^\d+$/.test(duration)) {
        return parseInt(duration, 10);
    }

    const match = duration.match(/^(\d+)(s|m|min|h|d|y)?$/);
    if (!match) {
        console.warn(`Invalid duration format: "${duration}". Using default.`);
        return defaultMs;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return value * 1000;
        case 'm':
        case 'min': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return value; // Should assume ms if no unit matched (though regex enforces unit or digits)
    }
}
