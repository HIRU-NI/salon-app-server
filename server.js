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

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const services = new Map([
  [001, { title: "Haircut", amount: 2500 }],
  [002, { title: "Hair style", amount: 5000 }],
  [003, { title: "Makeup", amount: 7500 }],
])

app.post("/create-checkout-session", async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With")
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
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/booking`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(8080)
