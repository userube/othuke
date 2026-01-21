import {
    Controller,
    Post,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    constructor(
        private paymentsService: PaymentsService,
    ) {}

    @Post('initiate/:orderId')
    @Roles(Role.CUSTOMER)
    initiate(@Req() req, @Param('orderId') id: string) {
        return this.paymentsService.initiatePayment(
            id,
            req.user.userId,
        );
    }

    @Post('verify/:reference')
    verify(@Param('reference') ref: string) {
        return this.paymentsService.verifyPayment(ref);
    }

    @Post('release/:orderId')
    @Roles(Role.CUSTOMER)
    release(@Param('orderId') id: string) {
        return this.paymentsService.releaseEscrow(id);
    }
}
