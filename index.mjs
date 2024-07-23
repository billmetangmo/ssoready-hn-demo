import express from "express"
import cookieSession from "cookie-session"

const app = express()
app.use(cookieSession({
  keys: [process.env.COOKIE_SESSION_SECRET],
}))

app.get("/", (req, res) => {
  res.send(`You are logged in as ${req.session.email}`)
})

app.get("/login", (req, res) => {
`)
})

app.listen(3000, "localhost", () => {
  console.log("listening on localhost:3000")
})
