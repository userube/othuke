// src/categories/dto/create-category-field.dto.ts
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';
import { FieldType } from '@prisma/client';

export class CreateCategoryFieldDto {
    @IsString()
    name: string;

    @IsEnum(FieldType)
    type: FieldType;

    @IsOptional()
    options?: any;

    @IsBoolean()
    required: boolean;
}
