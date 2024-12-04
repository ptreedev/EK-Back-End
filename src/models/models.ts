import model from "../schemas/model";
import mongoose from "mongoose";
import { IUser, Item } from "../schemas/model";

export const selectUsers = async () => {
    const users = await model.find()
    return users;
};

export const findUserById = async (id: string) => {
    const user = await model.findById(id);
    return user;
};

export const findUserByUsername = async (username: string) => {
    const user = await model
        .findOne({ username: username })
        .then((data) => {
            if (data === null) {
                return Promise.reject({ status: 400, message: "invalid username" });
            } else return data
        })
    return user;
};

export const findLikesById = async (user_id: string) => {
    const data = await model.find(
        { "items.likes": user_id },
        { items: 1, _id: 0 }
    );
    const likes = data[0].items.filter((item) => {
        if (item.likes.includes(user_id)) {
            return item;
        };
    });
    return likes;
};

export const findItemsByUsername = async (username: string) => {
    const items = await model.findOne(
        { username: username },
        { items: 1, _id: 0 }
    );
    return items;
};

export const findItemById = async (id: string) => {
    const mongoID = mongoose.Types.ObjectId.createFromHexString(id)
    const data = await model
        .aggregate([
            { $unwind: "$items" },
            { $replaceRoot: { newRoot: "$items" } },
            { $match: { _id: mongoID } },
        ]);
    return data[0];
}

export const findItems = async (username: string) => {
    const items = await model.aggregate([
        { $match: { username: { $ne: username } } },
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
    ]);
    return items;
};

export const findMatchedAddresses = async (matching_id: string) => {
    const getMatches = await model.aggregate([
        { $unwind: "$matches" },
        { $replaceRoot: { newRoot: "$matches" } },
        { $match: { matching_id: matching_id } },
    ]);

    const firstMatch = getMatches[0];
    const secondMatch = getMatches[1];
    if (firstMatch.settrade && secondMatch.settrade) {
        const id_one = getMatches[0].match_user_id;
        const id_two = getMatches[1].match_user_id;
        const addressOne = await model.findOne(
            { _id: id_one },
            { address: 1, username: 1 }
        );
        const addressTwo = await model.findOne(
            { _id: id_two },
            { address: 1, username: 1 }
        );
        const addresses = [addressOne, addressTwo]
        return addresses;
    };
};

export const findAvailableTrades = async (matching_id: string, username: string) => {
    const getMatches = await model.aggregate([
        { $unwind: "$matches" },
        { $replaceRoot: { newRoot: "$matches" } },
        { $match: { matching_id: matching_id } },
    ]);
    if (getMatches[0].match_user_name !== username) {
        const e = new Error("invalid username");
        throw e;
    } else if (getMatches) {
        if (getMatches[0].match_user_name === username) {
            const list = [getMatches[1], getMatches[0]];
            return list;
        } else {
            return getMatches;
        };
    };
};

export const findMatches = async (user_id: string) => {
    const matches = await model.find({ _id: user_id }, { matches: 1 });
    return matches[0].matches;
};

export const insertUsers = async (users: IUser) => {
    const insertedUsers = await model.insertMany(users);
    return insertedUsers;
};

export const createUser = async (data: IUser) => {
    const user = new model(data);
    const newUser = await user.save();
    return newUser;
};

export const createNewItem = async (username: string, newItem: Item) => {
    const data = await model.findOneAndUpdate(
        { username: username },
        { $addToSet: { items: newItem } },
        { new: true });
    if (data === null) {
        const e = new Error("Username not found");
        e.name = "SyntaxError";
        throw e;
    } else return data;
};

export const createMatch = async (user: string, item: string) => {
    const user_id = mongoose.Types.ObjectId.createFromHexString(user)
    const item_id = mongoose.Types.ObjectId.createFromHexString(item)
    const getTheirId = await model.findOne(
        { "items._id": item_id },
        { _id: 1, username: 1 }
    );
    const getTheirItem = await model.aggregate([
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
        { $match: { _id: item_id } },
    ]);
    const their_id = getTheirId!._id!.toString();
    const currentMilliseconds = new Date().getTime();
    const theirObj = {
        match_user_id: their_id,
        match_user_name: getTheirId?.username,
        match_item_name: getTheirItem[0].item_name,
        match_img_string: getTheirItem[0].img_string,
        match_item_id: item_id,
        matching_id: currentMilliseconds,
    };

    const user_match_check = await model.findOne({
        $and: [{ _id: user_id }, { "items.likes": their_id }],
    });
    const options = { new: true, upsert: true };
    const their_id_check = await model.findOne({
        "matches.match_item_id": item_id,
    });
    if (user_match_check !== null && their_id_check === null) {
        const updateMatches = await model.findOneAndUpdate(
            { _id: user_id },
            { $addToSet: { matches: theirObj } },
            options
        );
        const userItem = user_match_check.items.map((item) => {
            if (item.likes.includes(their_id)) {
                return item;
            }
        });
        const userItemId = userItem[0]?._id?.toString();
        const ourObj = {
            match_user_id: user_id,
            match_user_name: user_match_check.username,
            match_item_name: userItem[0]?.item_name,
            match_img_string: userItem[0]?.img_string,
            match_item_id: userItemId,
            matching_id: currentMilliseconds,
        };
        const updateTheirMatches = await model.findOneAndUpdate(
            { _id: their_id },
            { $addToSet: { matches: ourObj } },
            options
        );
        return [updateMatches, updateTheirMatches]
    } else {
        return "not modified";
    };
};

export const updateTrade = async (match_id: string, bool: boolean) => {
    const changedBool = await model.findOneAndUpdate(
        { "matches._id": match_id },
        { $set: { "matches.$.settrade": bool } },
        { new: true }
    );
    if (changedBool === null) {
        const e = new Error();
        e.name = "ValidationError";
        throw e;
    } else return changedBool;
}