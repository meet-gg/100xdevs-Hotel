import express ,{type Application, type Request,type Response} from 'express';
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.ts";
import hotelRouter from "./routes/hotel.routes.ts";
import bookingRouter from "./routes/booking.routes.ts"
import reviewRouter from "./routes/reviews.routes.ts"
import { ApiError } from './utils/ApiError.ts';

const app:Application = express();

app.use(express.json());
app.use(cookieParser())


app.use("/api/auth",userRouter);
app.use("/api/hotels",hotelRouter);
app.use("/api/bookings",bookingRouter);
app.use("/api",reviewRouter);

app.get('/',(req:Request,res:Response)=>{
    res.json({message:"Hello"});
});

app.use((err:any,req:Request,res:Response)=>{
    console.error(err);
    if(err.statusCode){
        return res.status(err.statusCode).json(new ApiError(err.statusCode, err.message));
    }
    res.status(500).json(new ApiError(500, "Internal Server Error"));
});

export {app};

