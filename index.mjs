import express from "express"
import cookieSession from "cookie-session"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SSOReadyClient } from "ssoready";

const domainToOrgMap = {
  "gmail.com": "authentik",
  "example.com": "authentik"
};

const app = express()
app.use(express.json())
app.use(cookieSession({
  secret: "this is just a demo app",
}))

app.get("/api/whoami", (req, res) => {
  res.json({ email: req.session.email })
})

const ssoready = new SSOReadyClient()

app.post("/api/saml/redirect", async (req, res) => {
  const domain = req.body.domain;
  const organizationExternalId = domainToOrgMap[domain];

  if (!organizationExternalId) {
    return res.status(400).json({ error: "Domain email not supported through SAML. Add it to domainToOrgMap " });
  }

  const { redirectUrl } = await ssoready.saml.getSamlRedirectUrl({
    organizationExternalId
  });

  res.json({ redirectUrl });
});

app.post("/api/saml/redeem", async (req, res) => {
  // res.status(500).send()
  const { email } = await ssoready.saml.redeemSamlAccessCode({
    samlAccessCode: req.body.samlAccessCode,
  })
  req.session.email = email
  res.status(200).send()
})

// poor man's single-page app stuff
app.use(express.static("public"))
app.use("*", (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  res.sendFile(__dirname + "/public/index.html")
})

app.listen(3000, "localhost", () => {
  console.log("listening on localhost:3000")
})
