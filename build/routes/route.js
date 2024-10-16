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
const express_1 = __importDefault(require("express"));
const model_1 = __importDefault(require("../models/model"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_json_1 = __importDefault(require("../../api.json"));
const router = express_1.default.Router();
// GET all users
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(api_json_1.default);
}));
router.get("/users", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield model_1.default.find();
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
}));
// POST many new users at once
router.post("/manyusers", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insert = yield model_1.default.insertMany(req.body);
        res.status(201).json(insert);
    }
    catch (error) {
        next(error);
    }
}));
//post a new user
router.post("/new-user", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = new model_1.default({
            name: req.body.name,
            username: req.body.username,
            items: req.body.items,
            address: req.body.address,
            matches: req.body.matches,
        });
        const newUser = yield data.save();
        res.status(201).json(newUser);
    }
    catch (error) {
        next(error);
    }
}));
//GET by user by ID
router.get("/users/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(`${req.params.id}`);
        const data = yield model_1.default.findById(id);
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
}));
//get user by username
router.get("/user/:username", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield model_1.default
            .findOne({ username: req.params.username })
            .then((data) => {
            if (data === null) {
                return Promise.reject({ status: 400, message: "invalid username" });
            }
            res.status(200).json(data);
        });
    }
    catch (error) {
        next(error);
    }
}));
//Brings back an array of liked items for a user
router.get("/likes/:user_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.user_id;
    try {
        const data = yield model_1.default.find({ "items.likes": id }, { items: 1, _id: 0 });
        const filt = data[0].items.filter((item) => {
            if (item.likes.includes(id)) {
                return item;
            }
        });
        res.status(200).json(filt);
    }
    catch (error) {
        next(error);
    }
}));
//GET a users Items from the database
router.get("/:username/items", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    try {
        const data = yield model_1.default.findOne({ username: username }, { items: 1, _id: 0 });
        res.status(200).json(data.items);
    }
    catch (error) {
        next(error);
    }
}));
//POST add a new items to your items
router.post("/items/:username", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.params.username;
        const newItem = {
            item_name: req.body.item_name,
            description: req.body.description,
            img_string: req.body.img_string,
            likes: [],
        };
        const options = { new: true };
        const data = yield model_1.default.findOneAndUpdate({ username: username }, { $addToSet: { items: newItem } }, options);
        if (data === null) {
            throw new Error("Status: 404: ");
        }
        else
            res.status(201).json(data);
    }
    catch (error) {
        next(error);
    }
}));
//GET items by item_ID
router.get("/items/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const data = yield model_1.default
            .aggregate([
            { $unwind: "$items" },
            { $replaceRoot: { newRoot: "$items" } },
            { $match: { _id: id } },
        ])
            .then((data) => {
            res.json(data[0]);
        });
    }
    catch (error) {
        next(error);
    }
}));
//GET all items
router.get("/items", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    try {
        const data = yield model_1.default.aggregate([
            { $match: { username: { $ne: username } } },
            { $unwind: "$items" },
            { $replaceRoot: { newRoot: "$items" } },
        ]);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.get("/tradesuccess/:matching_id/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const matching_id = req.params.matching_id;
    try {
        const getMatches = yield model_1.default.aggregate([
            { $unwind: "$matches" },
            { $replaceRoot: { newRoot: "$matches" } },
            { $match: { matching_id: matching_id } },
        ]);
        const firstMatch = getMatches[0];
        const secondMatch = getMatches[1];
        if (firstMatch.settrade && secondMatch.settrade) {
            const id_one = new mongoose_1.default.Types.ObjectId(getMatches[0].match_user_id);
            const id_two = new mongoose_1.default.Types.ObjectId(getMatches[1].match_user_id);
            const getAddress_one = yield model_1.default.findOne({ _id: id_one }, { address: 1, username: 1 });
            const getAddress_two = yield model_1.default.findOne({ _id: id_two }, { address: 1, username: 1 });
            res.status(200).json([getAddress_one, getAddress_two]);
        }
    }
    catch (error) {
        next(error);
    }
}));
//POST set a trade accept boolean in each of the userts matches
router.patch("/settrade", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const match_id = new mongoose_1.default.Types.ObjectId(`${req.body.match_id}`);
        const val = req.body.bool;
        const options = { new: true };
        const changeBool = yield model_1.default.findOneAndUpdate({ "matches._id": match_id }, { $set: { "matches.$.settrade": val } }, options);
        res.status(200).json(changeBool);
    }
    catch (error) {
        next(error);
    }
}));
//PATCH user items by adding a like
router.patch("/items/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const updatedData = req.body;
        const data = updatedData.likes;
        const options = { new: true };
        const result = yield model_1.default.findOneAndUpdate({ "items._id": id }, { $addToSet: { "items.$.likes": data } }, options);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//gets available trades
router.get("/trades/:matching_id/:username", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.matching_id) {
        const matching_id = req.params.matching_id;
        const username = req.params.username;
        const getMatches = yield model_1.default.aggregate([
            { $unwind: "$matches" },
            { $replaceRoot: { newRoot: "$matches" } },
            { $match: { matching_id: matching_id } },
        ]);
        if (getMatches) {
            if (getMatches[0].match_user_name === username) {
                const list = [getMatches[1], getMatches[0]];
                res.status(200).json(list);
            }
            else {
                res.status(200).json(getMatches);
            }
        }
    }
}));
//DELETE user by ID
router.delete("/delete/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield model_1.default.findByIdAndDelete(id);
        if (data) {
            res.send(`Document with ${data.name} has been deleted.`);
        }
        else {
            res.status(404).json({ message: "Document not found." });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
//gets an array of user matches
router.get("/matches/:user_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.user_id) {
        try {
            const id = new mongoose_1.default.Types.ObjectId(`${req.params.user_id}`);
            const data = yield model_1.default.find({ _id: id }, { matches: 1 });
            res.json(data[0].matches);
        }
        catch (error) {
            next(error);
        }
    }
    else {
        res.json([]);
    }
}));
//checks whether a match has occured
router.post("/matchcheck", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const user_id = new mongoose_1.default.Types.ObjectId(`${req.body.user_id}`);
        const item_id = new mongoose_1.default.Types.ObjectId(`${req.body.item_id}`);
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
            res.status(201).send([updateMatches, updateTheirMatches]);
        }
        else {
            res.status(304).send({ msg: "not modified" });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
