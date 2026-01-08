import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import * as csv from 'csv-parse'
import { Readable } from 'stream'

export interface CreateClaimDto {
  policyId: string
  type: string
  amount: number
  status: string
}

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    policyId?: string
    status?: string
    type?: string
  }) {
    const where: any = {}

    if (params.policyId) where.policyId = params.policyId
    if (params.status) where.status = params.status
    if (params.type) where.type = params.type

    return this.prisma.client.claim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    return this.prisma.client.claim.findUnique({ where: { id } })
  }

  async createBulkFromCSV(fileBuffer: Buffer) {
    const records: CreateClaimDto[] = []

    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    const stream = Readable.from(fileBuffer)
    const parsed = stream.pipe(parser)

    for await (const row of parsed) {
      records.push({
        policyId: row.policyId,
        type: row.type,
        amount: parseInt(row.amount, 10),
        status: row.status,
      })
    }

    // Insert in bulk, skip duplicates if you want
    return this.prisma.client.claim.createMany({
      data: records,
      skipDuplicates: true,
    })
  }

  async submitClaim(
    providerId: string,
    userId: string,
    dto: CreateClaimDto,
  ) {
    return this.prisma.claim.create({
      data: {
        providerId,
        policyId: dto.policyId,
        amount: dto.amount,
        description: dto.description,
        submittedById: userId,
      },
    })
  }

  async findAll(providerId: string, status?: ClaimStatus) {
    return this.prisma.claim.findMany({
      where: {
        providerId,
        ...(status && { status }),
      },
      include: {
        policy: true,
        submittedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markUnderReview(providerId: string, userId: string, claimId: string) {
    return this.prisma.claim.update({
      where: { id: claimId, providerId },
      data: {
        status: ClaimStatus.UNDER_REVIEW,
        reviewedById: userId,
      },
    })
  }

  async approve(providerId: string, claimId: string) {
    return this.prisma.claim.update({
      where: { id: claimId, providerId },
      data: { status: ClaimStatus.APPROVED },
    })
  }

  async reject(providerId: string, claimId: string, reason?: string) {
    return this.prisma.claim.update({
      where: { id: claimId, providerId },
      data: {
        status: ClaimStatus.REJECTED,
        description: reason,
      },
    })
  }



}
