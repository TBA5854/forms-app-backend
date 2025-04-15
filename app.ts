import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/authRoute";
import formRouter from "./src/routes/formRoutes";
import { connectDB } from "./src/helpers/dbController";
import { authverify } from "./src/middleware/authMiddleware";
import { config } from "dotenv";
const app: Express = express();

config();
app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use(formRouter);
connectDB();

const port = 3000;

app.get("/", authverify, (_req: Request, res: Response) => {
  res.send("Hello World!");
});
app.listen(port, () => console.log(`Auth Server port ${port}!`));
