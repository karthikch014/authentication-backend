import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:'http://localhost:5173',credentials:true}));

const port = process.env.PORT || 5000;

app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);

app.get('/',(req,res)=>{
    res.json({message: 'API is working'});
})

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MONGODB connected'))
    .catch((error)=> console.error('Connection error', error.message));
