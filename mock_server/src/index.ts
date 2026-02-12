import express from "express";
import cors from "cors";
import {auth} from "./middleware.js";
import {authRouter} from "./auth.js";
import {
  type Conversation,
  db,
  deserializeDatabase,
  fakeToken,
  type LLMConfig,
  now,
  serializeDatabase,
  setDb
} from "./db.js";
import {v4 as uuid} from "uuid";
import * as fs from 'node:fs';

const app = express();
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  // Reading database
  if (!fs.existsSync(PATH)) {
    fs.writeFileSync(PATH, JSON.stringify(db))
  }

  const content = fs.readFileSync(PATH, "utf-8")
  setDb(deserializeDatabase(content))

  res.on('finish', () => {
    fs.writeFileSync(PATH, serializeDatabase(db))
  })

  next()
})

app.use("/auth", authRouter);

/* ================= ACCOUNT ================= */

app.get("/account", auth, (req: any, res) => {
  res.json(req.user);
});

app.put("/account", auth, (req: any, res) => {
  const newName = req.body.username
  const newMail = req.body.email

  let emailChanged = false

  db.users = db.users.map(user => {
    if(user.id == req.user.id) {
      emailChanged = user.email != newMail
      return {
        ...user,
        username: newName,
        email: newMail,
        is_verified: emailChanged ? false : req.user.is_verified
      }
    } else {
      return user
    }
  })

  if(emailChanged) {
    const token = fakeToken();
    db.emailVerificationTokens.set(token, req.user.id);

    console.log("📧 EMAIL VERIFICATION TOKEN");
    console.log("Email:", req.user.email);
    console.log("Token:", token);
  }

  res.status(200).end()
});

/* ================= LLM CONFIGS ================= */
app.get("/llm-configurations", auth, (req: any, res) => {
  res.json(db.llmConfigs)
})

app.put("/llm-configurations/:id", auth, (req: any, res) => {
  const {id} = req.params;
  const {name, api_url, api_key} = req.body;

  if (!name || !api_url) {
    return res.status(400).end();
  }

  const config = db.llmConfigs.find(
    (c: LLMConfig) => c.id === id
  );

  if (!config) {
    return res.status(404).end();
  }

  config.name = name;
  config.api_url = api_url;

  if (api_key !== undefined) {
    config.api_key_set = true;
  }

  res.json({
    id: config.id,
    name: config.name,
    api_url: config.api_url,
    api_key_set: config.api_key_set,
  });
});

app.post("/llm-configurations", auth, (req: any, res) => {
  const {name, api_url, api_key} = req.body;

  if (!name || !api_url) {
    return res.status(400).end();
  }

  const config = {
    id: uuid(),
    name,
    api_url,
    api_key_set: api_key !== undefined && api_key.trim().length > 0,
  };

  db.llmConfigs.push(config);

  res.status(201).json(config);
});

app.delete("/llm-configurations/:id", auth, (req: any, res) => {
  db.llmConfigs = db.llmConfigs.filter(
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

app.put("/conversations/:id", auth, (req: any, res) => {
  const target = db.conversations.find(convo => convo.id == req.params.id && convo.user_id == req.user.id)

  if (!target) {
    return res.status(403).end()
  }

  db.conversations = db.conversations.map(convo => {
    if (convo == target) {
      target.name = req.body.name
      target.pinned = req.body.pinned
      return target
    } else {
      return convo
    }
  })

  return res.status(200).end()
});

app.delete("/conversations/:id", auth, (req: any, res) => {
  db.conversations = db.conversations.filter(convo =>
    !(convo.id == req.params.id && convo.user_id == req.user.id)
  )

  return res.status(200).end()
});

app.post("/conversations", auth, (req: any, res) => {
  const id = uuid()

  const convo: Conversation = {
    id: id,
    user_id: req.user.id,
    name: req.body.name,
    pinned: false,
    llm_model_config_id: req.body.llm_model_config_id,
    target_language: req.body.target_language,
    created_at: now(),
    messages: [],
  };

  // First message is only added 10 seconds after to simulate creation time
  setTimeout(() => {
    if (!fs.existsSync(PATH)) {
      fs.writeFileSync(PATH, JSON.stringify(db))
    }

    const content = fs.readFileSync(PATH, "utf-8")
    setDb(deserializeDatabase(content))

    const message = {
      id: uuid(),
      message: req.body.message,
      response: "Mock LLM response",
      generation_millis: 123,
      created_at: now(),
    };

    db.conversations.find(convo => convo.id == id)!.messages.push(message)

    fs.writeFileSync(PATH, serializeDatabase(db))
  }, 1000)

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

app.put("/quota", auth, (req: any, res) => {
  const newQuota = {
    member: req.body.member,
    admin: req.body.admin
  }
  db.quota = newQuota

  res.status(200).end()
})

app.get("/analytics", auth, (_req, res) => res.json(db.analytics));


export const PATH = "/home/simon/IdeaProjects/client/mock_server/src/db.json"

/* ================= START ================= */

app.listen(8082, () => {


  console.log("🚀 Mock API running on http://localhost:8082");
});

