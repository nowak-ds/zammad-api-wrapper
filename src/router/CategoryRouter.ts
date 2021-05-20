import { Request, Response, Router } from "express";
import { API_HELPER } from "../api-helper";
import { ApiResponseParser, OffsetData } from "../lib";
import { Service } from "../services";

export const CategoryRouter = Router();

CategoryRouter.get("/", async (req: Request, res: Response) => {
    const limit = req.query.limit ? req.query.limit: 0;
    const skip = req.query.skip ? req.query.skip: 0;
    const { all } = req.query;

    const root = await new Service(null)
    .init(req);
    const data = all ? ApiResponseParser.getCategories(root) : ApiResponseParser.getParentCategoriesList(root);


    res.json(OffsetData(data, limit, skip));
});

CategoryRouter.get("/:id", async (req: Request, res: Response) => {
    
    const root = await new Service(null)
    .init(req);
    const queryCategories: any[] = ApiResponseParser.getCategories(root);
    if(queryCategories.length) {
        console.log("QUERY ID", req.params.id);
        const category = queryCategories.filter((item)=> item.id === Number(req.params.id));
        if(category.length) {
            res.json(category[0]);
            return;
        }
    }

    res.status(404).send();
});

/**
 * Get children categories
 */
CategoryRouter.get("/:id/categories", async (req: Request, res: Response)=> {
    const parent_id:Number = req.params.id ? Number(req.params.id): 0;
    
   

    if(parent_id) {
        const root = await new Service(null)
        .init(req);

        const queryCategories: any[] = ApiResponseParser.getChildCategories(root, parent_id);
        if(queryCategories.length) {
            res.json(queryCategories);
        }else {
            res.status(204).json({message: "No content"});
        }
        
        return;
    }

    res.status(400).json({message: "Parent id is a required field"});
});