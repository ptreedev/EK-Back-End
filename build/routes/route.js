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
const model_1 = __importDefault(require("../schemas/model"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_json_1 = __importDefault(require("../../api.json"));
const controllers_1 = require("../controllers/controllers");
const router = express_1.default.Router();
// GET API endpoints
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(api_json_1.default);
}));
// GET all users
router.get("/users", controllers_1.getUsers);
//GET by user by ID
router.get("/users/:id", controllers_1.getUserById);
//GET user by username
router.get("/user/:username", controllers_1.getUserByUsername);
//GET an array of users liked items 
router.get("/likes/:user_id", controllers_1.getLikesById);
//GET a users items 
router.get("/:username/items", controllers_1.getItemsByUsername);
//GET items by item_ID
router.get("/items/:id", controllers_1.getItemById);
//GET all items not owned by logged in user
router.get("/items", controllers_1.getItems);
// GET addresses of users upon successful match
router.get("/tradesuccess/:matching_id/", controllers_1.getAddresses);
//GET available trades for a user
router.get("/trades/:matching_id/:username", controllers_1.getTrades);
//GET an array of user matches
router.get("/matches/:user_id", controllers_1.getMatches);
// POST new users
router.post("/manyusers", controllers_1.postNewUsers);
// POST a new user
router.post("/new-user", controllers_1.postNewUser);
//POST add a new item 
router.post("/items/:username", controllers_1.postNewItem);
//checks whether a match has occured and if true, creates a match subdocument
router.post("/matchcheck", controllers_1.createMatchesSubDoc);
//PATCH set a trade accept boolean in a users matches subdocument
router.patch("/settrade", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((req.body.match_id === undefined || null) || (typeof req.body.bool !== "boolean")) {
            res.status(422).send({ message: "Invalid request, check submitted fields" });
        }
        const match_id = new mongoose_1.default.Types.ObjectId(`${req.body.match_id}`);
        const val = req.body.bool;
        const options = { new: true };
        const changeBool = yield model_1.default.findOneAndUpdate({ "matches._id": match_id }, { $set: { "matches.$.settrade": val } }, options);
        if (changeBool === null) {
            const e = new Error();
            e.name = "ValidationError";
            throw e;
        }
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
        const data = mongoose_1.default.Types.ObjectId.createFromHexString(updatedData.likes);
        const options = { new: true };
        const result = yield model_1.default.findOneAndUpdate({ "items._id": id }, { $addToSet: { "items.$.likes": data } }, options);
        res.status(200).send(result);
    }
    catch (error) {
        if (error.message === "hex string must be 24 characters") {
            res.status(422).json({ message: "Invalid request" });
        }
        else
            res.status(400).json({ message: error.message });
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
exports.default = router;
