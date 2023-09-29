const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const Video = require("../models/Upload");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadVideo = async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "video" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error });
        } else {
          const file = new Video({
            filename: req.file.originalname,
            videoUrl: result.secure_url,
          });
          await file.save();
          res.status(201).json({ file });
        }
        console.log("result", result);
      }
    );

    console.log(stream.secure_url);

    // res.status(201).json({ file });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getSingleVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    res.status(200).json({ video });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//delete video form db and from cloudinary
const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ msg: "No video found" });
    }
    const publicId = video.videoUrl.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(publicId);
    await Video.findByIdAndDelete(videoId);
    res.status(200).json({ msg: "Video deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const searchVideo = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ msg: "Name parameter is required for search." });
    }
    // Perform the search in the database
    const videos = await Video.find({
      filename: { $regex: name, $options: "i" },
    });

    if (videos.length === 0) {
      return res.status(404).json({ msg: "No videos found with that name." });
    }
    res.status(200).json({ videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

//delete video form db and from cloudinary
const deleteAllVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    if (videos.length === 0) {
      return res.status(404).json({ msg: "No videos found" });
    }
    console.log(videos);
    videos.forEach(async (video) => {
      const publicId = video.videoUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      await Video.findByIdAndDelete(video._id);
    });
    res.status(200).json({ msg: "All videos deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getSingleVideo,
  deleteVideo,
  searchVideo,
  deleteAllVideos,
};
