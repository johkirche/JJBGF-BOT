import express from "express";
import { Telegram } from "./bot";
require("dotenv").config();

// Constants
const PORT = 3000;

// App
const app = express();

app.use(express.static("public"));

console.log("secret", process.env.TELEGRAM_WEBHOOK);
console.log("secret", process.env.TELEGRAM_SECRET_PATH);

app.use(Telegram().webhookCallback(process.env.TELEGRAM_SECRET_PATH));

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
