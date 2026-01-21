// src/orders/orders.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BidsService } from '../bids/bids.service';
import { BidStatus, OrderStatus, RequestStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private bidsService: BidsService,
    ) {}

    async compareBids(requestId: string, customerId: string) {
        const bids = await this.prisma.bid.findMany({
            where: {
                requestId,
                request: { customerId },
                status: BidStatus.PENDING,
            },
            include: { vendor: true },
        });

        return bids
            .map((bid) => ({
                ...bid,
                score: this.calculateScore(bid),
            }))
            .sort((a, b) => a.score - b.score);
    }

    private calculateScore(bid: any) {
        const priceWeight = 0.5;
        const deliveryWeight = 0.3;
        const ratingWeight = 0.2;

        return (
            priceWeight * bid.price +
            deliveryWeight *
            new Date(bid.availabilityDate).getTime() -
            ratingWeight * (bid.vendor.rating || 0)
        );
    }

    async selectBid(
        bidId: string,
        customerId: string,
    ) {
        const bid = await this.prisma.bid.findUnique({
            where: { id: bidId },
            include: { request: true },
        });

        if (!bid) throw new NotFoundException('Bid not found');

        if (bid.request.customerId !== customerId)
            throw new ForbiddenException();

        if (bid.request.status !== RequestStatus.OPEN)
            throw new BadRequestException(
                'Request already processed',
            );

        // Create order
        const order = await this.prisma.order.create({
            data: {
                requestId: bid.requestId,
                bidId: bid.id,
                customerId,
                vendorId: bid.vendorId,
                amount: bid.price,
                status: OrderStatus.REQUESTED,
            },
        });

        // Update bid + request
        await this.prisma.bid.update({
            where: { id: bid.id },
            data: { status: BidStatus.ACCEPTED },
        });

        await this.bidsService.rejectOtherBids(
            bid.requestId,
            bid.id,
        );

        await this.prisma.itemRequest.update({
            where: { id: bid.requestId },
            data: { status: RequestStatus.ORDERED },
        });

        return order;
    }

    getCustomerOrders(customerId: string) {
        return this.prisma.order.findMany({
            where: { customerId },
            include: {
                bid: true,
                shipment: true,
            },
        });
    }

    getVendorOrders(vendorId: string) {
        return this.prisma.order.findMany({
            where: { vendorId },
            include: {
                bid: true,
                shipment: true,
            },
        });
    }

    async updateOrderStatus(
        orderId: string,
        userId: string,
        role: string,
        status: OrderStatus,
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) throw new NotFoundException();

        if (
            role === 'CUSTOMER' &&
            order.customerId !== userId
        )
            throw new ForbiddenException();

        if (
            role === 'VENDOR' &&
            order.vendorId !== userId
        )
            throw new ForbiddenException();

        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
    }

    
}
