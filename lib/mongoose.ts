import mongoose from 'mongoose';

let isConnected = false //track connection status
const mongoURI = process.env.MONGODB_URI

export const connectToDB = async () => {
    mongoose.set('strictQuery', true)

    if (!mongoURI) return console.log('No MongoDB URI provided')
    if (isConnected) return console.log('Using an existing db connection')

    try {
        await mongoose.connect(mongoURI)
        isConnected = true
        console.log('Connected to MongoDB')

    } catch (error) {
        console.log(error)
    }
}