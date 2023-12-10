const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
app.use(bodyParser.json());
const db = require("./database");
const { User, Catalog, Order } = require("./schema/userSchema");

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const user = new User({ username, password, userType });

    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
    console.log("Error is ", error);
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    //  const token = jwt.sign(
    //    { userId: user._id, username: user.username },
    //    "123456",
    //    { expiresIn: "24h" }
    //  );

    res.json({ token: "your_token" });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});
app.get("/api/buyer/list-of-sellers", async (req, res) => {
  try {
    const sellers = await User.find({ userType: "seller" }, "username");
    res.json({ sellers });
  } catch (error) {
    console.log("Error list-of-sellers", error);
    res.status(500).json({ error: "Error fetching sellers" });
  }
});

app.get("/api/buyer/seller-catalog/:seller_id", async (req, res) => {
  try {
    const { seller_id } = req.params;
    const catalog = await Catalog.findOne({ seller: seller_id }, "products");
    res.json({ catalog });
  } catch (error) {
    res.status(500).json({ error: "Error fetching seller catalog" });
  }
});

app.post("/api/seller/create-catalog", async (req, res) => {
  try {
    const { products, sellerId } = req.body;

    // Find the seller based on the provided sellerId
    const seller = await User.findOne({ _id: sellerId, userType: "seller" });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // Check if a catalog already exists for the seller
    let catalog = await Catalog.findOne({ seller });

    if (!catalog) {
      // If the catalog doesn't exist, create a new one
      catalog = new Catalog({ seller, products });
    } else {
      // If the catalog already exists, update the products
      catalog.products = products;
    }

    await catalog.save();

    res.json({ message: "Catalog created/updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating/updating catalog" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
