import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const dbConnect = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully. 🚀");
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
}
export { prisma, dbConnect };