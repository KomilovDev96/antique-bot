const { Scenes, Markup } = require("telegraf");
const sendForApprovalAction = require("../actions/sendForApproval.action");

const sellScene = new Scenes.BaseScene("sell-scene");

// Start scene
sellScene.enter((ctx) => {
    ctx.scene.state = {
        photos: [],
        step: null
    };

    ctx.reply(
        "📸 1–5 ta rasm yuboring (bitta-bitta). Tugatgach — “✅ Tayyor”."
    );
});

// Photo handler
sellScene.on("photo", async (ctx) => {
    if (ctx.scene.state.photos.length >= 5) {
        await ctx.reply("⚠️ 5 tadan ko‘p rasm qabul qilinmaydi. “Tayyor” tugmasini bosing.");
        return;
    }

    const fileId = ctx.message.photo.at(-1).file_id;
    ctx.scene.state.photos.push(fileId);

    const count = ctx.scene.state.photos.length;
    await ctx.reply(`📸 Rasm qabul qilindi (${count}/5)`);

    if (count === 1 || count >= 5) {
        await ctx.reply(
            "Barcha rasmlar yuklangan bo‘lsa — “✅ Tayyor” ni bosing.",
            Markup.keyboard([["✅ Tayyor"]]).resize()
        );
    }
});

// Contact sharing handler
sellScene.on("contact", async (ctx) => {
    if (ctx.scene.state.step !== "contact") return;
    const number = ctx.message.contact?.phone_number;
    if (!number) return;
    ctx.scene.state.contact = number;
    ctx.scene.state.step = "description";
    await ctx.reply("🧾 Qo‘shimcha ma’lumot:", Markup.removeKeyboard());
});

// "Tayyor"
sellScene.hears("✅ Tayyor", async (ctx) => {
    if (ctx.scene.state.photos.length === 0) {
        return ctx.reply("Avval kamida 1 ta rasm yuboring!");
    }

    ctx.scene.state.step = "title";

    return ctx.reply(
        "🏺 Nomi nima?",
        Markup.removeKeyboard()
    );
});

// Text steps
sellScene.on("text", async (ctx) => {
    const step = ctx.scene.state.step;
    const text = ctx.message.text;

    if (!step || step === "photos") {
        try { await ctx.deleteMessage(); } catch {}
        await ctx.reply("📸 Avval 1–5 ta rasm yuboring. Keyin davom etamiz.");
        return;
    }

    switch (step) {
        case "title":
            if (!text?.trim()) {
                return ctx.reply("⚠️ Nomi bo‘sh bo‘lmasligi kerak. Qayta kiriting (maks. 30 belgi).");
            }
            if (text.trim().length > 30) {
                return ctx.reply("⚠️ Nomi 30 belgidan oshmasin. Qayta kiriting.");
            }
            ctx.scene.state.title = text.trim();
            ctx.scene.state.step = "condition";
            return ctx.reply("📋 Holatini yozing:");

        case "condition":
            ctx.scene.state.condition = text;
            ctx.scene.state.step = "currency";
            return ctx.reply(
                "💰 Narx valyutasini tanlang:",
                Markup.keyboard([["So'm", "$"]]).resize()
            );

        case "currency":
            if (text !== "So'm" && text !== "$") {
                return ctx.reply("⚠️ Valyutani tanlang: So'm yoki $", Markup.keyboard([["So'm", "$"]]).resize());
            }
            ctx.scene.state.currency = text === "$" ? "usd" : "uzs";
            ctx.scene.state.step = "price";
            return ctx.reply("💰 Narxni kiriting (faqat raqamlar):", Markup.removeKeyboard());

        case "price":
            if (!/^[0-9\s]+$/.test(text || "")) {
                return ctx.reply("⚠️ Narx faqat raqamlardan iborat bo‘lsin. Qayta kiriting.");
            }
            const digitsOnly = (text || "").replace(/\s+/g, "");
            if (digitsOnly.length > 12) {
                return ctx.reply("⚠️ Narx juda katta ko‘rsatildi (12 tadan ortiq raqam). Qayta kiriting.");
            }
            const currencyLabel = ctx.scene.state.currency === "usd" ? "$" : "so'm";
            ctx.scene.state.price = `${text.trim()} ${currencyLabel}`;
            ctx.scene.state.step = "city";
            return ctx.reply("🏙️ Qaysi shaharda?");

        case "city":
            ctx.scene.state.city = text;
            ctx.scene.state.step = "contact";
            return ctx.reply(
                "☎️ Aloqa raqami kiriting yoki tugma orqali ulashing:\nMisol: +998 90 123 45 67",
                Markup.keyboard([[Markup.button.contactRequest("📱 Kontaktni ulashish")]]).resize()
            );

        case "contact":
            if (!/^\+?[\d][\d\s\-()]{6,19}$/.test(text || "")) {
                return ctx.reply("⚠️ Telefon raqamini to‘g‘ri kiriting. Misol: +998 90 123 45 67");
            }
            ctx.scene.state.contact = text.trim();
            ctx.scene.state.step = "description";
            return ctx.reply("🧾 Qo‘shimcha ma’lumot:");

        case "description":
            ctx.scene.state.description = text;
            ctx.scene.state.step = "confirm";

            const preview = `
🏺 ${ctx.scene.state.title}
📋 Holat: ${ctx.scene.state.condition}
💰 Narx: ${ctx.scene.state.price}
🏙️ Shahar: ${ctx.scene.state.city}

☎️ Kontakt: ${ctx.scene.state.contact}
🧾 Ma’lumot: ${ctx.scene.state.description}
            `;

            return ctx.reply(
                preview,
                Markup.inlineKeyboard([
                    [Markup.button.callback("✅ Tasdiqlash", "confirm_sell_post")],
                    [Markup.button.callback("❌ Bekor qilish", "cancel_sell_post")]
                ])
            );
    }
});

// Cancel
sellScene.action("cancel_sell_post", async (ctx) => {
    await ctx.editMessageText("❌ E'lon bekor qilindi.");
    return ctx.scene.leave();
});

// Confirm
sellScene.action("confirm_sell_post", async (ctx) => {
    const data = { ...ctx.scene.state };

    await ctx.editMessageText("🕓 E’lon yuborilmoqda...");
    await ctx.scene.leave();

    // Mazkur sesiyani post ma'lumotlari bilan to'ldiramiz va darhol yuboramiz
    ctx.session.post = { ...data, type: "sell", photos: data.photos };
    await sendForApprovalAction(ctx);
    await ctx.reply("✅ E’lon qabul qilindi, admin tasdiqlashini kuting.");
});

module.exports = sellScene;
