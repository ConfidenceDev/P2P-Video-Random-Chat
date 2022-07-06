const http = require("http");
const path = require("path");
const express = require("express");
const forceSsl = require("force-ssl-heroku");
const main = require("./routes/main");
const { config, corsHeader } = require("./cors/cors");
const app = express();
const ExpressPeerServer = require("peer").ExpressPeerServer;
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: corsHeader,
});
const PORT = process.env.PORT || 443;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "views/public")));
const options = {
  debug: true,
  allow_discovery: true,
};
const peerServer = ExpressPeerServer(server, options);
app.use("/", peerServer);

app.get("/" || "/index.html", (req, res) => {
  res.sendFile(__dirname + "/views/public/index.html");
});

io.on("connection", (socket) => {
  main(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
