import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import mustache from "mustache";

const getTransporter = async () => {
    // If we are in test mode or missing credentials, we could use Ethereal (optional)
    // For now, we use the provided credentials but fix the secure configuration.
    
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // Fix for "wrong version number" error:
    // This error happens when the client expects SSL (secure: true) but server sends plain text.
    // Port 587 is usually STARTTLS (secure: false). Port 465 is usually Implicit SSL (secure: true).
    const secure = process.env.EMAIL_SECURE === "true" ? true : (port === 465);

    if (!host || !user || !pass) {
        console.warn("Email credentials missing. Using Ethereal for development.");
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return nodemailer.createTransport({
        host,
        port,
        secure, 
        auth: { user, pass },
        tls: {
            // connection generally works better without enforcing specific ciphers
            rejectUnauthorized: false // Helps with self-signed certs often used by ISPs
        }
    });
};

// Singleton-ish promise to avoid recreating transporter constantly, or recreate if needed.
// For simplicity in this project, we create it once or lazily.
let transporterPromise = getTransporter();

export const sendEmail = async (to: string, subject: string, text: string, html?: string,
                                attachments: {path: string, filename: string, cid: string}[] = []) => {
    try {
        const transporter = await transporterPromise;
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '"ForkCast" <no-reply@forkcast.com>',
            to,
            subject,
            text,
            html,
            attachments
        });

        console.log("Message sent: %s", info.messageId);
        
        // If using Ethereal, print the URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("Preview URL: %s", previewUrl);
        }

        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

// Simple caching maps
const localesCache: Record<string, any> = {};
const templateCache: Record<string, string> = {};

const loadTranslations = async (lang: string) => {
    if (localesCache[lang]) {
        return localesCache[lang];
    }

    try {
        const localePath = path.join(process.cwd(), `src/locales/${lang}.json`);
        const data = await fs.promises.readFile(localePath, "utf8");
        localesCache[lang] = JSON.parse(data);
        return localesCache[lang];
    } catch (e) {
        console.warn(`Could not load translations for ${lang}`, e);
        
        // Fallback to en if not already trying 'en'
        if (lang !== 'en') {
            return loadTranslations('en');
        }
        return {};
    }
};

const getTemplate = async (templateName: string) => {
    if (templateCache[templateName]) {
        return templateCache[templateName];
    }

    const templatePath = path.join(process.cwd(), `src/templates/${templateName}.html`);
    const html = await fs.promises.readFile(templatePath, "utf8");
    templateCache[templateName] = html;
    return html;
};

export const sendVerificationEmail = async (to: string, code: string, lang: string = 'en') => {
    const t = await loadTranslations(lang);
    
    // We can also use mustache for the text fallback!
    const subject = t.verificationEmail?.subject || "Your Verification Code";
    const textTemplate = t.verificationEmail?.text || "Your code is: {{code}}";
    const logoAttachment = {
        path: path.join(process.cwd(), "src/templates/logo.svg"),
        filename: "logo.svg",
        cid: "logo"
    }
    
    const context = {
        code,
        title: t.verificationEmail?.html?.title || "Verification Code",
        greeting: t.verificationEmail?.html?.greeting || "Hello,",
        intro: t.verificationEmail?.html?.intro || "Please use the verification code below:",
        outro: t.verificationEmail?.html?.outro || "If you didn't request this code, ignore this email.",
    };
    
    const text = mustache.render(textTemplate, context);

    try {
        const htmlTemplate = await getTemplate("verificationEmail");
        const html = mustache.render(htmlTemplate, context);
        
        await sendEmail(to, subject, text, html, [logoAttachment]);
    } catch (error) {
        console.error("Error sending verification email: ", error);
        // Fallback to plain text if template fails
        await sendEmail(to, subject, text);
    }
};
