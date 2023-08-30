
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import router from './server/routes/main.js';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", express.static('public'))
// set up mongoose
//mongodb+srv://root:root@cluster0.sagez.mongodb.net/?retryWrites=true&w=majority
mongoose.connect('mongodb://localhost:27017/rms', { dbName: 'rms' })
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Error connecting to database');
    });
// set up port
const port = process.env.PORT || 8080;
// set up route
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the API"
    });
});

app.use('/api/', router);

app.listen(port, () => {
    console.log(`Our server is running on port ${port}`);
});