require("dotenv").config()

const cors = require("cors")

const express = require("express")
const app = express()

app.use(express.json())
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
)
app.options("*", cors())

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const Sib = require("sib-api-v3-sdk")

const services = new Map([
  [001, { title: "Haircut", amount: 2500 }],
  [002, { title: "Hair style", amount: 5000 }],
  [003, { title: "Makeup", amount: 7500 }],
])

app.post("/create-checkout-session", async (req, res) => {
  try {
    const serviceItem = services.get(parseInt(req.body.id))
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: serviceItem.title },
            unit_amount: serviceItem.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.body.baseURL}/success`,
      cancel_url: `${req.body.baseURL}/booking`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const client = Sib.ApiClient.instance
const apiKey = client.authentications["api-key"]
apiKey.apiKey = process.env.API_KEY

const tranEmailApi = new Sib.TransactionalEmailsApi()

const sender = {
  email: "hirunimanth@gmail.com",
  name: "Salon",
}
const receivers = [
  {
    email: "hirunimanth@gmail.com",
  },
]

app.post("/send-email", async (req, res) => {
  try {
    tranEmailApi
      .sendTransacEmail({
        sender,
        to: receivers,
        subject: "Subscribe to Cules Coding to become a developer",
        textContent: `
          Cules Coding will teach you how to become {{params.role}} a developer.
          `,
        htmlContent: `
          <h1>Cules Coding</h1>
          <a href="https://cules-coding.vercel.app/">Visit</a>
                  `,
        params: {
          role: "Frontend",
        },
      })
      .then(res.json())
      .catch(res.status(500).json({ error: e.message }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(process.env.PORT || 8080)
