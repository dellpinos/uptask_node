import mongoose from "mongoose";
import colors from 'colors';
import { exit } from 'node:process';

export const connectDB = async () => {
    try {

        const { connection } = await mongoose.connect(process.env.DATABASE_URL);
        const url = `${connection.host}:${connection.port}`;

        console.log(colors.bgGreen.white.bold(`MongoDB connected on: ${url}`));

    } catch (error) {
        console.log(colors.white.bgRed.bold(error.message));
        console.log(colors.white.bgRed.bold('Error connecting to the database'));
        exit(1);
    }
}