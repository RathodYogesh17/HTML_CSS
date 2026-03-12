"use strict"
const express = require("express")
import http from "http";
import { router } from "./Routes";
import path from "path";
const cors = require("cors");

const app = express();
app.use(express.json());               
app.use(express.urlencoded({ extended: true })); 
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

app.use("/api", router)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
let server = new http.Server(app);
export default server;