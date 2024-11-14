import express, { Request, Response, NextFunction } from "express";
import model from "../models/model";
import mongoose, { Schema } from "mongoose";
import api from "../../api.json";
const router = express.Router();

// GET API endpoints

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json(api);
});

// GET all users

router.get(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await model.find();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);
// POST new users
router.post(
  "/manyusers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insert = await model.insertMany(req.body);
      res.status(201).json(insert);
    } catch (error) {
      next(error);
    }
  }
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

//GET by user by ID
router.get(
  "/users/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = new mongoose.Types.ObjectId(`${req.params.id}`);
      const data = await model.findById(id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);
//GET user by username
router.get(
  "/user/:username",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await model
        .findOne({ username: req.params.username })
        .then((data) => {
          if (data === null) {
            return Promise.reject({ status: 400, message: "invalid username" });
          }
          res.status(200).json(data);
        });
    } catch (error) {
      next(error);
    }
  }
);
//GET an array of users liked items 
router.get(
  "/likes/:user_id",
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.user_id;
    try {
      const data = await model.find(
        { "items.likes": id },
        { items: 1, _id: 0 }
      );
      const filt = data[0].items.filter((item) => {
        if (item.likes.includes(id)) {
          return item;
        }
      });
      res.status(200).json(filt);
    } catch (error) {
      next(error);
    }
  }
);
//GET a users items 
router.get(
  "/:username/items",
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    try {
      const data = await model.findOne(
        { username: username },
        { items: 1, _id: 0 }
      );
      res.status(200).json(data!.items);
    } catch (error) {
      next(error);
    }
  }
);
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

//GET items by item_ID
router.get(
  "/items/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const data = await model
        .aggregate([
          { $unwind: "$items" },
          { $replaceRoot: { newRoot: "$items" } },
          { $match: { _id: id } },
        ])
        .then((data) => {
          res.json(data[0]);
        });
    } catch (error) {
      next(error);
    }
  }
);
//GET all items
router.get(
  "/items",
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username;
    try {
      const data = await model.aggregate([
        { $match: { username: { $ne: username } } },
        { $unwind: "$items" },
        { $replaceRoot: { newRoot: "$items" } },
      ]);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
);
// GET addresses of users upon successful match
router.get(
  "/tradesuccess/:matching_id/",
  async (req: Request, res: Response, next: NextFunction) => {
    const matching_id = req.params.matching_id;
    try {
      const getMatches = await model.aggregate([
        { $unwind: "$matches" },
        { $replaceRoot: { newRoot: "$matches" } },
        { $match: { matching_id: matching_id } },
      ]);

      const firstMatch = getMatches[0];
      const secondMatch = getMatches[1];

      if (firstMatch.settrade && secondMatch.settrade) {
        const id_one = new mongoose.Types.ObjectId(getMatches[0].match_user_id);
        const id_two = new mongoose.Types.ObjectId(getMatches[1].match_user_id);
        const getAddress_one = await model.findOne(
          { _id: id_one },
          { address: 1, username: 1 }
        );
        const getAddress_two = await model.findOne(
          { _id: id_two },
          { address: 1, username: 1 }
        );
        res.status(200).json([getAddress_one, getAddress_two]);
      }
    } catch (error) {
      next(error);
    }
  }
);

//PATCH set a trade accept boolean in each of the users matches
router.patch(
  "/settrade",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const match_id = new mongoose.Types.ObjectId(`${req.body.match_id}`);
      const val: boolean = req.body.bool;
      const options = { new: true };
      const changeBool = await model.findOneAndUpdate(
        { "matches._id": match_id },
        { $set: { "matches.$.settrade": val } },
        options
      );
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
      console.log((error as Error).message)
      if((error as Error).message === "hex string must be 24 characters"){
        res.status(422).json({message: "Invalid request"})
      } else res.status(400).json({ message: (error as Error).message });
    }
  }
);
//GET available trades
router.get(
  "/trades/:matching_id/:username",

  async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.matching_id) {
      const matching_id: string = req.params.matching_id;
      const username: string = req.params.username;
      const getMatches = await model.aggregate([
        { $unwind: "$matches" },
        { $replaceRoot: { newRoot: "$matches" } },
        { $match: { matching_id: matching_id } },
      ]);

      if (getMatches) {
        if (getMatches[0].match_user_name === username) {
          const list = [getMatches[1], getMatches[0]];
          res.status(200).json(list);
        } else {
          res.status(200).json(getMatches);
        }
      }
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
//gets an array of user matches
router.get(
  "/matches/:user_id",
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.user_id) {
      try {
        const id = new mongoose.Types.ObjectId(`${req.params.user_id}`);
        const data = await model.find({ _id: id }, { matches: 1 });
        res.json(data[0].matches);
      } catch (error) {
        next(error);
      }
    } else {
      res.json([]);
    }
  }
);
//checks whether a match has occured
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
      next(error);
    }
  }
);

export default router;
