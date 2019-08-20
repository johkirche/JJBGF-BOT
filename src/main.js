import express from "express";
import { Bot } from "./bot";
require("dotenv").config();

// Constants
const PORT = 3000;

// App
const app = express();

app.use(express.static("public"));

app.use(Bot().webhookCallback(process.env.TELEGRAM_SECRET_PATH));

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
