const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected;

const connectToDatabase = async () => {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        isConnected = true;
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw new Error('Could not connect to database');
    }
};

module.exports = connectToDatabase;
