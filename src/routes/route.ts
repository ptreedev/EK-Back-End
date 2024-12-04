import express, { Request, Response, NextFunction } from "express";
import model from "../schemas/model";
import mongoose from "mongoose";
import api from "../../api.json";
import { createMatchesSubDoc, deleteUser, getAddresses, getItemById, getItems, getItemsByUsername, getLikesById, getMatches, getTrades, getUserById, getUserByUsername, getUsers, patchItem, patchTrade, postNewItem, postNewUser, postNewUsers } from "../controllers/controllers"
const router = express.Router();

// GET API endpoints
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json(api);
});

// GET all users
router.get(
  "/users", getUsers
);

//GET by user by ID
router.get(
  "/users/:id", getUserById
);

//GET user by username
router.get(
  "/user/:username", getUserByUsername
);

//GET an array of users liked items 
router.get(
  "/likes/:user_id", getLikesById
);

//GET a users items 
router.get(
  "/:username/items", getItemsByUsername
);

//GET items by item_ID
router.get(
  "/items/:id", getItemById
);

//GET all items not owned by logged in user
router.get(
  "/items", getItems
);

// GET addresses of users upon successful match
router.get(
  "/tradesuccess/:matching_id/", getAddresses
);

//GET available trades for a user
router.get(
  "/trades/:matching_id/:username", getTrades
);

//GET an array of user matches
router.get(
  "/matches/:user_id", getMatches
);

// POST new users
router.post(
  "/manyusers", postNewUsers
);
// POST a new user
router.post("/new-user", postNewUser
);

//POST add a new item 
router.post(
  "/items/:username", postNewItem
);

//checks whether a match has occured and if true, creates a match subdocument
router.post(
  "/matchcheck", createMatchesSubDoc
);

//PATCH set a trade accept boolean in a users matches subdocument
router.patch(
  "/settrade", patchTrade
);

//PATCH user items by adding a like
router.patch(
  "/items/:id", patchItem
);


//DELETE user by ID
router.delete(
  "/delete/:id", deleteUser

);


export default router;
