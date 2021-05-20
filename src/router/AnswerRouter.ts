import { Request, Response, Router } from "express";
import { API_HELPER } from "../api-helper";
import { ApiResponseParser, OffsetData } from "../lib";
import { Service } from "../services";

const getAnswerById = async (answer_id, req: Request)=> {
    const root = await new Service(null)
        .init(req);

    const queryAnswers = ApiResponseParser.getAnswers(root);
    if(queryAnswers.length) {
        const answer = queryAnswers.filter(answer=>answer.id === answer_id);
        if(answer && answer.length) {
            return answer[0]; 
        }
    } 

    return null;
}

const getUserById = (users, id)=> {
    if(id) {
        const query = users.filter(user=>user.id === id);
        return query.length ? query[0]: null;
    } else {
        return null;
    }
}

export const AnswerRouter = Router();

AnswerRouter.get("/", async (req: Request, res: Response) => {
    
    const limit = req.query.limit ? req.query.limit: 0;
    const skip = req.query.skip ? req.query.skip: 0

    try {
        const category_id = req.query["category-id"] ? Number(req.query["category-id"]): 0;
        console.log("Category id ", category_id);
        const root = await new Service(null)
        .init(req);
        const answers = ApiResponseParser.getAnswers(root)
        if(category_id) {
            if(category_id) {
                const byCategories = answers.filter(answer => answer.category_id === category_id);
                if(byCategories.length) {
                    res.json(OffsetData(byCategories, limit, skip));
                    return;
                }
            }
            
        }else {
            res.status(400).json({message: "`category-id` field is mandatory"});
            return;
        }

        res.status(204).json();
        return;
    } catch (error) {
        console.log("ERROR");
        res.status(400).json();
    }
    
});

AnswerRouter.get("/:id", async (req: Request, res: Response) => {
    
    try {
        const root = await new Service(null)
        .init(req);

        const queryAnswers = ApiResponseParser.getAnswers(root);
        if(queryAnswers.length) {
            const answer = queryAnswers.filter(answer=>answer.id === Number(req.params.id));
            if(answer && answer.length) {
                res.json(answer[0]);
                return;
            }
        }
    } catch (error) {
      res.status(400).send();  
    }
    

    res.status(404).send();
});

AnswerRouter.get("/:id/details", async (req: Request, res: Response) => {

    const answer_id = req.params.id ? Number(req.params.id) : 0;
    const knowledge_base_id = req.query.kbId ? Number(req.query.kbId) : 0;

    if (answer_id && knowledge_base_id) {

        try {
            const root = await Service.instance().getAnswerDetails(knowledge_base_id, answer_id, req);

            if (root && root.assets) {
                const answerContentTranslations = root?.assets?.KnowledgeBaseAnswerTranslationContent
                    ? Object.values(root.assets.KnowledgeBaseAnswerTranslationContent)
                    : [];
                const answerTranslation: any[] = root.assets.KnowledgeBaseAnswerTranslation
                    ? Object.values(root.assets.KnowledgeBaseAnswerTranslation)
                    : [];
                const answers = Object.values(root.assets.KnowledgeBaseAnswer);
                const users = Object.values(root.assets.User);

                const answerQuery = answers.filter((answer: any) => answer.id === answer_id);

                if (answerQuery.length) {
                    const answer: any = answerQuery[0];

                    res.json({
                        ...answer,
                        title: answerTranslation.length ? answerTranslation[0].title : "",
                        content: answerContentTranslations.length ? answerContentTranslations[0] : null,
                        archived_by: getUserById(users, answer.archived_by_id),
                        internal_by: getUserById(users, answer.internal_by_id),
                        published_by: getUserById(users, answer.published_by_id)
                    });
                }


            }
            res.status(404).send();
            return;
        } catch (error) {
            console.error(error)
            res.status(400).send();
            return;
        }
    }

    res.status(404).send();
});