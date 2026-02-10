import express from "express";
import cors from "cors";
import router from "./routes/test";
import {Unit} from "./db/unit";

const PORT = 3000;
const app = express();

// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete(true);

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});