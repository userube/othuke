// src/categories/dto/create-category.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
