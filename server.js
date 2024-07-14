const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const PushNotifications = require("node-pushnotifications");
const cors = require("cors");
require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express();

// Configuração de CORS para permitir todas as origens
app.use(cors());

app.use(express.static(path.join(__dirname, "client")));
app.use(bodyParser.json());

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
  try {
    const subscription = req.body;

    // Verifique se a subscription é válida
    if (!subscription || !subscription.endpoint) {
      throw new Error("Invalid subscription object");
    }

    subscriptions.push(subscription);

    res.status(201).json({});
  } catch (err) {
    console.error("Failed to subscribe:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
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

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));

// Função para enviar notificações para todas as assinaturas
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

// Enviar notificações a cada 10 segundos
setInterval(sendNotification, 10000);
