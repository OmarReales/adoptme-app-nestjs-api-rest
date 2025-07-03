import { Controller, Get, Render, Query, UseGuards } from '@nestjs/common';
import { ViewsService } from './views.service';
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interfaces';

@Controller()
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get('/')
  @Render('index')
  async home() {
    return this.viewsService.prepareHomeData();
  }

  @Get('/view-pets')
  @Render('pets/index')
  async pets(
    @Query('page') page = '1',
    @Query('limit') limit = '24',
    @Query('species') species?: string,
    @Query('name') name?: string,
    @Query('ageRange') ageRange?: string,
  ) {
    return this.viewsService.preparePetsData(
      page,
      limit,
      species,
      name,
      ageRange,
    );
  }

  @Get('/view-adoptions')
  @Render('adoptions/index')
  async adoptions(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.viewsService.prepareAdoptionsData(page, limit);
  }

  @Get('/login')
  @Render('auth/login')
  login() {
    return this.viewsService.prepareLoginData();
  }

  @Get('/register')
  @Render('auth/register')
  register() {
    return this.viewsService.prepareRegisterData();
  }

  @Get('/profile')
  @UseGuards(HybridAuthGuard)
  @Render('profile/index')
  async profile(@GetUser() user: AuthenticatedUser | null) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.viewsService.prepareProfileData(user);
  }
}
