import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.providerUser.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      throw new UnauthorizedException()
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new UnauthorizedException()
    }

    const payload = {
      sub: user.id,
      providerId: user.providerId,
      role: user.role,
    }

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        providerId: user.providerId,
        role: user.role,
      },
    }
  }

    async signup(dto: SignupDto) {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      if (exists) {
        throw new ConflictException('Email already in use')
      }

      const passwordHash = await bcrypt.hash(dto.password, 10)

      const provider = await this.prisma.provider.create({
        data: {
          name: dto.companyName,
          email: dto.email,
          users: {
            create: {
              email: dto.email,
              password: passwordHash,
              role: Role.ADMIN,
            },
          },
        },
        include: { users: true },
      })

      const admin = provider.users[0]

      return {
        user: this.sanitizeUser(admin),
        token: this.signToken(admin),
      }
    }

    private signToken(user: any) {
      return this.jwt.sign({
        sub: user.id,
        role: user.role,
        providerId: user.providerId,
      })
    }

    private sanitizeUser(user: any) {
      const { password, ...rest } = user
      return rest
    }

    async acceptInvite(token: string, dto: AcceptInviteDto) {
      const invite = await this.prisma.invite.findUnique({
        where: { token },
      })

      if (!invite || invite.accepted) {
        throw new Error('Invalid or already used invite')
      }

      if (invite.expiresAt < new Date()) {
        throw new Error('Invite expired')
      }

      const passwordHash = await bcrypt.hash(dto.password, 10)

      const user = await this.prisma.$transaction(async tx => {
        const newUser = await tx.user.create({
          data: {
            email: invite.email,
            password: passwordHash,
            role: invite.role,
            providerId: invite.providerId,
          },
        })

        await tx.invite.update({
          where: { id: invite.id },
          data: { accepted: true },
        })

        return newUser
      })

      return {
        user: this.sanitizeUser(user),
        token: this.signToken(user),
      }
    }

}
