import { SERUA_EVENT } from "../controller/event";
import cors from "cors";
import express from "express";
import fs from "fs";

const app = express();

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.json({ limit: "100mb" }));

app.use((req, res, next) => {
  next();
});

app.get("/", (req, res) => {
  return res.status(200).json({ message: "last changes 1 Apr 20.08" });
});

app.post("/general-text", async (req, res) => {
  const wording = ["terhubung", "hubungkan"];

  const { phone, message } = req.body;

  SERUA_EVENT.emit("send", {
    type: "general-text",
    data: {
      phone,
      message,
    },
  });

  const found = String(message)
    .toLowerCase()
    .split(" ")
    .some((r) => wording.indexOf(r) >= 0);

  if (found) {
    console.log({
      found,
      phone,
    });
    SERUA_EVENT.emit("internal", {
      type: "live-assist",
      data: { phone },
    });
  }

  res.status(200).json({
    response: "Success send attach-media",
    body: req.body,
  });
});

app.post("/attach-image", async (req, res) => {
  const { phone, message, image } = req.body;

  SERUA_EVENT.emit("send", {
    type: "attach-media",
    data: {
      phone,
      message,
      image,
    },
  });

  res.status(200).json({
    response: "Success send attach-media",
    body: req.body,
  });
});

app.get("/reset_session", (req, res) => {
  try {
    fs.rmSync("session", { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    res.status(400).json(new Error(error));
  }
});

app.get("/restart_app", (req, res) => {
  process.exit(0);
});

export { app };
