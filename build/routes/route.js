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
router.patch("/settrade", controllers_1.patchTrade);
//PATCH user items by adding a like
router.patch("/items/:id", controllers_1.patchItem);
//DELETE user by ID
router.delete("/delete/:id", controllers_1.deleteUser);
exports.default = router;
