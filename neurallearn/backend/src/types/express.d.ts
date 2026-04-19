import { JwtUserPayload } from "../services/authService";

declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}
