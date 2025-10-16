const http = require("http");
const fs = require("fs");
const path = require("path");
const query = require("querystring");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");

// Server and MongoDB setup
const PORT = 8080;
const mongoUrl = "mongodb://localhost:27017/";
const dbName = "admin";          // your database
const adminCollection = "check"; // admin collection
const menuCollection = "menu";   // menu collection

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Create server
const server = http.createServer(async (req, res) => {

  // ======= GET REQUESTS =======
  if (req.method === "GET") {

    // Serve login page
    if (req.url === "/" || req.url === "/login.html") {
      fs.readFile(path.join(__dirname, "login.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve dashboard
    else if (req.url === "/dashboard.html") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);

        const items = await db.collection(menuCollection).find().toArray();
        await client.close();

        let html = fs.readFileSync(path.join(__dirname, "dashboard.html"), "utf8");

        const menuHTML = items.map(item => `
          <div class="menu-card">
            <img src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>Price: ₹${item.price}</p>
            <button class="delete-btn" onclick="window.location.href='/delete-menu/${item._id}'">Delete</button>
          </div>
        `).join("");

        html = html.replace('<!-- Menu items dynamically inserted here -->', menuHTML);
        html = html.replace('<!-- MESSAGE -->', ""); // empty message by default

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Server error loading dashboard");
      }
    }

    // Serve uploaded images
    else if (req.url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) return res.end("File not found");
        const ext = path.extname(filePath).slice(1);
        res.writeHead(200, { "Content-Type": "image/" + ext });
        res.end(data);
      });
    }

    // DELETE menu item
    else if (req.url.startsWith("/delete-menu/")) {
      const id = req.url.split("/delete-menu/")[1];
      const client = new MongoClient(mongoUrl);
      try {
        await client.connect();
        const db = client.db(dbName);

        const item = await db.collection(menuCollection).findOne({ _id: new ObjectId(id) });
        if (item && item.image) {
          const imagePath = path.join(__dirname, item.image);
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await db.collection(menuCollection).deleteOne({ _id: new ObjectId(id) });
        res.writeHead(302, { Location: "/dashboard.html" });
        res.end();
      } catch (err) {
        console.error("Delete error:", err.message);
        res.writeHead(500);
        res.end("Server error deleting menu item");
      } finally {
        await client.close();
      }
    }

    // 404 fallback
    else {
      res.writeHead(404);
      res.end("Not Found");
    }
  }

  // ======= POST REQUESTS =======
  else if (req.method === "POST") {

    // LOGIN
    if (req.url === "/login") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        const { userid, password } = query.parse(body);

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);

          const admin = await db.collection(adminCollection).findOne({ adminId: userid, password });

          if (admin) {
            res.writeHead(302, { Location: "/dashboard.html" });
            res.end();
          } else {
            let html = fs.readFileSync(path.join(__dirname, "login.html"), "utf8");
            html = html.replace("<!-- ERROR_MSG -->", "Invalid credentials! Check case");
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
          }
        } catch (err) {
          console.error(err);
          res.writeHead(500);
          res.end("Database error: " + err.message);
        } finally {
          await client.close();
        }
      });
    }

    // ADD MENU ITEM
    else if (req.url === "/add-menu") {
      upload.single("imageFile")(req, res, async (err) => {
        if (err) return res.end("Upload error: " + err.message);

        const { name, price } = req.body;
        const image = "/uploads/" + req.file.filename;

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);
          await db.collection(menuCollection).insertOne({ name, price, image });
          res.writeHead(302, { Location: "/dashboard.html" });
          res.end();
        } catch (err) {
          console.error("Database error:", err.message);
          res.writeHead(500);
          res.end("Database error: " + err.message);
        } finally {
          await client.close();
        }
      });
    }

    else {
      res.writeHead(404);
      res.end("Not Found");
    }
  }

  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
