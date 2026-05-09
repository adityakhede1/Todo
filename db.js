const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String    
})

const todoSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    completed : {
        type: Boolean,
        default: false,
    },
    author: { 
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema);
const todoModel = mongoose.model("todo", todoSchema);

module.exports = {
    userModel, todoModel
}