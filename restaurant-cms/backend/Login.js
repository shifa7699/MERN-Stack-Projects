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
const reservationCollection = "reservations"; // reservations collection

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Create server
const server = http.createServer(async (req, res) => {

  // ======= OPTIONS REQUESTS (for CORS preflight) =======
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

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

    // Serve admin login page
    else if (req.url === "/admin-login.html") {
      fs.readFile(path.join(__dirname, "admin-login.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve staff login page
    else if (req.url === "/staff-login.html") {
      fs.readFile(path.join(__dirname, "staff-login.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve dashboard
    else if (req.url === "/dashboard.html") {
      let html = fs.readFileSync(path.join(__dirname, "admin-dashboard.html"), "utf8");
      let menuHTML = '<p>Loading menu items...</p>';

      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);

        const items = await db.collection(menuCollection).find().toArray();
        await client.close();

        menuHTML = items.length === 0 ? '<p>No menu items found. Add some items using the form above.</p>' : items.map(item => `
          <div class="menu-card">
            <img src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>Price: ₹${item.price}</p>
            <div class="category">${item.category === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</div>
            <div class="buttons">
              <button class="update-btn" onclick="updateItem('${item._id}', '${item.name}', '${item.price}', '${item.category}')">Update</button>
              <button class="delete-btn" onclick="window.location.href='/delete-menu/${item._id}'">Delete</button>
            </div>
          </div>
        `).join("");
      } catch (err) {
        console.error(err);
        menuHTML = '<p>Unable to load menu items. Please check database connection.</p>';
      }

      html = html.replace('<!-- Menu items dynamically inserted here -->', menuHTML);
      html = html.replace('<!-- MESSAGE -->', ""); // empty message by default

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
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

    // API endpoint to get menu items as JSON
    else if (req.url === "/api/menu") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const items = await db.collection(menuCollection).find().toArray();
        await client.close();

        // Add CORS headers for frontend access
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end(JSON.stringify(items));
      } catch (err) {
        console.error(err);
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({ error: "Server error fetching menu" }));
      }
    }

    // API endpoint to get reservations as JSON
    else if (req.url === "/api/reservations") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const reservations = await db.collection(reservationCollection).find().toArray();
        await client.close();

        // Add CORS headers for frontend access
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end(JSON.stringify(reservations));
      } catch (err) {
        console.error(err);
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({ error: "Server error fetching reservations" }));
      }
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

    // Serve staff dashboard
    else if (req.url === "/staff-dashboard.html") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);

        const reservations = await db.collection(reservationCollection).find().toArray();
        await client.close();

        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Staff Dashboard</title>
  <style>
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #f0f2f5;
    margin: 0;
    padding: 0;
  }

  header {
    background: #f5576c;
    color: white;
    padding: 15px;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header .header-content {
    flex: 1;
  }

  header .header-buttons {
    display: flex;
    gap: 15px;
  }

  header a, header button {
    color: white;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 15px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.3s;
  }

  header a:hover, header button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .container {
    max-width: 900px;
    margin: 30px auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  h2 {
    text-align: center;
    color: #333;
  }

  .reservation-card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background: #fff;
  }

  .reservation-card h4 {
    margin: 5px 0;
    color: #333;
  }

  .reservation-card p {
    margin: 5px 0;
    color: #555;
  }
</style>
</head>
<body>
  <header>
    <div class="header-content">
      <h1>Staff Dashboard - Reservations</h1>
    </div>
    <div class="header-buttons">
      <a href="http://localhost:3000/">Home</a>
      <a href="/">Logout</a>
    </div>
  </header>
  <div class="container">
    <h2>Reservations</h2>
    ${reservations.length === 0 ? '<p>No reservations found.</p>' : reservations.map(reservation => `
      <div class="reservation-card">
        <h4>${reservation.name}</h4>
        <p><strong>Email:</strong> ${reservation.email}</p>
        <p><strong>Phone:</strong> ${reservation.phone}</p>
        <p><strong>Date:</strong> ${reservation.date}</p>
        <p><strong>Time:</strong> ${reservation.time}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <p><strong>Special Requests:</strong> ${reservation.specialRequests || 'None'}</p>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Server error loading staff dashboard");
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

    // SUBMIT RESERVATION
    if (req.url === "/submit-reservation") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const reservationData = JSON.parse(body);
          const client = new MongoClient(mongoUrl);
          await client.connect();
          const db = client.db(dbName);
          await db.collection(reservationCollection).insertOne(reservationData);
          await client.close();

          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ message: "Reservation submitted successfully" }));
        } catch (err) {
          console.error("Reservation error:", err);
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ error: "Server error submitting reservation" }));
        }
      });
    }

    // LOGIN
    else if (req.url === "/login") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        // console.log("🧠 Received raw body:", body);
        const parsed = query.parse(body);
        const userid = parsed.userid ? parsed.userid.trim().toLowerCase() : '';
        const password = parsed.password ? parsed.password.trim().toLowerCase() : '';
        const role = parsed.role ? parsed.role.trim().toLowerCase() : '';

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);

          let user = null;
          if (role === "admin") {
            user = await db.collection(adminCollection).findOne({ adminId: userid, password });
          } else if (role === "staff") {
            user = await db.collection("staff").findOne({ staffId: userid, password });
          }

          if (user) {
            let redirectUrl = "";
            if (role === "admin") {
              redirectUrl = "http://localhost:8080/dashboard.html";
            } else if (role === "staff") {
              redirectUrl = "http://localhost:8080/staff-dashboard.html";
            }
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({ success: true, redirect: redirectUrl }));
          } else {
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({ success: false, error: "Invalid credentials! Check case" }));
          }
        } catch (err) {
          console.error(err);
          res.writeHead(500, {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
          });
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

        const { name, price, category } = req.body;
        const image = "/uploads/" + req.file.filename;

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);
          await db.collection(menuCollection).insertOne({ name, price, image, category });
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

    // UPDATE MENU ITEM
    else if (req.url.startsWith("/update-menu/")) {
      const id = req.url.split("/update-menu/")[1];
      upload.single("imageFile")(req, res, async (err) => {
        if (err) return res.end("Upload error: " + err.message);

        const { name, price, category } = req.body;
        const updateData = { name, price, category };
        if (req.file) {
          updateData.image = "/uploads/" + req.file.filename;
          // Optionally delete old image
          const client = new MongoClient(mongoUrl);
          try {
            await client.connect();
            const db = client.db(dbName);
            const item = await db.collection(menuCollection).findOne({ _id: new ObjectId(id) });
            if (item && item.image) {
              const oldImagePath = path.join(__dirname, item.image);
              if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          } finally {
            await client.close();
          }
        }

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);
          await db.collection(menuCollection).updateOne({ _id: new ObjectId(id) }, { $set: updateData });
          res.writeHead(302, { Location: "/dashboard.html" });
          res.end();
        } catch (err) {
          console.error("Update error:", err.message);
          res.writeHead(500);
          res.end("Server error updating menu item");
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
