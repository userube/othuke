// src/orders/orders.controller.ts
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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private ordersService: OrdersService) {}

    @Get('compare/:requestId')
    @Roles(Role.CUSTOMER)
    compare(@Req() req, @Param('requestId') id: string) {
        return this.ordersService.compareBids(
            id,
            req.user.userId,
        );
    }

    @Post('select/:bidId')
    @Roles(Role.CUSTOMER)
    selectBid(@Req() req, @Param('bidId') bidId: string) {
        return this.ordersService.selectBid(
            bidId,
            req.user.userId,
        );
    }

    @Get('customer/my')
    @Roles(Role.CUSTOMER)
    myCustomerOrders(@Req() req) {
        return this.ordersService.getCustomerOrders(
            req.user.userId,
        );
    }

    @Get('vendor/my')
    @Roles(Role.VENDOR)
    myVendorOrders(@Req() req) {
        return this.ordersService.getVendorOrders(
            req.user.userId,
        );
    }

    @Patch(':id/status')
    updateStatus(
        @Req() req,
        @Param('id') id: string,
        @Body('status') status: OrderStatus,
    ) {
        return this.ordersService.updateOrderStatus(
            id,
            req.user.userId,
            req.user.role,
            status,
        );
    }
}
