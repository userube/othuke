// src/notifications/notifications.controller.ts
import {
    Controller,
    Get,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(
        private notificationsService: NotificationsService,
    ) {}

    @Get()
    getMy(@Req() req) {
        return this.notificationsService.getUserNotifications(
            req.user.userId,
        );
    }

    @Patch(':id/read')
    read(@Req() req, @Param('id') id: string) {
        return this.notificationsService.markRead(
            id,
            req.user.userId,
        );
    }
}
