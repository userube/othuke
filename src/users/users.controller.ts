// src/users/users.controller.ts
import {
    Body,
    Controller,
    Get,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { mapUserResponse } from './responses/user.response';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('me')
    async getMe(@Req() req) {
        const user = await this.usersService.getMe(req.user.userId);
        return mapUserResponse(user);
    }

    @Patch('customer/profile')
    @Roles(Role.CUSTOMER)
    updateCustomerProfile(
        @Req() req,
        @Body() dto: UpdateCustomerProfileDto,
    ) {
        return this.usersService.updateCustomerProfile(
            req.user.userId,
            dto,
        );
    }

    @Patch('vendor/profile')
    @Roles(Role.VENDOR)
    updateVendorProfile(
        @Req() req,
        @Body() dto: UpdateVendorProfileDto,
    ) {
        return this.usersService.updateVendorProfile(
            req.user.userId,
            dto,
        );
    }

    @Get()
    @Roles(Role.ADMIN)
    async getAllUsers() {
        const users = await this.usersService.getAllUsers();
        return users.map(mapUserResponse);
    }
}
