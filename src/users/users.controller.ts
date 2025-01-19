import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpException,
  HttpStatus,
  UseGuards,
  Req
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  CreateUserSchema,
} from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { ZodValidationPipe } from 'src/validation-pipe';
import errorHandler from 'src/error.handler';
import successHandler from 'src/success.handler';
import { ControllerReturnType } from 'src/global.types';
import { UserDocument } from './schemas/user.schema';
import { User } from './schemas/user.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserRequest } from 'src/main';
import uploadImage from 'src/upload.image';


export function stripPassword(user: User) {
  const { password, ...rest } = user;

  return rest;
}

export function resolveUser(user: User) {
  return stripPassword(user);
}

export function resolveUserDocument(user: UserDocument) {
  const document = user.toJSON();

  return stripPassword(document);
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user')
  async createUserController(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto,
  ): Promise<ControllerReturnType> {
    try {
      const user = await this.usersService.create(createUserDto);

      if (!user) {
        throw new HttpException(
          'failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return successHandler(
        'user successfully created',
        201,
        resolveUserDocument(user),
      );
    } catch (error) {
      return errorHandler(
        'error in create user controller',
        'failed to create user',
        error,
        this.createUserController,
      );
    }
  }


  @UseGuards(AuthGuard)
  @Get('all')
  async findAllExcept(@Req() request : UserRequest): Promise<ControllerReturnType> {
    try {
      const users = await this.usersService.findAllExceptCurrent(request.userId);

      if (users) {
        return successHandler(
          'users successfully fetched',
          200,
          users.map((user) => user),
        );
      }

      throw new NotFoundException('users not found');
    } catch (error) {
      return errorHandler(
        'error in findAllExcept user Controller',
        'failed to fetch users',
        error,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async findOne(
    @Req() request: UserRequest
  ): Promise<ControllerReturnType> {
    try {
      const user = await this.usersService.findOne({id : request.userId, stripPassword : true});

      if (!user) {
        throw new NotFoundException('user not found');
      }

      return successHandler(
        'user successfully fetched',
        200,
        user,
      );
    } catch (error) {
      return errorHandler(
        'error in findOne user controller',
        'failed to fetch user',
        error,
      );
    }
  }


  @UseGuards(AuthGuard)
  @Patch('user/update-profile')
  async update(
    @Req() request : UserRequest,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ): Promise<ControllerReturnType> {
    try {
      const {profilePic } = updateUserDto;

      const id = request.userId

      const imageUrl = await uploadImage(profilePic)

      const updatedUser = await this.usersService.update(
        id,
        imageUrl,
      );

      if (updatedUser) {
        return successHandler(
          'user successfully updated',
          200,
          resolveUser(updatedUser),
        );
      }
    } catch (error) {
      return errorHandler(
        'error in update user controller',
        'failed to update user',
        error,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
