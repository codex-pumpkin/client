import type {NextFunction, Request, Response} from "express";
import {db} from "./db.js";

export interface AuthedRequest extends Request {
  user?: any;
}

export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const user = db.users.find(u => `Bearer fake-${u.id}` === token);
  if (!user) return res.status(401).json({ error: "Invalid token" });

  req.user = user;
  next();
}
