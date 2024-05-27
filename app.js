const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = 'D:/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe'; // Update this with the actual path to ffmpeg.exe
ffmpeg.setFfmpegPath(ffmpegPath);


const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static("public"));
// Serve uploaded videos statically
app.use("/uploads", express.static("uploads"));

// Handle file upload
app.post("/upload", upload.single("video"), (req, res) => {
  res.send("File uploaded successfully");
});

// Handle request to list videos
app.get("/videos", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    const videos = files.filter((file) => {
      return path.extname(file).toLowerCase() === ".mp4"; // Filter only mp4 files
    });
    res.json(videos);
  });
});

// Handle request to trim videos
app.get("/trim", (req, res) => {
  const videoName = req.query.video;
  const duration = parseInt(req.query.duration);

  const inputPath = `uploads/${videoName}`;
  const outputPath = `uploads/${videoName}_trimmed_${duration}s.mp4`;

  ffmpeg(inputPath)
    .setStartTime(0)
    .duration(duration)
    .output(outputPath)
    .on("end", () => {
        console.log("successfully trimmed video")
      res.json({
        message: `Video trimmed to ${duration} seconds successfully`,
      });
    })
    .on("error", (err) => {
      console.error("Error trimming video:", err);
      res.status(500).json({ error: "Internal server error" });
    })
    .run();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
