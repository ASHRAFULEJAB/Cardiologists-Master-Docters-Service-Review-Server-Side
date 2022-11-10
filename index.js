const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
require('dotenv').config()
const jwt = require('jsonwebtoken')

const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('Cardiologists server is running....')
})
app.listen(port, () => {
  console.log(`cardiologists server is running on ${port}`)
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dnw37y6.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    const doctorsServicesCollection = client
      .db('cardiologistsDB')
      .collection('services')
    const reviewCollection = client.db('cardiologistsDB').collection('reviews')

    // servicess
    app.get('/services-home', async (req, res) => {
      const query = {}
      const price = req.query.price
      const cursor = doctorsServicesCollection.find(query).sort({ _id: -1 })
      const services = await cursor.limit(3).toArray()
      res.send(services)
    })

    app.get('/services', async (req, res) => {
      const query = {}
      const price = req.query.price
      const cursor = doctorsServicesCollection.find(query).sort({ _id: -1 })
      const services = await cursor.toArray()
      res.send(services)
    })
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const service = await doctorsServicesCollection.findOne(query)
      res.send(service)
    })
    app.post('/services-home', async (req, res) => {
      const service = req.body
      const result = await doctorsServicesCollection.insertOne(service)
      res.send(result)
    })

    //jwt token
    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).send('Unauthorized Access')
      }
      const token = authHeader.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_JWT, function (err, decoded) {
        if (err) {
          return res.status(403).send('Forbidden Access')
        }
        req.decoded = decoded
        next()
      })
    }

    app.post('/jwtToken', (req, res) => {
      const user = req.body
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_JWT, {
        expiresIn: '10d',
      })
      res.send({ token })
    })

    // reviews
    app.get('/reviews',verifyJWT,async (req, res) => {
      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email,
        }
      }
      const cursor = reviewCollection.find(query)
      const review = await cursor.toArray()
      res.send(review)
    })
    app.get('/reviews/:id',  async (req, res) => {
      const id = req.params.id
    
      const cursor = reviewCollection.find({ service: id })
      const review = (await cursor.toArray())
      res.send(review)
    })
    app.post('/reviews', async (req, res) => {
      const review = req.body
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await reviewCollection.deleteOne(query)
      res.send(result)
    })
    app.put('/reviews/:id', async (req, res) => {
      const { id } = req.params
      console.log(id)
      const reviews = req.body
      const {message } = reviews

      const result = await reviewCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { message: message } }
      )
      
      res.send(result)
    })
  } finally {
  }
}
run().catch(console.dir)
