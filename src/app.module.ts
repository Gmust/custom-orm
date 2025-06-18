import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionManager } from './orm/connection/connection.manager';

@Module({
  controllers: [AppController],
  providers: [AppService, ConnectionManager],
  exports: [ConnectionManager, AppService],
})
export class AppModule {}
