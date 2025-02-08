import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  userSocketMap: Record<string, string> = {};
  clients : Socket[] = []

  @WebSocketServer()
  server: Server;
  

  handleConnection(client: Socket, ...args: any[]) {
    //console.log(`client with id ${client.id} connected`)

    const userId = client.handshake.query.userId;
    //const name = client.handshake.query.name as unknown as string


    //const date = new Date()


    //console.log(`time : ${date.toUTCString()} :::::: user ${name.toUpperCase()} connected`)

    if (userId) {

      this.clients.push(client)

      this.userSocketMap[userId as string] = client.id;

      //now rebroadcast the socketmap to list all available users to all connected clients

      this.server.emit('getOnlineUsers', Object.keys(this.userSocketMap));

      
    }
  }

  handleDisconnect(client: Socket) {
    //console.log(`client with id ${client.id} disconnected`)

    const userId = client.handshake.query.userId;

    const clientId = client.id

    //const name = client.handshake.query.name as unknown as string

    //const date = new Date()

    //console.log(`time : ${date.toUTCString()} :::::: user ${name.toUpperCase()} disconnected`)

    if (userId && Object.keys(this.userSocketMap).includes(userId as string) ) {

      delete this.userSocketMap[userId as string];

      this.clients = [...this.clients.filter(client => client.id !== clientId )]

      this.server.emit('getOnlineUsers', Object.keys(this.userSocketMap));

    }
  }

  @SubscribeMessage('newMessage')
  handleMessage(target: string, message: any): void {

    // const client = this.clients.find(client => client.id === target)

    // if(client){
    //    client.broadcast.emit('newMessage',message)
    // }

    this.server.to(target).emit('newMessage', message)
    
  }
}
