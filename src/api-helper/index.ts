import axios from "axios";
import { Constants } from "../config/Constants";

export class ApiHelper {
    private API: any;
    constructor(authkey?:string, headers?: object) {
        this.API = axios.create({
            baseURL: Constants.API_BASE_URL,
            headers:  { 
                authorization: authkey,
                ...headers
            }
        });
        
        
    }

    setAuthHeader(bearerToken){
        if(!bearerToken) { throw new Error("Token can not be null")}
        this.API = axios.create({
            baseURL: Constants.API_BASE_URL,
            headers:  { 
                authorization: bearerToken 
            }
        })
    }

    async get(path, params?:any):  Promise<any> {
        return this.API.get(path, {params})
    }

    async post(path, params?:any): Promise<any> {
        return this.API.post(path, params);
    }
};

export const API_HELPER = new ApiHelper()