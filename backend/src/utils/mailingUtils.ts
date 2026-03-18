import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const transporter = await transporterPromise;
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '"ForkCast" <no-reply@forkcast.com>',
            to,
            subject,
            text,
            html,
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

export const sendVerificationEmail = async (to: string, code: string) => {
    const subject = "Your Verification Code - ForkCast";
    const text = `Thank you for registering with Forkcast. Your verification code is: ${code}`;
    
    try {
        const templatePath = path.join(process.cwd(), "src/templates/verificationEmail.html");
        let html = fs.readFileSync(templatePath, "utf8");
        html = html.replace("{{code}}", code);
        
        await sendEmail(to, subject, text, html);
    } catch (error) {
        console.error("Error sending verification email: ", error);
        // Fallback to plain text if template fails
        await sendEmail(to, subject, text);
    }
};
