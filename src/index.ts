import { dbConnect, } from "./utils/db";
import { app } from "./app";
dbConnect().then(() => {
    app.listen(3000, () => {
        console.log(`server running on http://localhost:${3000}`);
    });
}).catch((err) => {
    console.log("Database connection error:", err);
});