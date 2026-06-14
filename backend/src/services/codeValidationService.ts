import {sendResetPasswordEmail, sendVerificationEmail} from "../utils/mailingUtils";
import {generateCode} from "../utils";
import {VERIFICATION_CODE_TTL_MS} from "../config";

const verificationCodeMap: Map<string, { code: number, expiresAt: number }> = new Map();
const passwordResetCodeMap: Map<string, { code: number, expiresAt: number }> = new Map();

export function sendEmail(email: string, lang: string = 'en'): Promise<void> {
    const code = generateCode()
    verificationCodeMap.set(email, { code, expiresAt: Date.now() + VERIFICATION_CODE_TTL_MS })
    return sendVerificationEmail(email, code.toString(), lang)
}

export function verifyCode(email: string, code: string): boolean {
    const entry = verificationCodeMap.get(email)
    if (!entry) {
        return false
    }
    if (Date.now() > entry.expiresAt) {
        verificationCodeMap.delete(email)
        return false
    }
    if (code !== entry.code.toString()) {
        return false
    }
    verificationCodeMap.delete(email)
    return true
}

export function sendPasswordResetEmail(email: string, lang: string = 'en'): Promise<void> {
    const code = generateCode()
    passwordResetCodeMap.set(email, { code, expiresAt: Date.now() + VERIFICATION_CODE_TTL_MS })
    return sendResetPasswordEmail(email, code.toString(), lang)
}

export function verifyPasswordResetCode(email: string, code: string): boolean {
    const entry = passwordResetCodeMap.get(email)
    if (!entry) {
        return false
    }
    if (Date.now() > entry.expiresAt) {
        passwordResetCodeMap.delete(email)
        return false
    }
    if (code !== entry.code.toString()) {
        return false
    }
    passwordResetCodeMap.delete(email)
    return true
}
