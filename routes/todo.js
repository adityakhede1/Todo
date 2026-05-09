const mongoose = require("mongoose");
const express = require("express");
const path = require("path");

const { loggerMiddleware } = require("../middleware/logger")
const { userModel, todoModel } = require("../db");

const todoRouter = express.Router();
todoRouter.use(express.json());

todoRouter.use(loggerMiddleware);

const cookieParser = require("cookie-parser");
todoRouter.use(cookieParser());

todoRouter.get("/app",function(req,res){
    res.sendFile(path.join(__dirname, "..", "Frontend", "todo.html"));
});

// logout
todoRouter.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict"
    });    
    res.status(200).json({
        message: "Logout successful"
    });
});

// getName to display
todoRouter.post("/getName", async function (req, res) {
    const user = await userModel.findById(req.userId);
    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        });
    }
    return res.json({
        success: true,
        firstName: user.firstName
    });
});

// create todo
todoRouter.post("/create",async function(req,res){
    const { title, completed } = req.body;

    try {
        const todo = await todoModel.create({
            // ...req.body
            title,
            completed,
            author: req.userId   // 👈 this links todo to the user
        });

        res.json({
            success: true,
            todo
        });
    } catch (err) {
        console.log("Full error:", err)
        res.json({
            success: false,
            message: err.message
        });
    }
})

// delete todo
todoRouter.delete("/delete/:id",async function(req,res){
    try {
        const deleted = await todoModel.findOneAndDelete({
            _id: req.params.id,
            author: req.userId
        });

        if (!deleted) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json({ message: "Deleted successfully" });

    } catch (err) {
        
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
})

// edit todo
todoRouter.patch("/edit/:id",async function(req,res){
    try {
        // prevents to update any extra in the todo field
        const allowedUpdates = {};

        if (req.body.title !== undefined) {
            allowedUpdates.title = req.body.title;
        }
        if (req.body.completed !== undefined) {
            allowedUpdates.completed = req.body.completed;
        }

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }
        // update
        const updatedTodo = await todoModel.findOneAndUpdate(
            {
                _id: req.params.id,
                author: req.userId
            },
            allowedUpdates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }
        res.json({
            message: "Todo updated successfully",
            todo: updatedTodo
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }    
})

// get all the todos
todoRouter.get("/all", async (req, res) => {
    try {
        const todos = await todoModel.find({
            author: req.userId
        });

        return res.json(todos);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = {
    todoRouter: todoRouter
}