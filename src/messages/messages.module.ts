import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { UsersModule } from 'src/users/users.module';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports : [UsersModule,MongooseModule.forFeature([{name : Message.name,schema : MessageSchema}])],
  controllers: [MessagesController],
  providers: [MessagesService, AppGateway],
})
export class MessagesModule {}
