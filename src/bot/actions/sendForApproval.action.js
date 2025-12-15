const Post = require("../../models/Post");
const { BOT_TOKEN } = require("../../config/env");
const { downloadImageBuffer } = require("../utils");

const generateCode = () => Math.floor(10000 + Math.random() * 90000).toString();

const formatPrice = (raw) => {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return raw || "";
  const currency = (raw || "").replace(/[0-9\s]/g, "").trim();
  const formattedDigits = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return currency ? `${formattedDigits} ${currency}` : formattedDigits;
};

const validatePost = (post) => {
  const errors = [];

  // Title: required, max 30 chars
  if (!post.title || !post.title.trim()) {
    errors.push("Sarlavha majburiy.");
  } else if (post.title.trim().length > 30) {
    errors.push("Sarlavha 30 ta belgidan oshmasin.");
  }

  // Price: digits with optional currency
  const priceRaw = post.price || "";
  const priceDigits = priceRaw.replace(/[^0-9]/g, "");
  if (!priceDigits) {
    errors.push("Narx faqat raqamlardan iborat bo‘lsin.");
  } else if (priceDigits.length > 12) {
    errors.push("Narx juda katta ko‘rsatildi (12 tadan ortiq raqam).");
  }

  // Contact: phone-like format
  if (!post.contact || !/^[\d+\-\s()]{7,20}$/.test(post.contact)) {
    errors.push("Telefon raqamni to‘g‘ri kiriting (faqat raqamlar, +, -, (), bo‘shliq).");
  }

  return errors;
};

module.exports = async (ctx) => {
  const sessionPost = ctx.session.post || ctx.session.sellPost;

  if (!sessionPost) {
    await ctx.answerCbQuery?.("Ma'lumot topilmadi, qayta urinib ko'ring.");
    return;
  }

  // Normalize photos to file_path
  const normalizedPhotos = [];
  for (const p of sessionPost.photos || []) {
    if (!p) continue;
    if (p.includes("/")) {
      normalizedPhotos.push(p);
    } else {
      const file = await ctx.telegram.getFile(p);
      if (file?.file_path) normalizedPhotos.push(file.file_path);
    }
  }

  const postData = {
    type: sessionPost.type || "sell",
    photos: normalizedPhotos,
    title: sessionPost.title,
    condition: sessionPost.condition,
    price: sessionPost.price,
    city: sessionPost.city,
    contact: sessionPost.contact,
    description: sessionPost.description,
    userId: ctx.from.id,
    username: ctx.from.username || null,
    status: "pending",
    uniqueCode: generateCode(),
  };

  try {
    const validationErrors = validatePost(postData);
    if (validationErrors.length) {
      await ctx.answerCbQuery?.("Xatolik");
      await ctx.reply(validationErrors.join("\n"));
      return;
    }

    postData.price = formatPrice(postData.price);

    await Post.create(postData);

    if (!postData.photos.length) {
      await ctx.answerCbQuery?.("Rasm topilmadi, qayta yuboring.");
      return;
    }

    // No extra user messages; just close callback
    await ctx.answerCbQuery("Qabul qilindi, admin ko'rib chiqadi.");
    ctx.session = {};
  } catch (err) {
    console.error("send_for_approval action error:", err);
    await ctx.reply("❌ Xatolik: e’lonni yuborib bo‘lmadi.");
  }
};
