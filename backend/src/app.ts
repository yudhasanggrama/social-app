import "dotenv/config";
import express from "express";
import router from "./routes/user";
import cors from "cors";


const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", // Vite
    credentials: true,
  })
);

app.use("/api/v1", router);


app.listen(process.env.PORT, ()=> {
    console.log("server is running");
    
})