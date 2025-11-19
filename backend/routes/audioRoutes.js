// import express from "express";
// import mongoose from "mongoose";
// import multer from "multer";
// import { GridFSBucket } from "mongodb";
// import { authenticate } from "../routes/authRoutes.js";

// const router = express.Router();

// // MongoDB Connection
// const conn = mongoose.connection;
// let gridFSBucket;

// // Initialize GridFSBucket when MongoDB is connected
// conn.once("open", () => {
//   console.log("✅ MongoDB connection established!");
//   gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audioFiles" });
// });

// // Multer Storage (stores in memory before uploading to GridFS)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // 📌 Upload Audio (Protected Route)
// router.post("/upload", authenticate, upload.single("audio"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const { originalname, buffer } = req.file;

//   try {
//     const uploadStream = gridFSBucket.openUploadStream(originalname, {
//       contentType: "audio/wav",
//     });

//     uploadStream.write(buffer);
//     uploadStream.end();

//     uploadStream.on("finish", () => {
//       res.status(200).json({ message: "✅ File uploaded successfully!", filename: originalname });
//     });

//     uploadStream.on("error", (err) => {
//       console.error("❌ Upload Error:", err);
//       res.status(500).json({ error: "File upload failed" });
//     });

//   } catch (err) {
//     console.error("❌ Upload Exception:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // 📌 Get Audio File (Protected Route)
// router.get("/file/:filename", authenticate, async (req, res) => {
//   try {
//     const filename = decodeURIComponent(req.params.filename); // Handle special characters
//     const file = await conn.db.collection("audioFiles.files").findOne({ filename });

//     if (!file) {
//       return res.status(404).json({ error: "❌ File not found" });
//     }

//     const readStream = gridFSBucket.openDownloadStream(file._id);
//     res.set("Content-Type", file.contentType);
//     readStream.pipe(res);
//   } catch (err) {
//     console.error("❌ File Fetch Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // 📌 List All Uploaded Files
// router.get("/files", authenticate, async (req, res) => {
//   try {
//     const files = await conn.db.collection("audioFiles.files").find().toArray();
//     if (!files || files.length === 0) {
//       return res.status(404).json({ error: "No files found" });
//     }
//     res.json(files);
//   } catch (err) {
//     console.error("❌ File List Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Export the Router
// export { router };

import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { GridFSBucket } from "mongodb";
import { authenticate } from "../routes/authRoutes.js";

const router = express.Router();

// MongoDB Connection to local database
const conn = await mongoose.createConnection('mongodb://localhost:27017/VoiceGuard');

// Create a schema for audio file metadata
const AudioFileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  uploadDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confidence: Number,
  result: {
    type: String,
    enum: ['deepfake', 'authentic'],
    required: true
  }
}, {
  // Explicitly specify the collection name
  collection: 'Audio_File_Uploads'
});

const AudioFile = conn.model('AudioFile', AudioFileSchema);

let gridFSBucket;

// Initialize GridFSBucket when MongoDB is connected
conn.once("open", () => {
  console.log("✅ MongoDB connection to VoiceGuard established!");
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "audioFiles" });
});

// Multer Storage (stores in memory before uploading to GridFS)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'audio/wav',    // WAV
      'audio/mpeg',   // MP3
      'audio/ogg',    // OGG
      'audio/webm',   // WebM Audio
      'audio/flac',   // FLAC
      'audio/x-m4a',  // M4A
      'audio/aac'     // AAC
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio file type'), false);
    }
  }
});

// 📌 Upload Audio (Protected Route)
router.post("/upload", authenticate, upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or invalid file type" });
  }
  const { originalname, mimetype, buffer } = req.file;
  try {
    // Create metadata
    const metadata = new AudioFile({
      filename: originalname,
      contentType: mimetype,
      userId: req.user._id, // Assuming authenticate middleware adds user to request
      confidence: Math.floor(Math.random() * 20) + 80, // Simulated confidence
      result: Math.random() > 0.7 ? 'deepfake' : 'authentic' // Simulated detection result
    });
    await metadata.save();
    
    const uploadStream = gridFSBucket.openUploadStream(originalname, {
      contentType: mimetype,
      metadata: {
        audioFileId: metadata._id
      }
    });
    
    uploadStream.write(buffer);
    uploadStream.end();
    
    uploadStream.on("finish", () => {
      res.status(200).json({ 
        message: "✅ File uploaded successfully!", 
        filename: originalname,
        contentType: mimetype,
        confidence: metadata.confidence,
        result: metadata.result
      });
    });
    
    uploadStream.on("error", (err) => {
      console.error("❌ Upload Error:", err);
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (err) {
    console.error("❌ Upload Exception:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Fetch Recent Audio Files
router.get("/recent-files", authenticate, async (req, res) => {
  try {
    const recentFiles = await AudioFile.find({ userId: req.user._id })
      .sort({ uploadDate: -1 }) // Sort by date descending
      .limit(5);
    res.json(recentFiles);
  } catch (err) {
    console.error("❌ Recent Files Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Get Audio File Stream
router.get("/file/:id", authenticate, async (req, res) => {
  try {
    const file = await AudioFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "❌ File not found" });
    }
    const downloadStream = gridFSBucket.openDownloadStream(file._id);
    res.set("Content-Type", file.contentType);
    downloadStream.pipe(res);
  } catch (err) {
    console.error("❌ File Fetch Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the Router
export { router };