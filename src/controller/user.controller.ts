import { ApiError } from '../utils/ApiError.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { prisma } from '../utils/db.ts';
import { type Request, type Response } from 'express';
import type { payloadType, signUpType } from '../utils/type.d.ts';
import { loginUserValidation, signUpUserValidation } from '../utils/validation.user.ts';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// const data = prisma.user

const signUp = async (req: Request<{},{},signUpType>, res: Response) => {
    const validation = await signUpUserValidation.safeParseAsync(req.body);

    if (!validation.success) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    const { name, email, password, role, phone } = validation.data;

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        return res
            .status(400)
            .json(new ApiError(400, "EMAIL_ALREADY_EXISTS"));
    }
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role,
            phone
        }
    });

    const savedUser = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true
        }
    });

    if (!savedUser) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }
    // console.log(savedUser);

    return res
        .status(201)
        .json(new ApiResponse(201, savedUser));
}

const login = async (req: Request, res: Response) => {
    const validation = await loginUserValidation.safeParseAsync(req.body);

    if (!validation.success) {
        return res.status(400).json(new ApiError(400, "INVALID_REQUEST"));
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
        where: {
            email
        },
    });

    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, "INVALID_CREDENTIALS"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res
            .status(401)
            .json(new ApiError(401, "INVALID_CREDENTIALS"));
    }

    const payload : payloadType = {
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role,
        phone : user.phone
    }

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: '7d'
        }
    );

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: '1d'
        }
    );

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken,
        }
    });

    const responseUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const optins = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
    }

    return res
        .status(200)
        .cookie('refreshToken', refreshToken, optins)
        .cookie('accessToken', accessToken, optins)
        .json(new ApiResponse(200, { token: accessToken, user: responseUser }));
}

export { signUp, login };