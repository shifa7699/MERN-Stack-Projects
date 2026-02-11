const { MongoClient } = require("mongodb");

const mongoUrl = "mongodb://localhost:27017/";
const dbName = "admin";

async function insertStaff() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.collection("staff").insertOne({
      staffId: "staff",
      password: "password123"
    });
    console.log("Staff credentials inserted successfully");
  } catch (err) {
    console.error("Error inserting staff:", err);
  } finally {
    await client.close();
  }
}

insertStaff();
