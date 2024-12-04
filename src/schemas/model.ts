import mongoose from "mongoose";
export interface Item {
  item_name: string,
  description: string,
  img_string: string,
  likes: string[],
}
const itemSchema = new mongoose.Schema<Item>({
  item_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img_string: {
    type: String,
    required: true,
  },
  likes: {
    type: [],
  },
});
interface Matches {
  match_item_name: string,
  match_user_name: string,
  match_img_string: string,
  match_user_id: string,
  match_item_id: string,
  settrade?: boolean,
  matching_id: string
}
const matchSchema = new mongoose.Schema({
  match_item_name: {
    type: String,
    required: true,
  },
  match_user_name: {
    type: String,
    required: true,
  },
  match_img_string: {
    type: String,
    required: true,
  },
  match_user_id: {
    type: String,
    required: true,
  },
  match_item_id: {
    type: String,
    required: true,
  },
  settrade: {
    type: Boolean,
  },
  matching_id: {
    type: String,
    required: true,
  },
});
interface Address {
  street: string,
  city: string,
  post_code: string
}
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  post_code: {
    type: String,
    required: true,
  },
});
export interface IUser {
  name: string,
  username: string,
  items: Item,
  address: Address,
  matches?: Matches
}
const userSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  items: [itemSchema],
  address: [addressSchema],
  matches: {
    required: true,
    type: [matchSchema],
  },
});

export default mongoose.model(`Data`, userSchema);
