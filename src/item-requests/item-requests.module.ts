// src/item-requests/item-requests.module.ts
import { Module } from '@nestjs/common';
import { ItemRequestsService } from './item-requests.service';
import { ItemRequestsController } from './item-requests.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
    imports: [CategoriesModule],
    providers: [ItemRequestsService],
    controllers: [ItemRequestsController],
})
export class ItemRequestsModule {}
