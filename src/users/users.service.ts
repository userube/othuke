// src/users/users.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    getMe(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                customerProfile: true,
                vendorProfile: true,
            },
        });
    }

    updateCustomerProfile(userId: string, data: any) {
        return this.prisma.customerProfile.update({
            where: { userId },
            data,
        });
    }

    updateVendorProfile(userId: string, data: any) {
        return this.prisma.vendorProfile.update({
            where: { userId },
            data,
        });
    }

    getAllUsers() {
        return this.prisma.user.findMany({
            include: {
                customerProfile: true,
                vendorProfile: true,
            },
        });
    }

    toggleUserStatus(userId: string, isActive: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
    }
}
