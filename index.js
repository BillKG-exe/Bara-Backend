const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config()


const routes = require('./routes/routes')
const employeesRoute = require('./routes/employee')
const employersRoute = require('./routes/employer')
const isAuthenticatedRoute = require('./routes/isAuthenticated')

app = express()

app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200'],
  credentials: true
}))

app.use(express.urlencoded({ extended: false}));
app.use(express.json());


/* app.use('/api', routes) */
app.use('/employee', employeesRoute)
app.use('/employer', employersRoute)
app.use('/isAuthenticated', isAuthenticatedRoute)

app.listen(8000, () => console.log('App listening to port 8000'))

app.use(express.static('public/company'))
app.use(express.static('public/candidates'))

app.get('/', (req, res) => res.send("Hello World!"))      //To be deleted

