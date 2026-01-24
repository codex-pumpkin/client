import type {Request, Response, NextFunction} from "express";
import { db } from "./db.js";

export interface AuthedRequest extends Request {
  user?: any;
}

export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  console.log(`-------- Inside auth middleware --------`)
  console.log(`Got current users: ${JSON.stringify(db.users)}`)
  console.log(`Presented auth token is: ${token}`)
  const user = db.users.find(u => {
    const dec = `Bearer fake-${u.id}` === token
    console.log(`Compared ${`Bearer fake-${u.id}`} to ${token} and got ${dec}`)
    return dec
  });
  console.log(`Found associated user: ${JSON.stringify(user)}`)
  if (!user) return res.status(401).json({ error: "Invalid token" });

  req.user = user;
  next();
}
