import mongoose from "mongoose";
import app from "./app";
import config from "./config/index";

// (async () => {})()
(async () => {
    try {
        await mongoose.connect(config.MONGODB_URL);
        console.log("DB Connected");

        app.on('error', (err) => {
            console.log("ERROR: ", err);
            throw err;
        })

        app.listen(config.PORT, () => {
            console.log(`App running on http://localhost:${config.PORT}`);
        })
    } catch (error) {
        console.log("ERROR: ", error);
        throw error;
    }
})()