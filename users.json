const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true // Trims whitespace
    },
    last_name: {
        type: String,
        required: true,
        trim: true // Trims whitespace
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email uniqueness
        trim: true,
        lowercase: true // Saves emails in lowercase
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (v)=> {
                // Simple regex for validating phone number format
                return /^\d{10}$/.test(v); // Adjust regex according to your requirements
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    profile_pic: {
        type: String, // Store image path or URL if you're using cloud storage like AWS S3
        required: false // Profile pic is optional
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
