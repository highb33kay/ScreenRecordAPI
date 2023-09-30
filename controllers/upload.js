const fs = require("fs");
const path = require("path");

// Function to delete a file
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err}`);
    } else {
      console.log(`Deleted file: ${filePath}`);
    }
  });
};

const uploadVideo = async (req, res) => {
  try {
    console.log("starting");
    console.log(req.file);
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Create a unique filename (you can use any logic you prefer)
    const uniqueFilename = Date.now() + "-" + req.file.originalname;

    // Define the directory path where the video will be saved locally (outside controller)
    const directoryPath = path.join(__dirname, "../uploads");

    // Check if the "uploads" directory exists; if not, create it
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Define the file path where the video will be saved within the "uploads" directory
    const filePath = path.join(directoryPath, uniqueFilename);

    // Create a write stream to save the video locally
    const writeStream = fs.createWriteStream(filePath);

    // Pipe the data from the uploaded file buffer to the write stream
    req.file.stream.pipe(writeStream);

    // Wait for the write stream to finish
    writeStream.on("finish", async () => {
      const file = new Video({
        filename: req.file.originalname,
        videoPath: filePath, // Store the local file path
      });
      await file.save();
      res.status(201).json({ file });

      // Schedule file deletion after 5 minutes
      setTimeout(() => {
        deleteFile(filePath);
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    });

    // Handle any errors that occur during the write stream
    writeStream.on("error", (error) => {
      console.error(error);
      res.status(500).json({ error });
    });
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
