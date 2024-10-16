"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.database = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const route_1 = __importDefault(require("./routes/route"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
const mongoString = process.env.DATABASE_URL;
mongoose_1.default.connect(mongoString);
const database = mongoose_1.default.connection;
exports.database = database;
database.on("error", (error) => {
    console.log(error);
});
database.once("connected", () => {
    console.log("Database Connected");
});
app.use(express_1.default.json());
app.use(`/api`, route_1.default);
app.all("*", (req, res) => {
    res.status(404).send({ msg: "URL not found" });
});
app.use((error, req, res, next) => {
    if (error.name === "BSONError") {
        res.status(400).json({ message: "Not a valid ID" });
    }
    else {
        next(error);
    }
});
app.use((error, req, res, next) => {
    if (error.name === "SyntaxError") {
        console.log(error);
        res.status(400).json({ message: "Please Enter the Data Correctly" });
    }
    else {
        next(error);
    }
});
app.use((error, req, res, next) => {
    if (error.name === "ValidationError") {
        res.status(400).json({ message: "Missing Required Fields" });
    }
    else {
        next(error);
    }
});
app.use((error, req, res, next) => {
    if (error.message === "invalid username") {
        res.status(400).json({ message: error.message });
    }
    else {
        next(error);
    }
});
app.use((error, req, res, next) => {
    if (error.message ===
        "Cannot read properties of undefined (reading 'settrade')" ||
        error.message === "Cannot read properties of undefined (reading 'items')") {
        res.status(404).json({ message: "Cannot Find Matching ID" });
    }
    else {
        next(error);
    }
});
app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
});
const server = app.listen(3000, () => {
    console.log(`server started app on 3000`);
});
exports.server = server;
