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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = exports.getTrades = exports.getAddresses = exports.getItems = exports.getItemById = exports.getItemsByUsername = exports.getLikesById = exports.getUserByUsername = exports.getUserById = exports.getUsers = void 0;
const models_1 = require("../models/models");
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, models_1.selectUsers)();
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield (0, models_1.findUserById)(id);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserById = getUserById;
const getUserByUsername = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const user = yield (0, models_1.findUserByUsername)(username);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserByUsername = getUserByUsername;
const getLikesById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const likes = yield (0, models_1.findLikesById)(user_id);
        res.status(200).json(likes);
    }
    catch (error) {
        next(error);
    }
});
exports.getLikesById = getLikesById;
const getItemsByUsername = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const data = yield (0, models_1.findItemsByUsername)(username);
        res.status(200).json(data === null || data === void 0 ? void 0 : data.items);
    }
    catch (error) {
        next(error);
    }
});
exports.getItemsByUsername = getItemsByUsername;
const getItemById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const items = yield (0, models_1.findItemById)(id);
        res.status(200).json(items);
    }
    catch (error) {
        next(error);
    }
});
exports.getItemById = getItemById;
const getItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.query;
        if (typeof username !== "string") {
            throw new Error("Query param 'username' has to be of type string");
        }
        else {
            const items = yield (0, models_1.findItems)(username);
            res.status(200).json(items);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getItems = getItems;
const getAddresses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { matching_id } = req.params;
    try {
        const addresses = yield (0, models_1.findMatchedAddresses)(matching_id);
        res.status(200).json(addresses);
    }
    catch (error) {
        next(error);
    }
});
exports.getAddresses = getAddresses;
const getTrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.params.matching_id) {
            const { matching_id, username } = req.params;
            const availableTrades = yield (0, models_1.findAvailableTrades)(matching_id, username);
            res.status(200).json(availableTrades);
        }
        ;
    }
    catch (error) {
        next(error);
    }
    ;
});
exports.getTrades = getTrades;
const getMatches = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.user_id) {
        try {
            const { user_id } = req.params;
            const matches = yield (0, models_1.findMatches)(user_id);
            res.status(200).json(matches);
        }
        catch (error) {
            next(error);
        }
    }
    else {
        res.json([]);
    }
});
exports.getMatches = getMatches;
