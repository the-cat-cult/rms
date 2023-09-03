import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

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
mongoose.connect(connectionString, {dbName: process.env.DATABASE_NAME})
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Error connecting to database', error);
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

app.get('*', function (req, res) {
    res.status(404).redirect('/pages/page_404.html');
});

const __dirname = path.resolve();


app.use((err, req, res, next) => {
    if (! err) {
        return next();
    }

    return res.sendFile(path.join(__dirname + '/public/pages/page_500.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
