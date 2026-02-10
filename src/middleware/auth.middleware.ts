import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.ts";
import type { payloadType } from "../utils/type.d.ts";

export const verifyJWT = async (req: Request , res: Response, next: NextFunction) => {
    // console.log(req.cookies);

    const token = req.cookies.accessToken ?? req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as payloadType; 

    if (!decodedToken) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }

    req.user = decodedToken;

    next();
};

export const role = (role:string) => (req:Request,res:Response,next:NextFunction) => {
    const user = req?.user;
    if(!user){
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }
    const isValidRole = role === user.role;
    if(!isValidRole){
        return res.
            status(403).
            json(new ApiError(403,"FORBIDDEN"))
    }
    next();
}
