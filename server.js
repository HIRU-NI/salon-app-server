require("dotenv").config()

const nodemailer = require("nodemailer")
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
    let testAccount = await nodemailer.createTestAccount()
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <hirunimanth@gmail.com>', // sender address
      to: "bar@example.com, hirunimanth@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(process.env.PORT || 8080)
