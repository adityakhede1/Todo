const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");   // built in module
app.use(express.static(path.join(__dirname,"Frontend")));

const mongoose = require("mongoose");
const dns = require("dns")
dns.setServers(['1.1.1.1', '8.8.8.8'])

const cors = require('cors')
app.use(cors());
app.use(cors({
    origin: process.env.FRONTEND_URL
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

require('dotenv').config()

const {userRouter} = require("./routes/user");
const {todoRouter} = require("./routes/todo");
const {loggerMiddleware} = require("./middleware/logger")

app.use("/user", userRouter);
app.use("/todo", todoRouter);

app.use("/", function(req,res){
    res.sendFile(path.join(__dirname, "Frontend", "signin.html"));
});

async function main() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        app.listen(process.env.PORT || 5000);
        console.log("listening on port" + process.env.PORT)
    } catch(e){
        console.error("Database connection failed:", e.message);
        process.exit(1); // stop the server
    }
}

main();