const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "https://tenanthub-jas51nozj-la-fox.vercel.app",
  "https://tenanthub-git-main-la-fox.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// YOUR ROUTES COME AFTER CORS
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000);
