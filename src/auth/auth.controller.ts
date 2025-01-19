import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { ZodValidationPipe } from 'src/validation-pipe';
import { loginSchema } from './dto/create-auth.dto';
import * as argon2 from 'argon2';
import { Response} from 'express';
import errorHandler from 'src/error.handler';
import successHandler from 'src/success.handler';
import { ControllerReturnType } from 'src/global.types';
import { AuthGuard } from './guards/auth.guard';
import { UserRequest } from 'src/main';
import { resolveUserDocument } from 'src/users/users.controller';

@Controller('auth')
export class AuthController {

  private GeneralErrorMessage : string
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
     this.GeneralErrorMessage = 'invalid credentials'
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ControllerReturnType> {
    //set passthrough to leave response handling logic to the framework
    try {
      const { email, password } = createAuthDto;

      //fetch user with email

      const user = await this.usersService.findOne({ email });

      //if user doesn't exist throw 401

      if (!user) throw new UnauthorizedException(this.GeneralErrorMessage);

      //compare user supplied password with hashed password

      const { password: dbPassword } = user;

      const confirmPassword = await argon2.verify(dbPassword, password);

      //if it does not match throw 401

      if (!confirmPassword) throw new UnauthorizedException(this.GeneralErrorMessage);

      //sign token with user id

      const payloadToSign = {
        sub: user._id,
      };

      const token = this.authService.tokenize(payloadToSign, 'JWT_SECRET_KEY') ;

      //set token in request cookies

      this.authService.setCookie(response,'auth_token',token,{

        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production'

      })

      //send back user details

      return successHandler('login successful', 201, resolveUserDocument(user));
    } catch (error) {
      return errorHandler('error in login controller', 'login failed', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logOut(
    @Res({ passthrough: true }) response: Response,
  ): Promise<ControllerReturnType> {
    try {
    
      this.authService.setCookie(response,'auth_token','', {maxAge : 0})

      return successHandler('logout successful', 201);
    } catch (error) {
      return errorHandler('error in logout controller', 'logout failed', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('check-auth')
  async checkAuth(
    @Req() request: UserRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ControllerReturnType> {
    //checks if user is still authenticated
    try {
      const {auth_token} = request.cookies;

      const payload = await this.authService.verifyToken(auth_token, 'JWT_SECRET_KEY')

      const idFromCookie = payload.sub;

      const idFromRequest = request.userId;

      if (idFromCookie !== idFromRequest) {
        //invalid token-user pair
        this.authService.setCookie(response,'auth_token','', {maxAge : 0})
        throw new UnauthorizedException('unauthorized');
      }

      const user = await this.usersService.findOne({
        id : idFromRequest
      });


      if(!user){
        throw new UnauthorizedException(this.GeneralErrorMessage)
      }

      return successHandler('user is logged in', 200,resolveUserDocument(user));
    } catch (error) {
      return errorHandler(
        'error in checkAuth controller',
        'auth check failed',
        error,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
