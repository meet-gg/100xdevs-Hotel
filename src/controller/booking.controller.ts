import type { Request, Response } from "express";
import { bookingValidation } from "../utils/validation.user.ts";
import { ApiError } from "../utils/ApiError.ts";
import { prisma } from "../utils/db.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import type { Status } from "../utils/type";


const createBooking = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }

    const validation = await bookingValidation.safeParseAsync(req.body);
    if (!validation.success) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }
    // console.log("hello");
    const { roomId, checkInDate, checkOutDate, guests } = validation.data;
    // console.log(checkInDate,checkOutDate);
    if (checkInDate > checkOutDate) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }
    const room = await prisma.room.findUnique({
        where: {
            id: roomId
        }
    });

    if (!room) {
        return res.
            status(404)
            .json(new ApiError(404, "ROOM_NOT_FOUND"));
    }

    if (room.maxOccupancy < guests) {
        return res.
            status(400)
            .json(new ApiError(400, "INVALID_CAPACITY"));
    }

    const currentDate = new Date();

    if (new Date(checkInDate) < currentDate || new Date(checkOutDate) < currentDate) {
        return res.
            status(400)
            .json(new ApiError(400, "INVALID_DATES"));
    }
    // console.log("hello");

    const existingBooking = await prisma.booking.findFirst({
        where: {
            roomId,
            checkInDate: {
                lt: checkOutDate,
            },
            checkOutDate: {
                gt: checkInDate,
            },
        }
    });

    if (existingBooking && existingBooking.status !== "cancelled") {
        return res.
            status(400)
            .json(new ApiError(400, "ROOM_NOT_AVAILABLE"));
    }
    let nights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime())
        / (1000 * 60 * 60 * 24)
    );

    const totalPrice = nights * room.pricePerNight;

    const booking = await prisma.booking.create({
        data: {
            roomId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests,
            totalPrice,
            userId: user.id,
            hotelId: room.hotelId,
            status : "confirmed"
        }
    });

    const savedBooking = await prisma.booking.findUnique({
        where: {
            id: booking.id
        },
        omit: {
            cancelledAt: true
        }
    })

    if (!savedBooking) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    // console.log(savedBooking);

    return res.
        status(201).
        json(new ApiResponse(201, savedBooking));

}

const getBooking = async (req: Request<{}, {}, {}, { status: Status }>, res: Response) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }

    const status = req.query?.status;

    const bookings = await prisma.booking.findMany({
        where: {
            userId: user.id,
            ...(status && { status })
        },
        omit: {
            cancelledAt: true,
            userId: true
        },
        include: {
            hotel: {
                select: {
                    name: true
                }
            },
            room: {
                select: {
                    roomNumber: true,
                    roomType: true
                }
            }
        }
    });

    const responseBookings = bookings.map((booking) => ({
        ...booking,
        hotelName: booking.hotel?.name,
        roomNumber: booking.room?.roomNumber,
        roomType: booking.room?.roomType,
        room: undefined,
        hotel: undefined
    }));
    // console.log(bookings);


    return res.
        status(200)
        .json(new ApiResponse(200, responseBookings));
}


const cancelBooking = async (req: Request<{ bookingId: string }>, res: Response) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }
    const bookingId = req.params?.bookingId;
    if (!bookingId) {
        return res
            .status(404)
            .json(new ApiError(404, "BOOKING_NOT_FOUND"));
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId,
        }
    });
    
    if (!booking) {
        return res
            .status(404)
            .json(new ApiError(404, "BOOKING_NOT_FOUND"));
    }

    if (booking?.userId !== user?.id) {
        return res
            .status(403)
            .json(new ApiError(403, "FORBIDDEN"));
    }

    if (booking.cancelledAt) {
        return res
            .status(400)
            .json(new ApiError(400, "ALREADY_CANCELLED"));
    };

    const currentDate = new Date().getTime();
    const chechInDate = new Date(booking?.checkInDate).getTime();

    const hoursUntilCheckIn = Math.ceil((chechInDate - currentDate) / (1000 * 60 * 60));

    if (hoursUntilCheckIn < 24) {
        return res
            .status(400)
            .json(new ApiError(400, "CANCELLATION_DEADLINE_PASSED"));
    }

    const bookingg = await prisma.booking.update({
        where : {
            id : bookingId
        },
        data : {
            cancelledAt : new Date().toISOString(),
            status : "cancelled"
        },
        select : {
            id:true,
            status : true,
            cancelledAt : true
        }
    })

    return res.
        status(200).json(new ApiResponse(200, bookingg));
}

export { createBooking, getBooking,cancelBooking }