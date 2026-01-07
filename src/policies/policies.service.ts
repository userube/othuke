import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';

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

  // policies.service.ts
  async findAllNew(params: {
    page?: number
    limit?: number
    status?: string
    type?: string
    holderName?: string
  }) {
    const { page = 1, limit = 10, status, type, holderName } = params

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type
    if (holderName) where.holderName = { contains: holderName, mode: 'insensitive' }

    const [policies, total] = await Promise.all([
      this.prisma.client.policy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.policy.count({ where }),
    ])

    return { policies, total, page, limit }
  }


  async findOne(id: string) {
    return this.prisma.client.policy.findUnique({
      where: { id },
      include: { claims: true },
    })
  }

   async createBulkFromCSV(providerId: string, filePath: string) {
       const policies: any[] = [];

       // Step 1: Parse CSV
       await new Promise<void>((resolve, reject) => {
         fs.createReadStream(filePath)
           .pipe(csvParser())
           .on('data', (row) => {
             // Transform fields as needed
             policies.push({
               policyNo: row.policyNo,
               holderName: row.holderName,
               type: row.type,
               premium: parseInt(row.premium, 10) || 0,
               status: row.status || 'ACTIVE',
               startDate: row.startDate ? new Date(row.startDate) : new Date(),
               endDate: row.endDate ? new Date(row.endDate) : new Date(),
             });
           })
           .on('end', () => resolve())
           .on('error', (err) => reject(err));
       });

       // Step 2: Deduplicate by policyNo within the CSV
       const uniquePolicies = Array.from(
         new Map(policies.map(p => [p.policyNo, p])).values()
       );

       // Step 3: Add providerId and insert into DB, skip duplicates
       const result = await this.prisma.policy.createMany({
         data: uniquePolicies.map(p => ({ ...p, providerId })),
         skipDuplicates: true, // prevents duplicate policyNo in DB
       });

       return {
         inserted: result.count,
         total: uniquePolicies.length,
       };
     }

   async createBulkClaimsFromProvider(providerId: string, claims: any[]) {
     // Map providerId via policies
     const validClaims = [];

     for (const claim of claims) {
       const policy = await this.prisma.policy.findUnique({
         where: { policyNo: claim.policyNo },
       });
       if (policy) validClaims.push({ ...claim, policyId: policy.id });
     }

     return this.prisma.claim.createMany({
       data: validClaims,
       skipDuplicates: true,
     });
   }

   async createProvider(name: string, sourceType: 'API' | 'CSV') {
       const apiKey = randomBytes(16).toString('hex');
       return this.prisma.provider.create({
         data: { name, sourceType, apiKey },
       });
     }

}
