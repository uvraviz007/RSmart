import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import itemRoute from './routes/item.route.js'
import userRoute from './routes/user.route.js'
import adminRoute from './routes/admin.route.js'
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config()
const port = process.env.PORT || 3000
const uri=process.env.MONGO_URI

app.use(cookieParser())
app.use(express.json())
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));



try{
    await mongoose.connect(uri);
    console.log("Connected to DataBase")
} catch (error){
    console.log(error)
}

app.use('/api/v1/items',itemRoute)
app.use('/api/v1/users',userRoute)
app.use('/api/v1/admins',adminRoute)

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET_KEY
});

app.listen(port, () => {
  console.log(`Sever listening on port ${port}`)
})