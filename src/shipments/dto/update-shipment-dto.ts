// src/shipments/dto/update-shipment.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class UpdateShipmentDto {
    @IsOptional()
    @IsEnum(ShipmentStatus)
    status?: ShipmentStatus;

    @IsOptional()
    @IsString()
    trackingCode?: string;

    @IsOptional()
    @IsString()
    courier?: string;
}
