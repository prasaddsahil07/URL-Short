const express = require("express");
const path = require("path");
const urlRoute = require("./routes/url");
const URL = require('./models/url');
const staticRoute = require("./routes/staticRouter");
const { connectToMongoDB } = require("./connect");
const { DB_NAME } = require("./constant")
const app = express();

const PORT=8001;

connectToMongoDB(`mongodb://localhost:27017/${DB_NAME}`)
    .then(
        () => console.log("MongoDB connected"))
    .catch(error => console.error("MongoDB connection error:", error));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req,res,next)=>{
    const now = Date.now();
    const start = new Date();
    next();
    const time = Date.now()-now;
    console.log(`Request Logged @${start} From: ${req.method} ${req.baseUrl}${req.url} ${time}ms`);
});

app.use("/url", urlRoute);

app.use("/", staticRoute);

app.get('/:shortId', async (req, res) => {
    console.log(req.body);
    try {
        const shortId = req.params.shortId;
        const result = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    }
                }
            }
        ).exec(); // Executing the query
        if (result) {
            res.status(200).send("Visited URL recorded successfully"); 
        } else {
            res.status(404).send("Short URL not found");
        }
    } catch (error) {
        console.error("Error while processing GET request:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
