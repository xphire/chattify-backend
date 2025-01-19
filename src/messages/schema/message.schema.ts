import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Message as MessageEntity } from '../entities/message.entity';
import { User } from 'src/users/schemas/user.schema';


export type MessageDocument =  mongoose.HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message implements MessageEntity {
  @Prop({ required: true, ref : User.name }) //ref can also be name of other model directly as a string 'User' in this case
  senderId: mongoose.Types.ObjectId;
  @Prop({ required: true, ref : User.name })
  receiverId: mongoose.Types.ObjectId;
  @Prop()
  text: string;
  @Prop()
  image: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
