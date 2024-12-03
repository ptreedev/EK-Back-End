import model from "../schemas/model";
import mongoose from "mongoose";

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
        return addresses
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