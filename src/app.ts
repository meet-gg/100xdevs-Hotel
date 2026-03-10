import express ,{type Application, type Request,type Response} from 'express';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser())

import userRouter from "./routes/user.routes";
import hotelRouter from "./routes/hotel.routes";
import bookingRouter from "./routes/booking.routes"
import reviewRouter from "./routes/reviews.routes"

app.use("/api/auth",userRouter);
app.use("/api/hotels",hotelRouter);
app.use("/api/bookings",bookingRouter);
app.use("/api",reviewRouter);

app.get('/',(req:Request,res:Response)=>{
    return res.json({message:"Hello"});
});

export {app};

