const express = require("express");
const router = express.Router();
const recordingController = require("../controllers/recording");
const {
  startRecording,
  streamRecordingData,
  stopRecordingAndSaveFile,
  streamVideo,
} = recordingController;

// Start recording
router.post("/start-recording", startRecording);

// Stream recording data
router.post("/stream-recording/:sessionID", streamRecordingData);

// Stop recording and save the file
router.post("/stop-recording/:sessionID", stopRecordingAndSaveFile);

//  stream video
router.get("/stream/:sessionID", streamVideo);

module.exports = router;