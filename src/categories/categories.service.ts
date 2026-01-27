// src/categories/categories.service.ts
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) {}

    createCategory(data: any) {
        return this.prisma.category.create({ data });
    }

    getAllCategories() {
        return this.prisma.category.findMany({
            include: { fields: true },
        });
    }

    createField(categoryId: string, data: any) {
        return this.prisma.categoryField.create({
            data: {
                ...data,
                categoryId,
            },
        });
    }

    updateField(fieldId: string, data: any) {
        return this.prisma.categoryField.update({
            where: { id: fieldId },
            data,
        });
    }

    deleteField(fieldId: string) {
        return this.prisma.categoryField.delete({
            where: { id: fieldId },
        });
    }

    /**
     * Used later by Item Requests to validate custom fields
     */
    async validateCustomFields(categoryId: string, values: any) {
        const fields = await this.prisma.categoryField.findMany({
            where: { categoryId },
        });

        for (const field of fields) {
            const value = values[field.name];

            if (field.required && value === undefined) {
                throw new BadRequestException(
                    `Missing required field: ${field.name}`,
                );
            }

            if (value !== undefined) {
                switch (field.type) {
                    case 'NUMBER':
                        if (typeof value !== 'number')
                            throw new BadRequestException(
                                `${field.name} must be a number`,
                            );
                        break;
                    case 'BOOLEAN':
                        if (typeof value !== 'boolean')
                            throw new BadRequestException(
                                `${field.name} must be boolean`,
                            );
                        break;
                    case 'SELECT': {
                        const options = field.options as string[];

                        if (!Array.isArray(options)) {
                            throw new BadRequestException(
                                `${field.name} options are misconfigured`,
                            );
                        }

                        if (!options.includes(value)) {
                            throw new BadRequestException(
                                `${field.name} has invalid option`,
                            );
                        }
                        break;
                    }
                }
            }
        }
    }
}
