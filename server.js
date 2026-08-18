/* ============================================================
   NEXORA — BACKEND (Express + MongoDB)
   - Serves the static portfolio site
   - POST /api/leads  → saves visitor name + mobile to MongoDB
                       → sends an automatic WhatsApp message
                         (Cloud API) from your number to the visitor
   - GET  /api/leads  → last 50 leads (requires ?key=ADMIN_KEY if set)
   ============================================================ */

require("dotenv").config();
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_KEY = process.env.ADMIN_KEY || "";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let db = null;

async function connectDB() {
  if (!MONGODB_URI) {
    console.warn(
      "MONGODB_URI is empty in .env — leads will NOT be saved. " +
        "Add your MongoDB Atlas connection string to .env and restart."
    );
    return;
  }
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();
    db = client.db(process.env.DB_NAME || "nexora");
    console.log("Connected to MongoDB ✔");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.warn("Leads will not be saved until this is fixed.");
  }
}

const isValidMobile = (v) => /^[6-9]\d{9}$/.test(v);

function normalizeMobile(raw) {
  return String(raw || "")
    .replace(/\D/g, "")
    .replace(/^0/, "")
    .replace(/^91(?=[6-9]\d{9}$)/, "");
}

/* ---------- WhatsApp Cloud API: auto message from your number to the visitor ---------- */
async function sendWhatsAppMessage(mobile) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const template = process.env.WHATSAPP_TEMPLATE;
  if (!phoneId || !token || !template) {
    console.warn(
      "WhatsApp Cloud API not configured (WHATSAPP_PHONE_ID / WHATSAPP_TOKEN / WHATSAPP_TEMPLATE) — skipping auto message."
    );
    return false;
  }

  const url = "https://graph.facebook.com/v21.0/" + phoneId + "/messages";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "91" + mobile,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_LANG || "en" },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("WhatsApp send failed (" + res.status + "):", errText);
      return false;
    }
    console.log("WhatsApp auto message sent to +91" + mobile);
    return true;
  } catch (err) {
    console.error("WhatsApp send error:", err.message);
    return false;
  }
}

app.post("/api/leads", async (req, res) => {
  const name = String((req.body && req.body.name) || "").trim();
  const mobile = normalizeMobile(req.body && req.body.mobile);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!isValidMobile(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  const lead = {
    name,
    mobile,
    page: req.headers.referer ? new URL(req.headers.referer).pathname : "",
    createdAt: new Date(),
  };

  let saved = false;
  if (db) {
    try {
      await db.collection("leads").insertOne(lead);
      saved = true;
    } catch (err) {
      console.error("Failed to save lead:", err);
      return res.status(500).json({ error: "Save failed" });
    }
  }

  /* Auto-send the welcome WhatsApp message from your number to the visitor */
  const whatsapp = await sendWhatsAppMessage(mobile);

  return res.json({ ok: true, saved, whatsapp });
});

app.get("/api/leads", async (req, res) => {
  if (ADMIN_KEY && req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!db) return res.json({ leads: [] });
  try {
    const leads = await db
      .collection("leads")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return res.json({ leads });
  } catch (err) {
    console.error("Failed to read leads:", err);
    return res.status(500).json({ error: "Read failed" });
  }
});

app.listen(PORT, () => {
  console.log("NEXORA server running at http://localhost:" + PORT);
  connectDB();
});
