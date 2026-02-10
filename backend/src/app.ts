import express from "express";
import cors from "cors";
import {Unit} from "./db/unit";
import {userRouter} from "./routes/userRouter";

const PORT = 3000;
const app = express();

// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete();

app.use(cors());
app.use(express.json());

app.use("/api/accounts", userRouter)
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});