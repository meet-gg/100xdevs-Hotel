import { type Request, type Response } from "express";
import { prisma } from '../utils/db.ts'
import { hotelValidation, roomValidation } from "../utils/validation.user.ts";
import { ApiError } from "../utils/ApiError.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import type { hotelQueryType } from "../utils/type";

const createHotel = async (req: Request, res: Response) => {

    const owner = req.user;
    if (!owner) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }

    const validation = await hotelValidation.safeParseAsync(req.body);

    if (!validation.success) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    const { name, description, city, country, amenities } = validation.data;

    const hotel = await prisma.hotel.create({
        data: {
            name,
            description,
            city,
            country,
            amenities,
            ownerId: owner.id
        }
    });

    const createdHotel = await prisma.hotel.findUnique({
        where: {
            id: hotel.id
        },
    });

    if (!createdHotel) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    return res.
        status(201).
        json(new ApiResponse(201, createdHotel))
};


const createRoom = async (req: Request, res: Response) => {
    const validation = await roomValidation.safeParseAsync(req.body);
    if (!validation.success) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }
    const { roomNumber, roomType, pricePerNight, maxOccupancy } = validation.data;
    const hotelId = req?.params?.hotelId as string;

    const hotel = await prisma.hotel.findUnique({
        where: {
            id: hotelId
        }
    });

    if (!hotel) {
        return res.
            status(404).
            json(new ApiError(404, "HOTEL_NOT_FOUND"));
    }

    const existingRoom = await prisma.room.findFirst({
        where: {
            hotelId,
            roomNumber
        }
    });
    // console.log(existingRoom);

    if (existingRoom) {
        return res.
            status(400).
            json(new ApiError(400, "ROOM_ALREADY_EXISTS"));
    }

    const room = await prisma.room.create({
        data: {
            roomNumber,
            roomType,
            pricePerNight,
            maxOccupancy,
            hotelId
        }
    });

    const createdRoom = await prisma.room.findUnique({
        where: {
            id: room.id
        }
    });

    if (!createdRoom) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    return res.
        status(201)
        .json(new ApiResponse(201, createdRoom));

}

const getHotels = async (req: Request<{}, {}, {}, hotelQueryType>, res: Response) => {

    const { city, country, minPrice, maxPrice, minRating } = req.query;

    const minP = minPrice ? Number(minPrice) : undefined;
    const maxP = maxPrice ? Number(maxPrice) : undefined;
    const minR = minRating ? Number(minRating) : undefined;

    const pricePerNightFilter: any = {};
    if (minP !== undefined) pricePerNightFilter.gte = minP;
    if (maxP !== undefined) pricePerNightFilter.lte = maxP;

    const priceRoomFilter =
        Object.keys(pricePerNightFilter).length > 0
            ? { pricePerNight: pricePerNightFilter }
            : {};

    const hotels = await prisma.hotel.findMany({
        where: {
            ...(city && {
                city: { contains: city, mode: "insensitive" }
            }),

            ...(country && {
                country: { contains: country, mode: "insensitive" }
            }),

            ...(minR !== undefined && {
                rating: { gte: minR }
            }),

            rooms: {
                some: priceRoomFilter
            }
        },

        select: {
            id: true,
            name: true,
            description: true,
            city: true,
            country: true,
            amenities: true,
            rating: true,
            totalReviews: true,

            rooms: {
                where: priceRoomFilter,
                select: {
                    pricePerNight: true
                }
            }
        }
    });


    const data = hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        city: hotel.city,
        country: hotel.country,
        amenities: hotel.amenities,
        rating: hotel.rating,
        totalReviews: hotel.totalReviews,
        minPricePerNight: Math.min(
            ...hotel.rooms.map(room => room.pricePerNight)
        )
    }));

    return res.status(200).json(new ApiResponse(200, data));

}

const getHotelById = async (req: Request<{ hotelId: string }>, res: Response) => {
    const hotelId = req?.params?.hotelId;
    if (!hotelId) {
        return res
            .status(404)
            .json(new ApiError(404, "HOTEL_NOT_FOUND"));
    }

    const hotel = await prisma.hotel.findUnique({
        where: {
            id: hotelId
        },
        omit: {
            createdAt: true
        }
    });
    if (!hotel) {
        return res
            .status(404)
            .json(new ApiError(404, "HOTEL_NOT_FOUND"));
    }

    const rooms = await prisma.room.findMany({
        where: {
            hotelId: hotelId
        },
        omit: {
            hotelId: true,
            createdAt: true
        }
    })


    return res.
        status(200)
        .json(new ApiResponse(200, {
            ...hotel,
            rooms
        }));
}


export { createHotel, createRoom, getHotelById, getHotels };

