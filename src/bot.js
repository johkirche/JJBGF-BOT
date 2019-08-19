require("dotenv").config();
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Extra = require("telegraf/extra");

const { Prisma } = require("prisma-binding");
const prisma = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: "https://api.jjbg-kitawo.de",
  secret: process.env.PRISMA_SECRET
});

export const Telegram = () => {
  console.log("online");
  const bot = new Telegraf(process.env.TELEGRAM_SECRET);
  bot.telegram.setWebhook(process.env.TELEGRAM_WEBHOOK);
  bot.use(session({ ttl: 10 }));
  console.log("secret", process.env.TELEGRAM_WEBHOOK);

  const replyRoomChoose = ctx =>
    ctx.reply(
      "Welcher Standort?",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          m.callbackButton("FS", "room::fs"),
          m.callbackButton("SMH", "room::smh")
        ])
      )
    );

  bot.on("message", ctx => {
    ctx.reply("HELLOO");
  });

  bot.hears("hallo", ctx => {
    ctx.reply("hi");
    console.log(ctx.from);
  });
  bot.hears("🔍", ctx => ctx.reply("Suche"));
  bot.hears("jjbgf", ctx =>
    ctx.reply("Johannische Jugend bedeutet glückliche Freizeit")
  );

  bot.command("room", ctx => {
    if (
      ctx.from.username === "mahnouel" ||
      ctx.from.username === "MrMaeffy" ||
      ctx.from.username === "BettyNo" ||
      ctx.from.username === "JohannesFr" ||
      ctx.from.username === "Elias3" ||
      ctx.from.username === "T_auriel" ||
      ctx.from.username === "Derfedder" ||
      ctx.from.username === "SophieNadine" ||
      ctx.from.username === "ClaerchenSoSa"
    ) {
      return replyRoomChoose(ctx);
    } else {
      ctx.reply("Diese Funktion ist nur für eingetragene Jugendleiter! 🤗");
    }
  });

  const makeOpenClosed = ctx => {
    ctx.editMessageText(
      "Offen oder Geschlossen?",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          m.callbackButton("Offen", "room::open"),
          m.callbackButton("Geschlossen", "room::close")
        ])
      )
    );
  };

  bot.action("room::fs", async ctx => {
    ctx.session.room = "fs";
    ctx.session.room_name = "Friedensstadt";
    ctx.session.room_id = "cjky2mqob00080765ysg38gq9";
    makeOpenClosed(ctx);
  });

  bot.action("room::smh", async ctx => {
    ctx.session.room = "smh";
    ctx.session.room_name = "St. Michaels Heim";
    ctx.session.room_id = "cjky2sgv2000h0765njxdgzgl";
    makeOpenClosed(ctx);
  });

  bot.action("room::open", async ctx => {
    if (!ctx.session.room) return replyRoomChoose(ctx);
    ctx.editMessageText(ctx.session.room_name + " ist nun geöffnet");
    prisma.mutation.updateRoom(
      { where: { id: ctx.session.room_id }, data: { open: true } },
      "{ id }"
    );
  });

  bot.action("room::close", async ctx => {
    if (!ctx.session.room) return replyRoomChoose(ctx);
    ctx.editMessageText(ctx.session.room_name + " ist nun geschlossen!");
    prisma.mutation.updateRoom(
      { where: { id: ctx.session.room_id }, data: { open: false } },
      "{ id }"
    );
  });

  return bot;
};
