const { MongoClient } = require("mongodb");
const url = "mongodb://localhost:27017/";
const dbName = "admin";
const collectionName = "check";

async function insertUser() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertOne({
      adminId: "admin",
      password: "password123"
    });

    console.log("User inserted:", result.insertedId);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

insertUser();
