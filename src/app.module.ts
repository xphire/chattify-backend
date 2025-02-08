import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketsModule } from './sockets/sockets.module';
import { MessagesModule } from './messages/messages.module';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';






@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({isGlobal : true}), MongooseModule.forRoot(process.env['MONGO_URI'] || ''), MessagesModule, SocketsModule, JwtModule.register({
    signOptions : {
      expiresIn : '15m',
    },
    global : true
  })],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
