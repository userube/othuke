// src/bids/bids.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BidStatus, RequestStatus } from '@prisma/client';

@Injectable()
export class BidsService {
    constructor(private prisma: PrismaService) {}

    async createBid(
        vendorId: string,
        requestId: string,
        dto: any,
    ) {
        const request = await this.prisma.itemRequest.findUnique({
            where: { id: requestId },
        });

        if (!request)
            throw new NotFoundException('Request not found');

        if (request.status !== RequestStatus.OPEN)
            throw new BadRequestException(
                'Bidding closed for this request',
            );

        const existingBid = await this.prisma.bid.findFirst({
            where: { requestId, vendorId },
        });

        if (existingBid)
            throw new BadRequestException(
                'You have already bid on this request',
            );

        return this.prisma.bid.create({
            data: {
                requestId,
                vendorId,
                price: dto.price,
                availabilityDate: new Date(dto.availabilityDate),
                deliveryTimeline: dto.deliveryTimeline,
                specificationsMatch: dto.specificationsMatch,
                message: dto.message,
            },
        });
    }

    async updateBid(
        bidId: string,
        vendorId: string,
        dto: any,
    ) {
        const bid = await this.prisma.bid.findUnique({
            where: { id: bidId },
        });

        if (!bid) throw new NotFoundException('Bid not found');

        if (bid.vendorId !== vendorId)
            throw new ForbiddenException();

        if (bid.status !== BidStatus.PENDING)
            throw new BadRequestException(
                'Cannot update processed bid',
            );

        return this.prisma.bid.update({
            where: { id: bidId },
            data: dto,
        });
    }

    getBidsForRequest(requestId: string, customerId: string) {
        return this.prisma.bid.findMany({
            where: {
                requestId,
                request: {
                    customerId,
                },
            },
            include: {
                vendor: true,
            },
        });
    }

    getVendorBids(vendorId: string) {
        return this.prisma.bid.findMany({
            where: { vendorId },
            include: {
                request: true,
            },
        });
    }

    async rejectOtherBids(
        requestId: string,
        acceptedBidId: string,
    ) {
        await this.prisma.bid.updateMany({
            where: {
                requestId,
                id: { not: acceptedBidId },
            },
            data: { status: BidStatus.REJECTED },
        });
    }
}
