const multer = require('multer');
const path = require("path");

const ICONS_PATH = path.join(path.resolve(".") + "/icons");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ICONS_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});


const Loki = require('lokijs');

export const upload = multer({storage: storage, fileFilter: function (req, file, cb) {

    var filetypes = /svg/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports svg files");
  }});
export const DB = new Loki(ICONS_PATH+"/database.json", { persistenceMethod: 'fs' });
export const LocalCache = {
    loadDatabase(coll_name): Promise<any> {
        return new Promise((resolve)=> {
            const _collection = DB.getCollection(coll_name) || DB.addCollection(coll_name);
            resolve(_collection);
        })
    },
    save() {

        DB.saveDatabase()
    },
    async find(coll_name, query: any): Promise<any[]> {
       return new Promise(async (resolve, reject)=> {
            DB.loadDatabase({}, async function(err, data) {
                
                const _collection = DB.getCollection(coll_name);
                try {
                    const result = await _collection.find(query);
                    resolve(result);
                } catch (error) {
                   reject(error); 
                }
                
            });
           
       });
    }
}

