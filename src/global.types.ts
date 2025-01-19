import successHandler from "./success.handler";
import errorHandler from "./error.handler";
import * as mongoose from 'mongoose';


export type ControllerReturnType = ReturnType<typeof successHandler> | ReturnType<typeof errorHandler>;

export type MongooseObjectId = mongoose.Types.ObjectId