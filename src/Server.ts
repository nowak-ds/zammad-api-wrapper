import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Constants } from './config/Constants';
import {Logger } from "./config/Logger";
import { ApplicationRouter } from './router';
import cors from "cors";

const App:Application = express();

/**
 * Register Common Middlewares
 */
App.use(bodyParser.json());
App.use(express.static("public"));
App.use(cors());

/**
 * Rester Routers
 */
App.use(ApplicationRouter);
global["logger"] = Logger

export default App