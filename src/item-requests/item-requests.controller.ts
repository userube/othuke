// src/item-requests/item-requests.controller.ts
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
import { ItemRequestsService } from './item-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateItemRequestDto } from './dto/create-item-request.dto';
import { UpdateItemRequestDto } from './dto/update-item-request.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemRequestsController {
    constructor(
        private itemRequestsService: ItemRequestsService,
    ) {}

    // CUSTOMER

    @Post()
    @Roles(Role.CUSTOMER)
    create(@Req() req, @Body() dto: CreateItemRequestDto) {
        return this.itemRequestsService.create(
            req.user.userId,
            dto,
        );
    }

    @Patch(':id')
    @Roles(Role.CUSTOMER)
    update(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: UpdateItemRequestDto,
    ) {
        return this.itemRequestsService.update(
            id,
            req.user.userId,
            dto,
        );
    }

    @Get('my')
    @Roles(Role.CUSTOMER)
    getMine(@Req() req) {
        return this.itemRequestsService.getCustomerRequests(
            req.user.userId,
        );
    }

    // VENDOR

    @Get('open')
    @Roles(Role.VENDOR)
    getOpen() {
        return this.itemRequestsService.getOpenRequestsForVendors();
    }

    // SHARED

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.itemRequestsService.getById(id);
    }
}
