import {email, z} from "zod";

export const signUpUserValidation = z.object({
    name : z.string(),
    email : z.email(),
    password : z.string(),
    role : z.enum(["customer","owner"]).optional(),
    phone : z.string().optional()
});

export const loginUserValidation = z.object({
    email:z.email(),
    password:z.string()
});

export const hotelValidation = z.object({
    name : z.string(),
    description : z.string().optional(),
    city : z.string(),
    country : z.string(),
    amenities : z.array(z.string()).optional()
});

export const roomValidation = z.object({
    roomNumber:z.string(),
    roomType:z.string(),
    pricePerNight:z.float64(),
    maxOccupancy:z.int()
});

export const bookingValidation = z.object({
    roomId :z.string(),
    checkInDate : z.iso.date(),
    checkOutDate :z.iso.date(),
    guests : z.int()
})

export const reviewValidation =  z.object({
    bookingId : z.string(),
    rating : z.int(),
    comment : z.string()
})

export const hotelQueryValidation = z.object({
    city : z.string().optional(),
    country : z.string().optional(),
    minPrice : z.int().optional(),
    maxPrice : z.int().optional(),
    minRating :z.number().optional()
});