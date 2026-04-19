export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
}
