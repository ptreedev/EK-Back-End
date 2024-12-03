import { Request, Response, NextFunction } from "express";
import { selectUsers, findUserById, findUserByUsername, findLikesById, findItemsByUsername, findItemById, findItems, findMatchedAddresses, findAvailableTrades, findMatches, insertUsers, createUser, createNewItem } from "../models/models"
import { Item, IUser } from "../schemas/model";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await selectUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    };
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await findUserById(id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    };
};

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params
        const user = await findUserByUsername(username);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    };
};

export const getLikesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = req.params;
        const likes = await findLikesById(user_id);
        res.status(200).json(likes);
    } catch (error) {
        next(error);
    };
};

export const getItemsByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const data = await findItemsByUsername(username);
        res.status(200).json(data?.items);
    } catch (error) {
        next(error);
    };
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const items = await findItemById(id);
        res.status(200).json(items);
    } catch (error) {
        next(error);
    };
};

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
    };
};

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    const { matching_id } = req.params;
    try {
        const addresses = await findMatchedAddresses(matching_id);
        res.status(200).json(addresses);

    } catch (error) {
        next(error);
    };
};

export const getTrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.params.matching_id) {
            const { matching_id, username } = req.params;
            const availableTrades = await findAvailableTrades(matching_id, username);
            res.status(200).json(availableTrades)
        };
    }
    catch (error) {
        next(error)
    };
};

export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.user_id) {
        try {
            const { user_id } = req.params;
            const matches = await findMatches(user_id)
            res.status(200).json(matches);
        } catch (error) {
            next(error);
        };
    } else {
        res.json([]);
    };
};

export const postNewUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const insertedUsers = await insertUsers(req.body);
        res.status(201).json(insertedUsers);
    } catch (error) {
        next(error);
    };
};

export const postNewUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: IUser = {
            name: req.body.name,
            username: req.body.username,
            items: req.body.items,
            address: req.body.address,
            matches: req.body.matches,
        };
        const newUser = await createUser(data);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    };
};

export const postNewItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const newItem: Item = {
            item_name: req.body.item_name,
            description: req.body.description,
            img_string: req.body.img_string,
            likes: [],
        };
        if (newItem.item_name === undefined || newItem.description === undefined || newItem.img_string === undefined) {
            const e = new Error("Validation Failed");
            e.name = "ValidationError";
            throw e;
        };
        const updatedDocument = await createNewItem(username, newItem);
        res.status(201).json(updatedDocument);
    } catch (error) {
        next(error)
    };
};