import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  CreateMessageDto,
  CreateMessageSchema,
} from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UserRequest } from 'src/main';
import { UsersService } from 'src/users/users.service';
import { ControllerReturnType } from 'src/global.types';
import errorHandler from 'src/error.handler';
import { ZodValidationPipe } from 'src/validation-pipe';
import * as mongoose from 'mongoose';
import successHandler from 'src/success.handler';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AppGateway } from 'src/app.gateway';

@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly appGateway: AppGateway,
  ) {}

  private async checkReceiver(id: string) {
    try {
      const receiver = await this.usersService.findOne({ id });

      if (!receiver) {
        throw new BadRequestException('invalid message recipient');
      }

      return receiver;
    } catch (error) {
      console.error(
        'error in checkReceiver function(message controller): ',
        error,
      );
      throw error;
    }
  }

  @Post('send/:id')
  async create(
    @Req() request: UserRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateMessageSchema))
    createMessageDto: CreateMessageDto,
  ): Promise<ControllerReturnType> {
    try {
      const receiverId = id;
      const senderId = request.userId;

      //check if receiver is a valid user

      await this.checkReceiver(receiverId);

      //store message here

      const message = await this.messagesService.create({
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        ...createMessageDto,
      });

      if (message) {
        const messageJson = message.toJSON();

        //socket io implementation

        //get target socket.io Id

        const targetSocket = this.appGateway.userSocketMap[receiverId];

        // console.log('target Socket', targetSocket)

        if (targetSocket) {
          this.appGateway.handleMessage(targetSocket, messageJson);
        }

        return successHandler('message successfully sent', 201, messageJson);
      }
    } catch (error) {
      return errorHandler(
        'error in create message controller',
        'failed to send message',
        error,
      );
    }
  }

  @Get('all/:id')
  async findAll(
    @Req() request: UserRequest,
    @Param('id') id: string,
  ): Promise<ControllerReturnType> {
    //return all the messages of the person you are texting
    //return this.messagesService.findAll();
    try {
      //check if receiver is valid

      await this.checkReceiver(id);

      const messages = await this.messagesService.findAll({
        senderId: new mongoose.Types.ObjectId(request.userId),
        receiverId: new mongoose.Types.ObjectId(id),
      });

      if (!messages) throw new NotFoundException('failed to retrieve messages');

      return successHandler(
        'messages successfully retrieved',
        200,
        messages.map((message) => message.toJSON()),
      );
    } catch (error) {
      return errorHandler(
        'error in findAll messages controller',
        'failed to retrieve messages',
        error,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }
}
