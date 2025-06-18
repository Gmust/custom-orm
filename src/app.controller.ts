import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async createUser() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.appService.createUser({
      email: 'test@gmail.com',
      name: 'Test User',
      settings: {
        theme: 'dark',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return result.toString();
  }
}
