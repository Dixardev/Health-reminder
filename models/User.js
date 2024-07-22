const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    coinBalance: { type: Number, default: 0 },
    isMining: { type: Boolean, default: false },
    miningStartTime: { type: Date, default: null },
    referralUsername: { type: String, default: '' },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    completedTasks: [{ type: Number }],
    lastCheckInDate: { type: Date },
    miningSessionCount: { type: Number, default: 0 } // Add this field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
