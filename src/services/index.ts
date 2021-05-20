import { Request } from "express";
import { ApiHelper, API_HELPER } from "../api-helper";
import { ApiResponseParser } from "../lib";

export class Service {
    private db = null;
    private static _INSTANCE = null;
    constructor(db?) {
    }
    findAllKnowledgeBases(data) {
        return ApiResponseParser.getCurrentKnowledgeBase(data)
    }

    async init(request:Request): Promise<any> {
        const API_HELPER = new ApiHelper(request.headers.authorization);
        return new Promise((resolve, reject)=> {
            // API_HELPER.setAuthHeader(request.headers.authorization);
            
            API_HELPER.post("/knowledge_bases/init")
            .then((response)=> {
                if(response.status === 200) {
                    resolve(response.data);
                }else {
                    resolve([])
                }
            }).catch(()=> {
                reject(new Error("API call exception"))
            })
        });
    }

    async getAnswerDetails(knowledgeBaseId: Number, answerId: Number, request: Request): Promise<any> {
        const path = `knowledge_bases/${knowledgeBaseId}/answers/${answerId}?full=1&include_contents=1&_=${Date.now()}`;
        const API_HELPER = new ApiHelper(request.headers.authorization, {
            Cookie: '_zammad_session_a138cfd0f37=6eb8021d9b32406f3e0fb7e0020df705'
        });

        return new Promise((resolve, reject)=> {
            // API_HELPER.setAuthHeader(request.headers.authorization);
            API_HELPER.get(path)
            .then((response)=> {
                if(response.status === 200) {
                    resolve(response.data);
                }else {
                    resolve([])
                }
            })
            .catch((error)=> {
                console.error(error)
                reject(new Error("API call exception"))
            })
        })
    }

    public static instance(): Service {
        if(Service._INSTANCE === null) {
            Service._INSTANCE = new Service();
        }

        return Service._INSTANCE;
    }
};
