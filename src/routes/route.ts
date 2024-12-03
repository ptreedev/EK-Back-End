import express, { Request, Response, NextFunction } from "express";
import model from "../schemas/model";
import mongoose from "mongoose";
import api from "../../api.json";
import { getAddresses, getItemById, getItems, getItemsByUsername, getLikesById, getMatches, getTrades, getUserById, getUserByUsername, getUsers, postNewUsers } from "../controllers/controllers"
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
router.post("/new-user", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = new model({
      name: req.body.name,
      username: req.body.username,
      items: req.body.items,
      address: req.body.address,
      matches: req.body.matches,
    });
    const newUser = await data.save();
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

//POST add a new item 
router.post(
  "/items/:username",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = req.params.username;
      const newItem = {
        item_name: req.body.item_name,
        description: req.body.description,
        img_string: req.body.img_string,
        likes: [],
      };
      if (newItem.item_name === undefined || newItem.description === undefined || newItem.img_string === undefined) {
        const e = new Error("Validation Failed");
        e.name = "ValidationError";
        throw e;
      };
      const options = { new: true };
      const data = await model.findOneAndUpdate(
        { username: username },
        { $addToSet: { items: newItem } },
        options);
      if (data === null) {
        const e = new Error("Username not found");
        e.name = "SyntaxError";
        throw e;
      } else res.status(201).json(data);
    } catch (error) {
      next(error)
    }
  }
);

//PATCH set a trade accept boolean in a users matches subdocument
router.patch(
  "/settrade",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req.body.match_id === undefined || null) || (typeof req.body.bool !== "boolean")) {
        res.status(422).send({ message: "Invalid request, check submitted fields" })
      }
      const match_id = new mongoose.Types.ObjectId(`${req.body.match_id}`);
      const val: boolean = req.body.bool;
      const options = { new: true };
      const changeBool = await model.findOneAndUpdate(
        { "matches._id": match_id },
        { $set: { "matches.$.settrade": val } },
        options
      );
      if (changeBool === null) {
        const e = new Error();
        e.name = "ValidationError";
        throw e;
      }
      res.status(200).json(changeBool);
    } catch (error) {
      next(error);
    }
  }
);

//PATCH user items by adding a like
router.patch(
  "/items/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);

      const updatedData = req.body;
      const data = mongoose.Types.ObjectId.createFromHexString(updatedData.likes);
      const options = { new: true };

      const result = await model.findOneAndUpdate(
        { "items._id": id },
        { $addToSet: { "items.$.likes": data } },
        options
      );

      res.status(200).send(result);
    } catch (error) {
      if ((error as Error).message === "hex string must be 24 characters") {
        res.status(422).json({ message: "Invalid request" })
      } else res.status(400).json({ message: (error as Error).message });
    }
  }
);

//DELETE user by ID
router.delete(
  "/delete/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const data = await model.findByIdAndDelete(id);
      if (data) {
        res.send(`Document with ${data.name} has been deleted.`);
      } else {
        res.status(404).json({ message: "Document not found." });
      }
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
);

//checks whether a match has occured and if true, creates a match subdocument
router.post(
  "/matchcheck",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user_id = new mongoose.Types.ObjectId(`${req.body.user_id}`);
      const item_id = new mongoose.Types.ObjectId(`${req.body.item_id}`);
      const getTheirId = await model.findOne(
        { "items._id": item_id },
        { _id: 1, username: 1 }
      );
      const getTheirItem = await model.aggregate([
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
        { $match: { _id: item_id } },
      ]);
      const their_id = getTheirId!._id!.toString();
      const currentMilliseconds = new Date().getTime();
      const theirObj = {
        match_user_id: their_id,
        match_user_name: getTheirId?.username,
        match_item_name: getTheirItem[0].item_name,
        match_img_string: getTheirItem[0].img_string,
        match_item_id: item_id,
        matching_id: currentMilliseconds,
      };

      const user_match_check = await model.findOne({
        $and: [{ _id: user_id }, { "items.likes": their_id }],
      });
      const options = { new: true, upsert: true };
      const their_id_check = await model.findOne({
        "matches.match_item_id": item_id,
      });
      if (user_match_check !== null && their_id_check === null) {
        const updateMatches = await model.findOneAndUpdate(
          { _id: user_id },
          { $addToSet: { matches: theirObj } },
          options
        );
        const userItem = user_match_check.items.map((item) => {
          if (item.likes.includes(their_id)) {
            return item;
          }
        });
        const userItemId = userItem[0]?._id?.toString();
        const ourObj = {
          match_user_id: user_id,
          match_user_name: user_match_check.username,
          match_item_name: userItem[0]?.item_name,
          match_img_string: userItem[0]?.img_string,
          match_item_id: userItemId,
          matching_id: currentMilliseconds,
        };
        const updateTheirMatches = await model.findOneAndUpdate(
          { _id: their_id },
          { $addToSet: { matches: ourObj } },
          options
        );
        res.status(201).send([updateMatches, updateTheirMatches]);
      } else {
        res.status(304).send({ msg: "not modified" });
      }
    } catch (error) {
      if ((error as Error).name === "BSONError") {
        res.status(422).send({ message: "Invalid request" })
      }
      next(error);
    }
  }
);

export default router;
