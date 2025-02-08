import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as argon2 from 'argon2';
import { ObjectId } from 'mongodb';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { password, ...rest } = createUserDto;

    const hashedPassword = await argon2.hash(password);

    return this.userModel.create(
      {
        password: hashedPassword,
        ...rest,
      }
    )
  }

  async findAllExceptCurrent(currentUserId: string): Promise<User[] | null> {
    //returns all users aside the one that is currently logged in
    return this.userModel.find({
      _id: { $ne: new ObjectId(currentUserId) },
    }).select('-password');
  }

  async findOne({
    id,
    email,
    stripPassword
  }: {
    id?: string;
    email?: string;
    stripPassword? : boolean
  }): Promise<UserDocument | null> {

    if(stripPassword){

      return await this.userModel
      .findOne({
        $or: [{ email }, { _id: id }],
      }).select('-password');

    }
    return await this.userModel
      .findOne({
        $or: [{ email }, { _id: id }],
      });
  }

  async update(id : string , profilePic : string) : Promise<UserDocument | null> {
   

    return this.userModel.findByIdAndUpdate(
      id,
      {
        profilePic,
      },
      {
        returnDocument: 'after',
      },
    ).select('-password');
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
