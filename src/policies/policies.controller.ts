import { Controller, Get, Param, Query } from '@nestjs/common'
import { PoliciesService } from './policies.service'

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

    @Get()
    async getPolicies(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('status') status?: string,
      @Query('type') type?: string,
      @Query('holderName') holderName?: string,
    ) {
      return this.policiesService.findAll({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        status,
        type,
        holderName,
      });
    }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id)
  }
}
