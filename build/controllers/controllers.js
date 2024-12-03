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
exports.getItemById = exports.getItemsByUsername = exports.getLikesById = exports.getUserByUsername = exports.getUserById = exports.getUsers = void 0;
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
