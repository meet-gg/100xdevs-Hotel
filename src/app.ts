import express ,{type Application, type Request,type Response} from 'express';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser())

import userRouter from "./routes/user.routes.ts";
import hotelRouter from "./routes/hotel.routes.ts";
import bookingRouter from "./routes/booking.routes.ts"
import reviewRouter from "./routes/reviews.routes.ts"

app.use("/api/auth",userRouter);
app.use("/api/hotels",hotelRouter);
app.use("/api/bookings",bookingRouter);
app.use("/api",reviewRouter);

app.get('/',(req:Request,res:Response)=>{
    res.json({message:"Hello"});
});

export {app};

