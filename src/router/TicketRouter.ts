import { Router } from "express";
import { Constants } from "../config/Constants";
import { Zammad } from '../lib/Zammad';

export const TicketRouter = Router();

const API = new Zammad.API(Constants.API_BASE_URL);

TicketRouter.post('/', (req, res) => {
    if (req.body != null && req.headers.authorization != null) {
        API.setAuthHeader(req.headers.authorization);
        if (Zammad.isIConditions(req.body)) {
            API.getTickets(req.body).then((value) => {
                res.send(value);
            }).catch(reason => console.warn(reason));
        } else {
            console.warn('Invalid body was send to get tickets.');
            res.sendStatus(404);
        }
    } else {
        console.warn('Authorization must be set in header and a body must be passed.');
        res.sendStatus(404);
    }
});