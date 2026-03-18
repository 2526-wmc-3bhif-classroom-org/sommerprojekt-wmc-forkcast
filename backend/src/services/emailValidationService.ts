import {sendVerificationEmail} from "../utils/mailingUtils";

const codeMap: Map<string, number> = new Map();

function generateCode(): number {
    const min = 100000
    const max = 999999
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function sendEmail(email: string, lang: string = 'en'): Promise<void> {
    const code = generateCode()
    codeMap.set(email, code)
    return sendVerificationEmail(email, code.toString(), lang)
}

export function verifyCode(email: string, code: string): boolean {
    const expectedCode = codeMap.get(email)
    if (!expectedCode) {
        return false
    }
    if (code !== expectedCode.toString()) {
        return false
    }
    codeMap.delete(email)
    return true
}
