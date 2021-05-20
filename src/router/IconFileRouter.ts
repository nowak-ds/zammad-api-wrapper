import { Request, Response, Router } from "express";
import { LocalCache, upload } from "../file-upload";

export const IconFileRouter = Router();

const isValidFile = (file) => {
    if(file) {
        const tokens = file.split(".");
        return tokens[tokens.length-1] === "svg";
    }

    return false;
    
}

IconFileRouter.get("/", async (req:Request, response: Response) => {
    try {
        const id = await LocalCache.find("icons",{filename: "mehedi_sign.jpg"});
        response.json(id);
    } catch (error) {
        response.status(400).send();
    }
    
});

IconFileRouter.get("/:filename", async (req:Request, response: Response) => {
    const filename: string = req.params.filename;
    // if(!isValidFile(filename)) {
    //     response.status(400).send();
    //     return;
    // }
    try {
        console.log("Filename", filename);
        const query: any[] = await LocalCache.find("icons",{filename: filename});
        console.log("Query", query);

        if(query && query.length > 0) {
            response.sendFile(query[0].path);
            return;
        }
        
    } catch (error) {
        response.status(400).send();
        return;
    }
    response.status(404).send({message: "Invalid file"});
});


IconFileRouter.post("/", upload.single("icon"), async (req:any, response: Response) => {
    const ICONS:any = await LocalCache.loadDatabase("icons");
    ICONS.insert(req.file);
    const filename = req.file ? req.file.originalname: "";
    if(filename) {
        LocalCache.save();
        response.json({message: "File stored into configured directory", path: `${process.env.SERVER_ROOT}/icons/${filename}`});
    }else {
        response.status(400).json({message: "Could not upload the file"});
    }
   
});