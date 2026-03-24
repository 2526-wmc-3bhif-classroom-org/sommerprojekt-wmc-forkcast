import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "30m";

const generateJWT = (userId: number) => {
    //@ts-ignore
    return jwt.sign({userId}, JWT_SECRET, {expiresIn: JWT_EXPIRY});
};

export { generateJWT };
