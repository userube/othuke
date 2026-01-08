// providers/providers.service.ts
import { v4 as uuid } from 'uuid'
import { addDays } from 'date-fns'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProviderService {
    constructor(private prisma: ProviderService) {}

    async createInvite(providerId: string, email: string, role: Role) {
        return this.prisma.invite.create({
            data: {
              providerId,
              email,
              role,
              token: uuid(),
              expiresAt: addDays(new Date(), 7),
            },
        })
    }
 }
