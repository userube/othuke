// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {}

    notify(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
    ) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
            },
        });
    }

    getUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    markRead(id: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    }
}
