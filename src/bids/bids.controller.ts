// src/bids/bids.controller.ts
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
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
    constructor(private bidsService: BidsService) {}

    // VENDOR

    @Post(':requestId')
    @Roles(Role.VENDOR)
    createBid(
        @Req() req,
        @Param('requestId') requestId: string,
        @Body() dto: CreateBidDto,
    ) {
        return this.bidsService.createBid(
            req.user.userId,
            requestId,
            dto,
        );
    }

    @Patch(':bidId')
    @Roles(Role.VENDOR)
    updateBid(
        @Req() req,
        @Param('bidId') bidId: string,
        @Body() dto: UpdateBidDto,
    ) {
        return this.bidsService.updateBid(
            bidId,
            req.user.userId,
            dto,
        );
    }

    @Get('vendor/my')
    @Roles(Role.VENDOR)
    myBids(@Req() req) {
        return this.bidsService.getVendorBids(
            req.user.userId,
        );
    }

    // CUSTOMER

    @Get('request/:requestId')
    @Roles(Role.CUSTOMER)
    getBidsForRequest(
        @Req() req,
        @Param('requestId') requestId: string,
    ) {
        return this.bidsService.getBidsForRequest(
            requestId,
            req.user.userId,
        );
    }
}
