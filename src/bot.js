require("dotenv").config();
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Extra = require("telegraf/extra");
const Telegram = require("telegraf/telegram");

const { Prisma } = require("prisma-binding");
const prisma = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: process.env.PRISMA_HOST,
  secret: process.env.PRISMA_SECRET
});

export const Bot = () => {
  console.log("online");
  const telegram = new Telegram(process.env.TELEGRAM_SECRET);
  const telegraf = new Telegraf(process.env.TELEGRAM_SECRET);

  const isAdmin = id => {
    return prisma.exists.User({
      id,
      OR: [{ status: "creator" }, { status: "administrator" }]
    });
  };

  const sync = ctx => {
    telegram.getChatAdministrators(process.env.CHAT_ID).then(userList => {
      userList.forEach(userData => {
        const first_name = userData.user.first_name || "";
        const last_name = userData.user.last_name || "";
        const username = userData.user.username || "";
        const id = userData.user.id;
        const status = userData.status;
        prisma.mutation.upsertUser({
          where: { id },
          create: { first_name, last_name, username, id, status },
          update: { first_name, last_name, username, status }
        });

        ctx.reply("✅ " + first_name + " " + username);
      });
      ctx.reply("🏁 Fertig");
    });
  };

  telegram.setWebhook(process.env.TELEGRAM_WEBHOOK);

  telegraf.use(session({ ttl: 10 }));

  telegraf.command("amiadmin", async ctx => {
    const status = await isAdmin(ctx.from.id);
    ctx.reply("admin: " + status);
  });

  telegraf.command("reload", ctx => {
    const admin = await isAdmin(ctx.from.id);
    if (!admin) {
      ctx.reply("Diese Funktion ist nur für eingetragene Jugendleiter! 🤗");
      return;
    }

    sync(ctx);
  });

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
  telegraf.command("room", async ctx => {
    const admin = await isAdmin(ctx.from.id);
    if (!admin) {
      ctx.reply("Diese Funktion ist nur für eingetragene Jugendleiter! 🤗");
      return;
    }

    return replyRoomChoose(ctx);
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

  telegraf.action("room::fs", async ctx => {
    ctx.session.room = "fs";
    ctx.session.room_name = "Friedensstadt";
    ctx.session.room_id = "cjz59vg7l001008241wmo5bba";
    makeOpenClosed(ctx);
  });

  telegraf.action("room::smh", async ctx => {
    ctx.session.room = "smh";
    ctx.session.room_name = "St. Michaels Heim";
    ctx.session.room_id = "cjzfmmb9c000m0738j2ams68z";
    makeOpenClosed(ctx);
  });

  telegraf.action("room::open", async ctx => {
    if (!ctx.session.room) return replyRoomChoose(ctx);
    ctx.editMessageText(ctx.session.room_name + " ist nun geöffnet");
    prisma.mutation.updateRoom(
      { where: { id: ctx.session.room_id }, data: { open: true } },
      "{ id }"
    );
  });

  telegraf.action("room::close", async ctx => {
    if (!ctx.session.room) return replyRoomChoose(ctx);
    ctx.editMessageText(ctx.session.room_name + " ist nun geschlossen!");
    prisma.mutation.updateRoom(
      { where: { id: ctx.session.room_id }, data: { open: false } },
      "{ id }"
    );
  });

  return telegraf;
};
