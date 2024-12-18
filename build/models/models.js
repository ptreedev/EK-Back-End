"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateLikes = exports.updateTrade = exports.createMatch = exports.createNewItem = exports.createUser = exports.insertUsers = exports.findMatches = exports.findAvailableTrades = exports.findMatchedAddresses = exports.findItems = exports.findItemById = exports.findItemsByUsername = exports.findLikesById = exports.findUserByUsername = exports.findUserById = exports.selectUsers = void 0;
const model_1 = __importDefault(require("../schemas/model"));
const mongoose_1 = __importDefault(require("mongoose"));
const selectUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield model_1.default.find();
    return users;
});
exports.selectUsers = selectUsers;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield model_1.default.findById(id);
    return user;
});
exports.findUserById = findUserById;
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield model_1.default
        .findOne({ username: username })
        .then((data) => {
        if (data === null) {
            return Promise.reject({ status: 400, message: "invalid username" });
        }
        else
            return data;
    });
    return user;
});
exports.findUserByUsername = findUserByUsername;
const findLikesById = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield model_1.default.find({ "items.likes": user_id }, { items: 1, _id: 0 });
    const likes = data[0].items.filter((item) => {
        if (item.likes.includes(user_id)) {
            return item;
        }
        ;
    });
    return likes;
});
exports.findLikesById = findLikesById;
const findItemsByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield model_1.default.findOne({ username: username }, { items: 1, _id: 0 });
    return items;
});
exports.findItemsByUsername = findItemsByUsername;
const findItemById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const mongoID = mongoose_1.default.Types.ObjectId.createFromHexString(id);
    const data = yield model_1.default
        .aggregate([
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
        { $match: { _id: mongoID } },
    ]);
    return data[0];
});
exports.findItemById = findItemById;
const findItems = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield model_1.default.aggregate([
        { $match: { username: { $ne: username } } },
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
    ]);
    return items;
});
exports.findItems = findItems;
const findMatchedAddresses = (matching_id) => __awaiter(void 0, void 0, void 0, function* () {
    const getMatches = yield model_1.default.aggregate([
        { $unwind: "$matches" },
        { $replaceRoot: { newRoot: "$matches" } },
        { $match: { matching_id: matching_id } },
    ]);
    const firstMatch = getMatches[0];
    const secondMatch = getMatches[1];
    if (firstMatch.settrade && secondMatch.settrade) {
        const id_one = getMatches[0].match_user_id;
        const id_two = getMatches[1].match_user_id;
        const addressOne = yield model_1.default.findOne({ _id: id_one }, { address: 1, username: 1 });
        const addressTwo = yield model_1.default.findOne({ _id: id_two }, { address: 1, username: 1 });
        const addresses = [addressOne, addressTwo];
        return addresses;
    }
    ;
});
exports.findMatchedAddresses = findMatchedAddresses;
const findAvailableTrades = (matching_id, username) => __awaiter(void 0, void 0, void 0, function* () {
    const getMatches = yield model_1.default.aggregate([
        { $unwind: "$matches" },
        { $replaceRoot: { newRoot: "$matches" } },
        { $match: { matching_id: matching_id } },
    ]);
    if (getMatches[0].match_user_name !== username) {
        const e = new Error("invalid username");
        throw e;
    }
    else if (getMatches) {
        if (getMatches[0].match_user_name === username) {
            const list = [getMatches[1], getMatches[0]];
            return list;
        }
        else {
            return getMatches;
        }
        ;
    }
    ;
});
exports.findAvailableTrades = findAvailableTrades;
const findMatches = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const matches = yield model_1.default.find({ _id: user_id }, { matches: 1 });
    return matches[0].matches;
});
exports.findMatches = findMatches;
const insertUsers = (users) => __awaiter(void 0, void 0, void 0, function* () {
    const insertedUsers = yield model_1.default.insertMany(users);
    return insertedUsers;
});
exports.insertUsers = insertUsers;
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new model_1.default(data);
    const newUser = yield user.save();
    return newUser;
});
exports.createUser = createUser;
const createNewItem = (username, newItem) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield model_1.default.findOneAndUpdate({ username: username }, { $addToSet: { items: newItem } }, { new: true });
    if (data === null) {
        const e = new Error("Username not found");
        e.name = "SyntaxError";
        throw e;
    }
    else
        return data;
});
exports.createNewItem = createNewItem;
const createMatch = (user, item) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const user_id = mongoose_1.default.Types.ObjectId.createFromHexString(user);
    const item_id = mongoose_1.default.Types.ObjectId.createFromHexString(item);
    const getTheirId = yield model_1.default.findOne({ "items._id": item_id }, { _id: 1, username: 1 });
    const getTheirItem = yield model_1.default.aggregate([
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
        { $match: { _id: item_id } },
    ]);
    const their_id = getTheirId._id.toString();
    const currentMilliseconds = new Date().getTime();
    const theirObj = {
        match_user_id: their_id,
        match_user_name: getTheirId === null || getTheirId === void 0 ? void 0 : getTheirId.username,
        match_item_name: getTheirItem[0].item_name,
        match_img_string: getTheirItem[0].img_string,
        match_item_id: item_id,
        matching_id: currentMilliseconds,
    };
    const user_match_check = yield model_1.default.findOne({
        $and: [{ _id: user_id }, { "items.likes": their_id }],
    });
    const options = { new: true, upsert: true };
    const their_id_check = yield model_1.default.findOne({
        "matches.match_item_id": item_id,
    });
    if (user_match_check !== null && their_id_check === null) {
        const updateMatches = yield model_1.default.findOneAndUpdate({ _id: user_id }, { $addToSet: { matches: theirObj } }, options);
        const userItem = user_match_check.items.map((item) => {
            if (item.likes.includes(their_id)) {
                return item;
            }
        });
        const userItemId = (_b = (_a = userItem[0]) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
        const ourObj = {
            match_user_id: user_id,
            match_user_name: user_match_check.username,
            match_item_name: (_c = userItem[0]) === null || _c === void 0 ? void 0 : _c.item_name,
            match_img_string: (_d = userItem[0]) === null || _d === void 0 ? void 0 : _d.img_string,
            match_item_id: userItemId,
            matching_id: currentMilliseconds,
        };
        const updateTheirMatches = yield model_1.default.findOneAndUpdate({ _id: their_id }, { $addToSet: { matches: ourObj } }, options);
        return [updateMatches, updateTheirMatches];
    }
    else {
        return "not modified";
    }
    ;
});
exports.createMatch = createMatch;
const updateTrade = (match_id, bool) => __awaiter(void 0, void 0, void 0, function* () {
    const changedBool = yield model_1.default.findOneAndUpdate({ "matches._id": match_id }, { $set: { "matches.$.settrade": bool } }, { new: true });
    if (changedBool === null) {
        const e = new Error();
        e.name = "ValidationError";
        throw e;
    }
    else
        return changedBool;
});
exports.updateTrade = updateTrade;
const updateLikes = (id, likedId) => __awaiter(void 0, void 0, void 0, function* () {
    const formattedId = mongoose_1.default.Types.ObjectId.createFromHexString(id);
    const formattedLikedId = mongoose_1.default.Types.ObjectId.createFromHexString(likedId);
    const updatedLikes = yield model_1.default.findOneAndUpdate({ "items._id": formattedId }, { $addToSet: { "items.$.likes": formattedLikedId } }, { new: true });
    return updatedLikes;
});
exports.updateLikes = updateLikes;
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedUser = yield model_1.default.findByIdAndDelete(id);
    return deletedUser;
});
exports.deleteUserById = deleteUserById;
