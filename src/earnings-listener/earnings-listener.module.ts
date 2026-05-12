import { Module } from '@nestjs/common';
import { EarningsListenerService } from './earnings-listener.service';
import { UserModule } from 'src/schemas/user/user.module';
import { EarnerModule } from 'src/schemas/earners/earner.module';
import { UserTransactionModule } from 'src/schemas/transaction/userTransaction.module';

@Module({
  imports: [UserModule, EarnerModule, UserTransactionModule],
  controllers: [],
  providers: [EarningsListenerService],
})
export class EarningsListenerModule {}
