const cors = require("cors");

const corsHeader = {
  origin: [
    "https://vebbo.herokuapp.com/",
    "https://vebbo.me",
    "https://vebbo.me/",
  ],
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: [
    "Access-Control-Allow-Headers",
    "X-Requested-With",
    "X-Access-Token",
    "Content-Type",
    "Host",
    "Accept",
    "Connection",
    "Cache-Control",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

const config = cors(corsHeader);

module.exports = {
  config,
  corsHeader,
};
