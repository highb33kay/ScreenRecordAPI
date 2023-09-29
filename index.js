const express = require("express");
const app = express();
const connectDB = require("./config/config");
require("dotenv").config();
const { readdirSync } = require("fs");
const cors = require("cors");
require("./models/Upload");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

readdirSync("./routes").map((path) => {
  app.use("/api", require(`./routes/${path}`));
});

app.get("/", (req, res) => {
  res.send("I am working but youve got to work too");
});

const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
