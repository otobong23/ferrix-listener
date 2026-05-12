import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EarningsListenerModule } from './earnings-listener/earnings-listener.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { configDotenv } from 'dotenv';
import { ScheduleModule } from '@nestjs/schedule';

configDotenv()

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_DB!),
    ScheduleModule.forRoot(),
    EarningsListenerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
