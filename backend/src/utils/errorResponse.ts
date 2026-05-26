import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface ErrorResponseBody {
    message: string;
}

export class ErrorResponse {
    static send(res: Response, status: StatusCodes, message: string): Response {
        return res.status(status).json({ message });
    }

    static badRequest(res: Response, message: string): Response {
        return this.send(res, StatusCodes.BAD_REQUEST, message);
    }

    static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
        return this.send(res, StatusCodes.UNAUTHORIZED, message);
    }

    static forbidden(res: Response, message: string = 'Forbidden'): Response {
        return this.send(res, StatusCodes.FORBIDDEN, message);
    }

    static notFound(res: Response, message: string): Response {
        return this.send(res, StatusCodes.NOT_FOUND, message);
    }

    static conflict(res: Response, message: string): Response {
        return this.send(res, StatusCodes.CONFLICT, message);
    }

    static internalServerError(res: Response, message: string = 'An error occurred'): Response {
        return this.send(res, StatusCodes.INTERNAL_SERVER_ERROR, message);
    }

    static tooManyRequests(res: Response, message: string, retryAfter?: number): Response {
        const body: any = { message };
        if (retryAfter !== undefined) {
            body.retry_after = retryAfter;
        }
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json(body);
    }
}
