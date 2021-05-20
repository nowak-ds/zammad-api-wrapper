import axios from "axios";
import { Router, Request, Response } from "express";
import { ApiHelper } from "../api-helper";
import { ApiResponseParser, OffsetData } from "../lib";
import { AuthMiddleWare } from "../middlewares";
import { Service } from "../services";
import { AnswerRouter } from "./AnswerRouter";
import { CategoryRouter } from "./CategoryRouter";
import { IconFileRouter } from "./IconFileRouter";
import { TicketRouter } from "./TicketRouter";

export const ApplicationRouter = Router();

ApplicationRouter.get("/heath", (req: Request, res: Response)=> {
    res.json({status: "active"});
});

ApplicationRouter.get("/knowledge-bases", AuthMiddleWare, async (req, res)=> {

    const limit = req.query.limit ? req.query.limit: 0;
    const skip = req.query.skip ? req.query.skip: 0;
    const API_HELPER = new ApiHelper(req.headers.authorization);

    // API_HELPER.setAuthHeader(req.headers.authorization)
    API_HELPER.post("/knowledge_bases/init")
    .then((response)=> {
        if(response.status === 200 ){
            const data = new Service(null).findAllKnowledgeBases(response.data);


            res.json(OffsetData(data, limit, skip))
            
            return;
        }else {
            res.status(204).send()
        }
       
    })
    .catch((error)=> {
        res.json(error.message)
    });

});


ApplicationRouter.get("/knowledge-bases/:id", AuthMiddleWare, async (req, res)=> {
    console.log("Request", req.params);
    const API_HELPER = new ApiHelper(req.headers.authorization);
    // API_HELPER.setAuthHeader(req.headers.authorization)
    API_HELPER.post("/knowledge_bases/init")
    .then((response)=> {
        if(response.status === 200 ){
            const data = new Service(response.data).findAllKnowledgeBases(response.data);
            res.json(data.filter(item => item.id === Number(req.params.id)));
        }else {
            res.status(204).send()
        }
        
    })
    .catch((error)=> {
        res.json(error.message)
    });

});

ApplicationRouter.use("/categories", AuthMiddleWare, CategoryRouter);
ApplicationRouter.use("/answers", AuthMiddleWare, AnswerRouter);
ApplicationRouter.use("/icons", IconFileRouter);
ApplicationRouter.use("/tickets", AuthMiddleWare, TicketRouter);