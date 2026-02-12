import {Router} from "express";
import {v4 as uuid} from "uuid";
import {type Conversation, db, fakeToken, now} from './db.js';
import {auth} from './middleware.js';

export const authRouter = Router();

authRouter.post("/signup", (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).end();
  }

  if (db.users.some(u => u.email === email || u.username === username)) {
    return res.status(409).end();
  }

  const id = uuid()

  const user = {
    id: id,
    email,
    username,
    password,
    is_admin: true,
    is_verified: false,
    auth_via_google: false,
    created_at: now()
  };

  db.users.push(user);

  const access_token = `fake-${user.id}`;
  const refresh_token = fakeToken();
  db.refreshTokens.set(refresh_token, user.id);

  res.status(201).json({ access_token, refresh_token });
});

authRouter.post("/login", (req, res) => {
  const { email, username, password } = req.body;

  const user = db.users.find(
    u =>
      (email && u.email === email) ||
      (username && u.username === username)
  );

  if (!user || user.password !== password) {
    return res.status(401).end();
  }

  const access_token = `fake-${user.id}`;
  const refresh_token = fakeToken();
  db.refreshTokens.set(refresh_token, user.id);

  res.json({ access_token, refresh_token });
});

authRouter.post("/refresh", (req, res) => {
  const { refresh_token } = req.body;
  const userId = db.refreshTokens.get(refresh_token);

  if (!userId) return res.status(401).end();

  res.json({
    access_token: `fake-${userId}`,
    refresh_token,
  });
});

authRouter.post("/logout", (req, res) => {
  const { refresh_token } = req.query;
  if (typeof refresh_token === "string") {
    db.refreshTokens.delete(refresh_token);
  }
  res.status(204).end();
});

authRouter.post("/request-password-reset", (req, res) => {
  const { email } = req.body;

  const user = db.users.find(u => u.email === email);

  // Always return 204 to avoid email enumeration
  if (user) {
    const token = fakeToken();
    db.passwordResetTokens.set(token, user.id);

    console.log("🔑 PASSWORD RESET TOKEN");
    console.log("Email:", email);
    console.log("Token:", token);
  }

  res.status(204).end();
});

authRouter.post("/submit-password-reset", (req, res) => {
  const { reset_token, new_password } = req.body;

  const userId = db.passwordResetTokens.get(reset_token);
  if (!userId) return res.status(401).end();

  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(401).end();

  user.password = new_password;
  db.passwordResetTokens.delete(reset_token);

  console.log("✅ PASSWORD RESET SUCCESS");
  console.log("User:", user.email);

  res.status(204).end();
});

authRouter.post("/request-email-verification", auth, (req: any, res) => {
  const user = req.user;

  if (user.is_verified) {
    return res.status(409).end();
  }

  const token = fakeToken();
  db.emailVerificationTokens.set(token, user.id);

  console.log("📧 EMAIL VERIFICATION TOKEN");
  console.log("Email:", user.email);
  console.log("Token:", token);

  res.status(204).end();
});

authRouter.post("/submit-email-verification", (req, res) => {
  const { verification_token } = req.body;

  const userId = db.emailVerificationTokens.get(verification_token);
  if (!userId) return res.status(401).end();

  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(401).end();

  user.is_verified = true;
  db.emailVerificationTokens.delete(verification_token);

  console.log("✅ EMAIL VERIFIED");
  console.log("User:", user.email);

  res.status(204).end();
});
