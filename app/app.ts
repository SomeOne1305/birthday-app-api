import { join } from "node:path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jsend from "jsend";

import errorHandler from "../middlewares/error-handler";
import authRoutes from "./routes/auth/auth.route";
import birthdayRoutes from "./routes/birthday/birthday.route";
// Routes
import todoRoutes from "./routes/todo/todo";
import userRoutes from "./routes/user/user.route";

import { setupSwagger } from "./swagger";
import { home } from "./home-response";
export const app = express();

// middleware routes
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  app.use(helmet());
}
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(jsend.middleware); // more detail on https://github.com/omniti-labs/jsend
app.use(errorHandler);
const options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html"],
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders(res: express.Response) {
    res.set("x-static-timestamp", Date.now().toString());
  },
};

app.use("/static", express.static(join(__dirname, "../public"), options));

// Swagger setup
setupSwagger(app);

app.get("/", home);

app.get("/api", (_req, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ name: "Hello world" });
});

// Routes
app.use("/api/todo", todoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/birthday", birthdayRoutes);
