import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/auth.routes";

dotenv.config();

const allowedOrigins = [
  'https://nexgest2.netlify.app',
  'http://localhost:5173',
];


const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como curl o postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use('/api',router);

export default app;