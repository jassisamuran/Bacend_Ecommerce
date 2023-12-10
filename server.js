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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
