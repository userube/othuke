// src/bids/bids.module.ts
import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';

@Module({
    providers: [BidsService],
    controllers: [BidsController],
    exports: [BidsService],
})
export class BidsModule {}
