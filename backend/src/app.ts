import "dotenv/config";
import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./routes/index";





const app = express()
app.use(
  cors({
    origin: "http://localhost:5173", // Vite
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/v1", router)



app.listen(process.env.PORT, ()=> {
    console.log("server is running");
    
})