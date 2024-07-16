const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected;

const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    return mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
};

module.exports = connectToDatabase;
