import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShiftEligibilityModule } from './modules/shift-eligibility/shift-eligibility.module';

@Module({
  imports: [ShiftEligibilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
