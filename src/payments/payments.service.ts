import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, OrderStatus, EscrowStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { MockPaymentProvider } from './providers/mock.provider';

@Injectable()
export class PaymentsService {
    private provider = new MockPaymentProvider();

    constructor(private prisma: PrismaService) {}

    async initiatePayment(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) throw new NotFoundException();
        if (order.customerId !== userId)
            throw new BadRequestException();
        if (order.status !== OrderStatus.REQUESTED)
            throw new BadRequestException(
                'Order not payable',
            );

        const reference = uuid();

        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                amount: order.amount,
                provider: 'MOCK',
                reference,
                status: PaymentStatus.INITIATED,
            },
        });

        const response =
            await this.provider.initializePayment(
                order.amount,
                'customer@email.com',
                reference,
            );

        return {
            paymentUrl: response.paymentUrl,
            reference,
        };
    }

    async verifyPayment(reference: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { reference },
        });

        if (!payment)
            throw new NotFoundException(
                'Payment not found',
            );

        const result =
            await this.provider.verifyPayment(reference);

        if (!result.success) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.FAILED },
            });

            throw new BadRequestException(
                'Payment failed',
            );
        }

        // Update payment
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.SUCCESS },
        });

        // Create escrow
        await this.prisma.escrow.create({
            data: {
                paymentId: payment.id,
                amount: payment.amount,
                status: EscrowStatus.HOLDING,
            },
        });

        // Update order
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { status: OrderStatus.PAID },
        });

        return { success: true };
    }

    async releaseEscrow(orderId: string) {
        const payment =
            await this.prisma.payment.findFirst({
                where: { orderId },
                include: { escrow: true },
            });

        if (!payment || !payment.escrow)
            throw new NotFoundException();

        if (payment.escrow.status !== EscrowStatus.HOLDING)
            throw new BadRequestException();

        await this.prisma.escrow.update({
            where: { id: payment.escrow.id },
            data: {
                status: EscrowStatus.RELEASED,
                releasedAt: new Date(),
            },
        });

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.COMPLETED },
        });

        return { released: true };
    }
}
