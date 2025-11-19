import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { router as authRoutes } from "./routes/authRoutes.js";
import { router as audioRoutes } from "./routes/audioRoutes.js";


dotenv.config();
const app = express();

app.use(express.json());

// Enable CORS for React (Port 5173)
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/audio", audioRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Node.js server running on port ${PORT}`);
});