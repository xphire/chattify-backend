import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getSecret(secretName: string) {
    return { secret: this.configService.get(secretName) };
  }

  async verifyToken(token: string, secretName : string): Promise<{ sub: string }> {
    return await this.jwtService.verifyAsync(
      token,
      this.getSecret(secretName),
    );
  }

  tokenize(payload: Record<string, any>, secretName : string) {
    return this.jwtService.sign(payload, this.getSecret(secretName));
  }

  setCookie(response : Response, cookieName : string , cookieValue : string , cookieOptions : CookieOptions){

    return response.cookie(cookieName,cookieValue, cookieOptions)

  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
