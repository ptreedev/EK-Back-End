import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import "dotenv/config";
import routes from "./routes/route";
import cors from "cors";

const app = express();
app.use(cors());

const mongoString: string = process.env.DATABASE_URL!;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(express.json());

app.use(`/api`, routes);

app.all("*", (req: Request, res: Response) => {
  res.status(404).send({ message: "URL not found" });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if(error.message === "Username not found"){
    res.status(404).send(error.message)
  } else next(error)
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.name === "BSONError" || error.name === "CastError") {
    res.status(400).json({ message: "Not a valid ID" });
  } else next(error);
  
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.name === "SyntaxError") {
    res.status(400).json({ message: "Please Enter the Data Correctly" });
  } else next(error);
});
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.name === "ValidationError" ) {
    res.status(422).json({message: "Invalid request, check submitted fields"});
  } else next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.message === "invalid username") {
    res.status(400).json({ message: error.message });
  } else next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (
    error.message.includes("Cannot read properties of undefined")
  ) {
    res.status(404).json({ message: "Cannot Find Matching ID" });
  } else next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: (error as Error).message });
});

const server = app.listen(3000, () => {
  console.log(`server started app on 3000`);
});

export { app, database, server };
