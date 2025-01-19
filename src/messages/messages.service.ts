import { Injectable } from '@nestjs/common';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message,MessageDocument } from './schema/message.schema';
import { Message as MessageEntity } from './entities/message.entity';
import uploadImage from 'src/upload.image';
import { ImageUrlSchema } from './dto/create-message.dto';
import { MongooseObjectId } from 'src/global.types';

@Injectable()
export class MessagesService {

  constructor(@InjectModel(Message.name) private MessageModel : Model<Message>){}


  async create(createMessageDto: MessageEntity ) : Promise<MessageDocument | null> {

    try {

       const {image} = createMessageDto

       let imageUrl : string

       if(image){

         imageUrl = await uploadImage(image);

         //validate that imageUrl is valid URL

         ImageUrlSchema.parse(imageUrl);

         createMessageDto['image'] = imageUrl
         
       }
     
       return this.MessageModel.create({

       ...createMessageDto
        
     })
      
    } catch (error) {

       console.error('error in create Message service: ', error);
       throw error
      
    }
  }

  findAll({senderId, receiverId} : {senderId : MongooseObjectId, receiverId : MongooseObjectId}) : Promise<MessageDocument[] | null> {
    return this.MessageModel.find({
      $or : [
        {
          senderId, receiverId
        },
        {
          senderId : receiverId,
          receiverId : senderId
        }
      ]
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
