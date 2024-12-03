import { Request, Response, NextFunction } from "express";
import { selectUsers, findUserById, findUserByUsername, findLikesById, findItemsByUsername, findItemById, findItems } from "../models/models"

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await selectUsers()
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await findUserById(id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params
        const user = await findUserByUsername(username)
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const getLikesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = req.params;
        const likes = await findLikesById(user_id);
        res.status(200).json(likes);
    } catch (error) {
        next(error);
    }
};

export const getItemsByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const data = await findItemsByUsername(username);
        res.status(200).json(data?.items);
    } catch (error) {
        next(error);
    }
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const items = await findItemById(id);
        res.status(200).json(items)
    } catch (error) {
        next(error);
    }
}

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.query;
        if (typeof username !== "string") {
            throw new Error("Query param 'username' has to be of type string");
        } else {
            const items = await findItems(username);
            res.status(200).json(items);

        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}