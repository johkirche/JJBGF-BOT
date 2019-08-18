import express from "express";
import { Telegram } from "./bot";

// Constants
const PORT = 3000;

// App
const app = express();

app.use(express.static("public"));

app.use(Telegram().webhookCallback("/"));

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
