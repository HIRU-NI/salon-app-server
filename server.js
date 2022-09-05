require("dotenv").config()

const express = require("express")
const app = express()

const cors = require("cors")

app.use(express.json())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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
