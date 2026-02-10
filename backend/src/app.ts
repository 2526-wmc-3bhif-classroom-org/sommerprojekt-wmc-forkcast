import express from "express";
import cors from "cors";
import router from "./routes/test";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});