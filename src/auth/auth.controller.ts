import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

    @Post('login')
    login(@Body('email') email: string, @Body('password') password: string ) {
        return this.auth.login(email, password)
    }

    @Post('signup')
    signup(@Body() dto: SignupDto) {
      return this.auth.signup(dto)
    }

    @Post('invites/:token/accept')
    acceptInvite(@Param('token') token: string,@Body() dto: AcceptInviteDto) {
      return this.auth.acceptInvite(token, dto)
    }

}
