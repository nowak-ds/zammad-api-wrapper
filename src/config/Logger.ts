import winston, { transports } from "winston";
import { Constants } from "./Constants";

export const Logger = winston.createLogger({
    transports: [
        new transports.File({
            dirname: Constants.LOG_DIR,
            filename: "inventory.log"
        }),
        new transports.File({
            dirname: Constants.LOG_DIR,
            filename: "inventory_error.log",
            level: "error"
        })
    ]
})