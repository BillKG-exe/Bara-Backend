const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

mongoose.connect('mongodb://localhost/node_auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, () => {
  console.log('connected to the database')
})

const routes = require('./routes/routes')

app = express()


app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200'],
  credentials: true
}))

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use('/api', routes)

app.listen(8000, () => console.log('App listening to port 8000'))

app.get('/', (req, res) => res.send("Hello World!"))      //To be deleted