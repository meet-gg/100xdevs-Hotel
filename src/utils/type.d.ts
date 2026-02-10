export interface signUpType {
    name:String,
    email:String,
    password:String,
    role:customer|owner,
    phone:string?
}

export interface hotelType{
    name:string,
    description:string,
    city:string,
    country:string,
    amenities:string[]
}

declare module "express-serve-static-core" {
  interface Request {
    user: payloadType
  }
}

export interface payloadType {
    id:string
    name : user.name,
    email : user.email,
    role : user.role,
    phone : user.phone
}

export interface hotelQueryType {
  city?:string,
  country?:string,
  minPrice?:number,
  maxPrice?:number,
  minRating?:number
}

export type Status = "confirmed" | "cancelled";