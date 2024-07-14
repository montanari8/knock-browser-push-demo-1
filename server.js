const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const PushNotifications = require("node-pushnotifications");
const cors = require("cors");
require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express();

// Set static path
app.use(express.static(path.join(__dirname, "client")));

app.use(bodyParser.json());
app.use(cors()); // Use o middleware cors para lidar com CORS

const publicVapidKey = "BGzhoR-UB7WPENnX8GsiKD90O8hLL7j8EPNL3ERqEiUUw1go74KBLCbiInuD_oamyCI5AjtScd2h8fqifk9fpjA"; // REPLACE_WITH_YOUR_KEY
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const email = process.env.EMAIL;

const settings = {
  web: {
    vapidDetails: {
      subject: `mailto:${email}`,
      publicKey: publicVapidKey,
      privateKey: privateVapidKey,
    },
    gcmAPIKey: "gcmkey",
    TTL: 2419200,
    contentEncoding: "aes128gcm",
    headers: {},
  },
  isAlwaysUseFCM: false,
};

const push = new PushNotifications(settings);

let subscriptions = [];

app.post("/subscribe", (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;

  // Add subscription to the list
  subscriptions.push(subscription);

  // Send 201 - resource created
  res.status(201).json({});
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/main.js", (req, res) => {
  res.sendFile(__dirname + "/main.js");
});
app.get("/sw.js", (req, res) => {
  res.sendFile(__dirname + "/sw.js");
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));

// Function to send notifications to all subscriptions
const sendNotification = () => {
  const payload = { title: "Notificação enviada pelo servidor" };
  subscriptions.forEach(subscription => {
    push.send(subscription, payload, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
  });
};

// Send notifications every 10 seconds
setInterval(sendNotification, 10000);
