require('dotenv').config()
const express = require('express');
const router = require('./routes');
const app = express()
app.use(express.json({ limit: '5mb' }))
const cors = require('cors')
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

app.use(cookieParser())
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:4000', 'https://www.mentormap.io', 'https://admin.mentormap.io', 'https://pre.mentormap.io']
}
app.use(cors(corsOption))
connectDB()

const PORT = process.env.PORT || 5000;

app.use(router)

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Hello there V2' })
})

app.listen(PORT, () => {
    console.log('Server is running...')
})