import data from "../usertestdata.json";
import model from "./schemas/model";

export default async function seed() {
  try {
    await model.deleteMany();
    await model.insertMany(data);
  } catch (error) {
    console.log(error);
  }
}
