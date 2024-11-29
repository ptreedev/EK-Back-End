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
exports.findUserByUsername = exports.findUserById = exports.selectUsers = void 0;
const model_1 = __importDefault(require("../schemas/model"));
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
