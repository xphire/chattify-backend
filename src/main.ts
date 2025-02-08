import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';


export interface UserRequest extends Request {
  userId : string,
  cookies : {
    auth_token : string
  }
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const prefix = '/api/1.0'
  app.use(cookieParser());
  app.setGlobalPrefix(prefix);
  app.use(json({limit : '50mb'}))

  app.enableCors({
    origin : ['http://localhost:5173'],
    credentials : true
  })

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();

