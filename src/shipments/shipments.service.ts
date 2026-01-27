// src/shipments/shipments.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    OrderStatus,
    ShipmentStatus,
} from '@prisma/client';

@Injectable()
export class ShipmentsService {
    constructor(private prisma: PrismaService) {}

    async createShipment(orderId: string, vendorId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) throw new NotFoundException();

        if (order.vendorId !== vendorId)
            throw new ForbiddenException();

        if (order.status !== OrderStatus.PAID)
            throw new BadRequestException(
                'Order not ready for shipment',
            );

        return this.prisma.shipment.create({
            data: {
                orderId,
                vendorId,
            },
        });
    }

    async updateShipment(
        shipmentId: string,
        vendorId: string,
        dto: any,
    ) {
        const shipment =
            await this.prisma.shipment.findUnique({
                where: { id: shipmentId },
            });

        if (!shipment)
            throw new NotFoundException();

        if (shipment.vendorId !== vendorId)
            throw new ForbiddenException();

        if (
            dto.status === ShipmentStatus.SHIPPED &&
            !dto.trackingCode
        )
            throw new BadRequestException(
                'Tracking code required',
            );

        return this.prisma.shipment.update({
            where: { id: shipmentId },
            data: {
                ...dto,
                shippedAt:
                    dto.status === ShipmentStatus.SHIPPED
                        ? new Date()
                        : undefined,
                deliveredAt:
                    dto.status === ShipmentStatus.DELIVERED
                        ? new Date()
                        : undefined,
            },
        });
    }

    async confirmDelivery(
        shipmentId: string,
        customerId: string,
    ) {
        const shipment =
            await this.prisma.shipment.findUnique({
                where: { id: shipmentId },
                include: { order: true },
            });

        if (!shipment)
            throw new NotFoundException();

        if (shipment.order.customerId !== customerId)
            throw new ForbiddenException();

        if (
            shipment.status !== ShipmentStatus.DELIVERED
        )
            throw new BadRequestException(
                'Order not delivered yet',
            );

        await this.prisma.shipment.update({
            where: { id: shipmentId },
            data: { status: ShipmentStatus.CONFIRMED },
        });

        return { confirmed: true };
    }

    getShipment(orderId: string) {
        return this.prisma.shipment.findUnique({
            where: { orderId },
        });
    }
}
