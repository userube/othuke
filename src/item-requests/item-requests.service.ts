// src/item-requests/item-requests.service.ts
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class ItemRequestsService {
    constructor(
        private prisma: PrismaService,
        private categoriesService: CategoriesService,
    ) {}

    async create(customerId: string, dto: any) {
        // Validate dynamic fields
        await this.categoriesService.validateCustomFields(
            dto.categoryId,
            dto.customFieldValues,
        );

        return this.prisma.itemRequest.create({
            data: {
                customerId,
                categoryId: dto.categoryId,
                title: dto.title,
                description: dto.description,
                images: dto.images,
                customFieldValues: dto.customFieldValues,
            },
        });
    }

    async update(
        requestId: string,
        customerId: string,
        dto: any,
    ) {
        const request = await this.prisma.itemRequest.findUnique({
            where: { id: requestId },
        });

        if (!request)
            throw new NotFoundException('Request not found');

        if (request.customerId !== customerId)
            throw new ForbiddenException();

        if (request.status !== RequestStatus.OPEN)
            throw new ForbiddenException(
                'Cannot modify closed request',
            );

        if (dto.customFieldValues) {
            await this.categoriesService.validateCustomFields(
                request.categoryId,
                dto.customFieldValues,
            );
        }

        return this.prisma.itemRequest.update({
            where: { id: requestId },
            data: dto,
        });
    }

    getCustomerRequests(customerId: string) {
        return this.prisma.itemRequest.findMany({
            where: { customerId },
            include: {
                category: true,
                bids: true,
            },
        });
    }

    getOpenRequestsForVendors() {
        return this.prisma.itemRequest.findMany({
            where: { status: RequestStatus.OPEN },
            include: {
                category: true,
            },
        });
    }

    getById(id: string) {
        return this.prisma.itemRequest.findUnique({
            where: { id },
            include: {
                category: {
                    include: { fields: true },
                },
                bids: true,
            },
        });
    }

    closeRequest(id: string) {
        return this.prisma.itemRequest.update({
            where: { id },
            data: { status: RequestStatus.CLOSED },
        });
    }
}
