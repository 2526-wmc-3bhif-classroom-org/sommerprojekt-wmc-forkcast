export interface Failure {
    message: string | null;
    errors: {
        type: string;
        value: string;
        msg: string;
        path: string;
        location: string;
    } [] | null;

}