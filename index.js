const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
app.use(cors())
app.use(express.json())
require('dotenv').config()

const port = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Cardiologists server is running....')
})
app.listen(port, () => {
    console.log(`cardiologists server is running on ${port}`);
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dnw37y6.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const doctorsServicesCollection = client.db('cardiologistsDB').collection('services')
        app.get('/services-home', async (req, res) => {
            const query = {}
            
            const cursor = doctorsServicesCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
          })
     
        app.get('/services', async (req, res) => {
            const query = {}
            
            const cursor = doctorsServicesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await doctorsServicesCollection.findOne(query)
            res.send(service)
          })
     
    }
    finally {
        
    }
    
}
run().catch(console.dir)