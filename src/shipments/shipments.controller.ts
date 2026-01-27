// src/shipments/shipments.controller.ts
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UpdateShipmentDto } from './dto/update-shipment-dto';

@Controller('shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentsController {
    constructor(
        private shipmentsService: ShipmentsService,
    ) {}

    @Post(':orderId')
    @Roles(Role.VENDOR)
    create(@Req() req, @Param('orderId') id: string) {
        return this.shipmentsService.createShipment(
            id,
            req.user.userId,
        );
    }

    @Patch(':shipmentId')
    @Roles(Role.VENDOR)
    update(
        @Req() req,
        @Param('shipmentId') id: string,
        @Body() dto: UpdateShipmentDto,
    ) {
        return this.shipmentsService.updateShipment(
            id,
            req.user.userId,
            dto,
        );
    }

    @Post('confirm/:shipmentId')
    @Roles(Role.CUSTOMER)
    confirm(
        @Req() req,
        @Param('shipmentId') id: string,
    ) {
        return this.shipmentsService.confirmDelivery(
            id,
            req.user.userId,
        );
    }

    @Get('order/:orderId')
    get(@Param('orderId') id: string) {
        return this.shipmentsService.getShipment(id);
    }
}
