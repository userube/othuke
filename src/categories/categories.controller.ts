// src/categories/categories.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryFieldDto } from './dto/create-category-field.dto';
import { UpdateCategoryFieldDto } from './dto/update-category-field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    getAll() {
        return this.categoriesService.getAllCategories();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.createCategory(dto);
    }

    @Post(':id/fields')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    addField(
        @Param('id') categoryId: string,
        @Body() dto: CreateCategoryFieldDto,
    ) {
        return this.categoriesService.createField(categoryId, dto);
    }

    @Patch('fields/:fieldId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateField(
        @Param('fieldId') fieldId: string,
        @Body() dto: UpdateCategoryFieldDto,
    ) {
        return this.categoriesService.updateField(fieldId, dto);
    }

    @Delete('fields/:fieldId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deleteField(@Param('fieldId') fieldId: string) {
        return this.categoriesService.deleteField(fieldId);
    }
}
