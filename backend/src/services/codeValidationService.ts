import {sendResetPasswordEmail, sendVerificationEmail} from "../utils/mailingUtils";
import {generateCode} from "../utils";

const verificationCodeMap: Map<string, number> = new Map();
const passwordResetCodeMap: Map<string, number> = new Map();

export function sendEmail(email: string, lang: string = 'en'): Promise<void> {
    const code = generateCode()
    verificationCodeMap.set(email, code)
    return sendVerificationEmail(email, code.toString(), lang)
}

export function verifyCode(email: string, code: string): boolean {
    const expectedCode = verificationCodeMap.get(email)
    if (!expectedCode) {
        return false
    }
    if (code !== expectedCode.toString()) {
        return false
    }
    verificationCodeMap.delete(email)
    return true
}

export function sendPasswordResetEmail(email: string, lang: string = 'en'): Promise<void> {
    const code = generateCode()
    passwordResetCodeMap.set(email, code)
    return sendResetPasswordEmail(email, code.toString(), lang)
}

export function verifyPasswordResetCode(email: string, code: string): boolean {
    const expectedCode = passwordResetCodeMap.get(email)
    if (!expectedCode) {
        return false
    }
    if (code !== expectedCode.toString()) {
        return false
    }
    passwordResetCodeMap.delete(email)
    return true
}
