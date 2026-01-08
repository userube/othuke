import { Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ClaimsService } from './claims.service'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get()
  async getClaims(
    @Query('policyId') policyId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.claimsService.findAll({ policyId, status, type })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadClaims(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded' }
    }
    const result = await this.claimsService.createBulkFromCSV(file.buffer)
    return { message: 'Claims uploaded successfully', result }
  }

  @Post()
  @Roles(Role.OPERATIONS)
  submit(
    @Req() req,
    @Body() dto: CreateClaimDto,
  ) {
    return this.claimsService.submitClaim(
      req.user.providerId,
      req.user.id,
      dto,
    )
  }

  @Get()
  @Roles(Role.ADMIN, Role.OPERATIONS, Role.FINANCE)
  findAll(
    @Req() req,
    @Query('status') status?: ClaimStatus,
  ) {
    return this.claimsService.findAll(
      req.user.providerId,
      status,
    )
  }

  @Post(':id/review')
  @Roles(Role.OPERATIONS)
  review(@Req() req, @Param('id') id: string) {
    return this.claimsService.markUnderReview(
      req.user.providerId,
      req.user.id,
      id,
    )
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  approve(@Req() req, @Param('id') id: string) {
    return this.claimsService.approve(req.user.providerId, id)
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  reject(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: DecideClaimDto,
  ) {
    return this.claimsService.reject(req.user.providerId, id, dto.reason)
  }

}
