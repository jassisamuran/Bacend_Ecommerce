const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");
const db = require("./database");
const { User, Catalog, Order } = require("./schema/userSchema");

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // If username is taken, return an error response
      return res.status(400).json({ error: "Username is already taken" });
    }

    // If username is not taken, proceed to create a new user
    const newUser = new User({ username, password, userType });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    // Handle other errors, like database connection issues, etc.
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      "123456",
      { expiresIn: "24h" }
    );

    res.json({ token: token });
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

app.post("/api/buyer/create-order/:buyer_id/:seller_id", async (req, res) => {
  try {
    const { buyer_id, seller_id } = req.params;
    const { products } = req.body;

    // Find the buyer based on the provided buyer_id
    const buyer = await User.findById(buyer_id);

    if (!buyer || buyer.userType !== "buyer") {
      return res.status(404).json({ error: "Buyer not found" });
    }

    // Find the seller based on the provided seller_id
    const seller = await User.findById(seller_id);

    if (!seller || seller.userType !== "seller") {
      return res.status(404).json({ error: "Seller not found" });
    }

    const order = new Order({ buyer, seller, products });
    await order.save();

    res.json({ message: "Order created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating order" });
  }
});

app.get("/api/seller/orders", async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user and check if they are a seller
    const user = await User.findOne({ _id: userId });
    if (!user || user.userType !== "seller") {
      return res.status(403).json({ error: "User is not a seller" });
    }

    // Fetch orders for the seller (user)
    const orders = await Order.find({ seller: userId });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching seller orders" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
