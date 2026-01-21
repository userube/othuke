// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BidsModule } from '../bids/bids.module';

@Module({
    imports: [BidsModule],
    providers: [OrdersService],
    controllers: [OrdersController],
})
export class OrdersModule {}
