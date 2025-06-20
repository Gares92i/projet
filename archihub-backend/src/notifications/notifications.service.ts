import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  async sendNotification(userId: string, notification: any) {
    try {
      const result = this.notificationsGateway.sendNotificationToUser(userId, notification);
      if (!result) {
        this.logger.warn(`Utilisateur ${userId} non connecté, notification non envoyée`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendNotificationToAll(notification: any) {
    try {
      return this.notificationsGateway.sendNotificationToAll(notification);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de la notification à tous: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
