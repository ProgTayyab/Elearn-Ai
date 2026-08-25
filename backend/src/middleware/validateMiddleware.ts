import { Request, Response, NextFunction } from "express";

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;
    const errors: string[] = [];

    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Invalid email format");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    } else if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        errors.push("Name is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
};
