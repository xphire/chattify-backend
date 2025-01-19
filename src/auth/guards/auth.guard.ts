import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { ConfigService } from '@nestjs/config';
  import { UsersService } from 'src/users/users.service';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usersService : UsersService,
        private readonly configService: ConfigService
    ){}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload : {sub : string} = await this.jwtService.verifyAsync(
            token, {
                secret : this.configService.get('JWT_SECRET_KEY')
            }
        )
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers


        const userId = payload.sub
        

        const user = await this.usersService.findOne({id : userId})

        if(!user) throw new UnauthorizedException();

        request['userId'] = userId;
        
      } catch {
        throw new UnauthorizedException();
      }

      return true
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      //const [type, token] = request.headers.authorization?.split(' ') ?? [];
      const {auth_token} = request.cookies
      return auth_token
    }
  }
  