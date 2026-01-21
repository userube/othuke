// src/categories/dto/update-category-field.dto.ts
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';
import { FieldType } from '@prisma/client';

export class UpdateCategoryFieldDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(FieldType)
    type?: FieldType;

    @IsOptional()
    options?: any;

    @IsOptional()
    @IsBoolean()
    required?: boolean;
}
