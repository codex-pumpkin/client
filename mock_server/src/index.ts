import express from "express";
import cors from "cors";
import { auth } from "./middleware.js";
import { authRouter } from "./auth.js";
import {type Conversation, db, now} from "./db.js";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

/* ================= ACCOUNT ================= */

app.get("/account", auth, (req: any, res) => {
  res.json(req.user);
});

/* ================= LLM CONFIGS ================= */

app.post("/account/llm-configurations", auth, (req: any, res) => {
  const cfg = {
    id: uuid(),
    name: req.body.name,
    api_url: req.body.api_url,
    api_key_set: Boolean(req.body.api_key),
  };
  req.user.llm_configurations.push(cfg);
  res.status(201).json(cfg);
});

app.delete("/account/llm-configurations/:id", auth, (req: any, res) => {
  req.user.llm_configurations = req.user.llm_configurations.filter(
    (c: any) => c.id !== req.params.id
  );
  res.status(204).end();
});

app.get("/account/profile-picture", (req: any, res) => {
  const path = "/home/simon/IdeaProjects/client/mock_server/src/images.png"

  res.sendFile(path, {
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });
})

/* ================= CONVERSATIONS ================= */

app.get("/conversations", auth, (req: any, res) => {
  res.json(db.conversations.filter(c => c.user_id === req.user.id));
});

app.post("/conversations", auth, (req: any, res) => {
  const convo: Conversation = {
    id: uuid(),
    user_id: req.user.id,
    name: req.body.name,
    pinned: false,
    llm_model_config_id: req.body.llm_model_config_id,
    target_language: req.body.target_language,
    created_at: now(),
    messages: [],
  };

  convo.messages.push({
    id: uuid(),
    message: req.body.message,
    response: "Mock LLM response",
    generation_millis: 123,
    created_at: now(),
  });

  db.conversations.push(convo);
  res.status(201).json(convo);
});

app.post("/conversations/:id/messages", auth, (req: any, res) => {
  const convo = db.conversations.find(
    c => c.id === req.params.id && c.user_id === req.user.id
  );

  if (!convo) return res.status(403).end();

  const msg = {
    id: uuid(),
    message: req.body.message,
    response: "Mock follow-up response",
    generation_millis: 98,
    created_at: now(),
  };

  convo.messages.push(msg);
  res.json(msg);
});

/* ================= QUOTA & ANALYTICS ================= */

app.get("/quota", (_req, res) => res.json(db.quota));
app.get("/analytics", auth, (_req, res) => res.json(db.analytics));

/* ================= START ================= */

app.listen(8082, () => {
  console.log("🚀 Mock API running on http://localhost:8082");
});
