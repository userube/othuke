import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PoliciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      holderName?: string;
    }) {
      const { page = 1, limit = 10, status, type, holderName } = params;

      const where: any = {};

      if (status) where.status = status;
      if (type) where.type = type;
      if (holderName) where.holderName = { contains: holderName, mode: 'insensitive' };

      const policies = await this.prisma.client.policy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.client.policy.count({ where });

      return { policies, total, page, limit };
  }

  findOne(id: string) {
    return this.prisma.client.policy.findUnique({
      where: { id },
      include: { claims: true },
    })
  }
}
