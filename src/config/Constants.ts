import dotenv from "dotenv";
import fs from "fs";

if(fs.existsSync(".env")) {
    dotenv.config({path: ".env"});
}
// else {
//     throw new Error("Missing environment file"); 
//}


export const Constants = {
    API_BASE: "/api/v1",
    PORT: process.env.PORT || 3000,
    LOG_DIR: "/tmp/inventory",
    API_BASE_URL: process.env.API_BASE_URL || "http://77.68.114.90:8080/api/v1"
}