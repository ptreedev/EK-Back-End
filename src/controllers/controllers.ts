import { Request, Response, NextFunction } from "express";
import { selectUsers, findUserById } from "../models/models"

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await selectUsers()
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await findUserById(id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

