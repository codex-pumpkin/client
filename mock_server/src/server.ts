import express, {Router} from 'express';
import cors from 'cors'

const router = Router()

const acc = {
  id: "acc-id",
  email: "acc-email",
  username: "acc-username",
  is_admin: true,
  is_verified: false,
  auth_via_google: true,
  created_at: "acc-timestamp",
  llm_configurations: []
}

router.get("/account", (_, res) => res.json(acc))

router.post("/auth/login", (_, res) => res.json(acc))

const app = express()

app.use(cors())
app.use(express.json())
app.use("", router)

app.listen(8082, () => {
  console.log("Mock server running on port 8082")
})
