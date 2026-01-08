@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(params: {
    providerId: string
    actorId?: string
    actorRole?: Role
    action: string
    entityType: string
    entityId: string
    metadata?: any
    ipAddress?: string
    userAgent?: string
  }) {
    return this.prisma.auditLog.create({
      data: params,
    })
  }
}
