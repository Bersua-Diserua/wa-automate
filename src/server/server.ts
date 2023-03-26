import express from "express";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  next();
});

export { app };
