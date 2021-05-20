import app from './Server';

import http from 'http';
import { Constants } from './config/Constants';

const SERVER = http.createServer(app);


/**
 * Create dabase connection and initialize the Application
 */
 SERVER.listen(Constants.PORT, ()=> {
    console.log(`Application Running at port ${Constants.PORT}`)
});


