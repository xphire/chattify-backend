import { MongooseObjectId } from "src/global.types";

export class Message {
    senderId : MongooseObjectId;
    receiverId : MongooseObjectId;
    text?: string;
    image? : string;
}
