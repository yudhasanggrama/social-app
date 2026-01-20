import "dotenv/config";
import express from "express";
import router from "./routes/routes";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express()
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Vite
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/api/v1", router);


app.listen(process.env.PORT, ()=> {
    console.log("server is running");
    
})