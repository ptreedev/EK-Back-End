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
}

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
}