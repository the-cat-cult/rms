
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

import router from './server/routes/main.js';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", express.static('public'))
// set up mongoose
mongoose.connect(process.env.CONNECTION_STRING, { dbName: process.env.DATABASE_NAME })
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

app.get('*', function(req, res){
    res.status(404).redirect('/pages/page_404.html');
});

app.listen(port, () => {
    console.log(`Our server is running on port ${port}`);
});