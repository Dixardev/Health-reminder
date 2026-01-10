const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path to your User model

mongoose.connect('mongodb+srv://pauljohnson:fameshow@softcoin.uiemwjw.mongodb.net/?retryWrites=true&w=majority&appName=softcoin', { useNewUrlParser: true, useUnifiedTopology: true });

async function checkUser() {
    try {
        const user = await User.findOne({ username: 'anuneye' });
        console.log(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkUser();
