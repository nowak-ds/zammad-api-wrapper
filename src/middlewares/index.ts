import { NextFunction, Request, Response } from "express"

export const AuthMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    if(req.headers.authorization) {
        next();
    }else {
        res.status(401).send();
    }
}