const { MongoClient } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(process.env.DB_NAME || "nexora");
  return cachedDb;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rawName = String((req.body && req.body.name) || "").trim();
  const rawMobile = String((req.body && req.body.mobile) || "")
    .replace(/\D/g, "")
    .replace(/^0/, "")
    .replace(/^91(?=[6-9]\d{9}$)/, "");

  if (!rawName || rawName.length < 2) return res.status(400).json({ error: "Name required" });
  if (!/^[6-9]\d{9}$/.test(rawMobile)) return res.status(400).json({ error: "Invalid mobile" });

  try {
    const db = await connectDB();
    await db.collection("leads").insertOne({
      name: rawName,
      mobile: rawMobile,
      createdAt: new Date(),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("MongoDB error:", err);
    return res.status(500).json({ error: "Save failed" });
  }
};
