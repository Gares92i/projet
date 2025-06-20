import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string[]>(); // userId -> socketId[]

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);

    // Supprimer le socketId des utilisateurs
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const updatedSocketIds = socketIds.filter((id) => id !== client.id);
      if (updatedSocketIds.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, updatedSocketIds);
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.logger.log(`Utilisateur enregistré: ${userId} avec socket ${client.id}`);

    const socketIds = this.userSockets.get(userId) || [];
    socketIds.push(client.id);
    this.userSockets.set(userId, socketIds);

    return { status: 'ok' };
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
      return true;
    }
    return false;
  }

  sendNotificationToAll(notification: any) {
    this.server.emit('notification', notification);
    return true;
  }
}
