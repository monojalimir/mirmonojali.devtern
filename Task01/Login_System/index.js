const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();
//convert data into json format 
app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", (req,res) => {
    res.render("login");
})

app.get("/signup", (req,res) => {
    res.render("signup");
})

//Register User
app.post("/signup", async (req,res) => {
    const data = {
        email: req.body.username,
        password: req.body.password
    }

    //check if the user already exists in the databas
    const existingUser = await collection.findOne({email: data.email});
    if(existingUser){
        res.send("User already exists. Please choose a different username.");
    }
    else {
        //hash the password using bcrypt
        const saltRounds = 10; //number of salt round for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; //Replace the hash password with original password
        try {
            const userdata = await collection.insertMany(data);
            console.log(userdata);
            res.send("User registered successfully");
        } catch (error) {
            console.error("Error inserting user data:", error);
            res.status(500).send("Internal server error");
        }
    }
});

//Login user
app.post( "/login" ,async (req, res) => {
    try{
        const check = await collection.findOne({email: req.body.username});
        if(!check) {
            res.send("user email connot found");
        } else {
            //compare the hash password
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (!isPasswordMatch) {
                res.render("login", { error: "Wrong password" });
            }else {
                res.render("home");
            }
        }
    }catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal server error");
        // res.send("wrong Details");
    }
});

const port = 7001;
app.listen(port, () =>{
    console.log('Server running on Port: $(port)');
})