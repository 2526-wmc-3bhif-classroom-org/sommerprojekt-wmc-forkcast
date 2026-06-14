export type PublicUser = {
    id: number;
    name: string;
    profilePicture: string | null;
    isVerified: boolean;
};

export type IncomingRequest = PublicUser & { requestId: number };
