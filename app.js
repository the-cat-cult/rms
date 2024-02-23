import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import "express-async-errors"

import router from './server/routes/main.js';
import path from "path";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/", express.static('public'))
// set up mongoose
let connectionString = process.env.NODE_ENV === 'development' ? process.env.CONNECTION_STRING_DEV : process.env.CONNECTION_STRING_PROD;
mongoose.connect(connectionString)
    .then(() => {
        console.log('\x1b[34m%s\x1b[0m', 'Connected to database');
        let url = 'http://localhost:8080/';
        console.log('\x1b[33m%s\x1b[0m', `Server running on ${url}`);
    })
    .catch((error) => {
        console.log('Error connecting to database', error);
    });

const __dirname = path.resolve();

// Route definitions
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the API"
    });
});

app.use('/api/', router);

app.get('*', function (req, res) {
    res.status(404).redirect('/pages/page_404.html');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (!res.headersSent) {
        res.status(500).sendFile(path.join(__dirname, '/public/pages/page_500.html'));
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});