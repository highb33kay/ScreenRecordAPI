const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload");
const {
  uploadVideo,
  getAllVideos,
  getSingleVideo,
  deleteVideo,
  searchVideo,
  deleteAllVideos,
} = uploadController;

// Remove multer configuration for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// upload video: POST (accept base64 data)
router.post("/upload", uploadVideo);

router.get("/", (req, res) => {
  res.send(
    "Hello from the upload route. Use the /upload route to upload a video."
  );
});

router.get("/videos/:videoId", getSingleVideo);

router.get("/videos", getAllVideos);

router.delete("/videos/:videoId", deleteVideo);

router.get("/search", searchVideo);

router.delete("/videos", deleteAllVideos);

module.exports = router;
