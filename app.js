import e from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import User from "./models/user.models.js";
import connectDB from "./models/db.config.js";
import isAdminRoute from "./utils/isAdmin.js";
import isAuthenticated from "./utils/isAuthenticated.js";
connectDB();

dotenv.config();
const app = e();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    }
));


app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/register", async (req, res) => {
  const {name, email, role, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ name, email, role, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body; 
    const user = await User.findOne({ email });

    if(!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if(!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }
    
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
});

app.get("/api/protected", isAuthenticated, isAdminRoute, (req, res) => {
    res.json({ message: "Protected data accessed", user: req.user });
}) ;


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

