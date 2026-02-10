import type { Request, Response } from "express"
import { reviewValidation } from "../utils/validation.user.ts"
import { ApiError } from "../utils/ApiError.ts";
import { prisma } from "../utils/db.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";

const review = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, "UNAUTHORIZED"));
    }

    const validation = await reviewValidation.safeParseAsync(req.body);

    if (!validation.success) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    const { bookingId, rating, comment } = validation.data;

    if(rating>5 || rating < 1){
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: {
            reviews: true,
            hotel: {
                select: {
                    rating: true,
                    totalReviews: true
                }
            }
        }
    });

    if (!booking) {
        return res
            .status(404)
            .json(new ApiError(404, "BOOKING_NOT_FOUND"));
    }

    if (user?.id !== booking?.userId) {
        return res
            .status(403)
            .json(new ApiError(403, "FORBIDDEN"));
    }

    if (booking?.reviews) {
        return res
            .status(400)
            .json(new ApiError(400, "ALREADY_REVIEWED"));
    }

    if (new Date() < new Date(booking?.checkOutDate) || booking?.status === "cancelled") {
        return res
            .status(400)
            .json(new ApiError(400, "BOOKING_NOT_ELIGIBLE"));
    }

    const reviews = await prisma.review.create({
        data: {
            bookingId,
            rating,
            comment,
            hotelId: booking?.hotelId,
            userId: user?.id
        }
    });

    const savedReview = await prisma.review.findUnique({
        where: {
            id: reviews.id
        }
    });

    if (!savedReview) {
        return res
            .status(400)
            .json(new ApiError(400, "INVALID_REQUEST"));
    }

    const newRating = (((booking?.hotel?.rating) * (booking?.hotel?.totalReviews)) + rating) / ((booking?.hotel?.totalReviews) + 1);

    const hotel = await prisma.hotel.update({
        where: {
            id: booking?.hotelId
        },
        data: {
            rating: newRating,
            totalReviews: booking?.hotel?.totalReviews + 1
        }
    });

    return res.
        status(201)
        .json(new ApiResponse(201, savedReview));
}

export { review };