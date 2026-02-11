const { MongoClient } = require("mongodb");

const mongoUrl = "mongodb://localhost:27017/";
const dbName = "admin";

async function checkData() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);

    const admin = await db.collection("check").findOne({ adminId: "admin" });
    console.log("Admin in check collection:", admin);

    const staff = await db.collection("staff").findOne({ staffId: "staff" });
    console.log("Staff in staff collection:", staff);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

checkData();
