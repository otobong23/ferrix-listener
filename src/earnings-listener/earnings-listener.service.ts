import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Earner, EarnerDocument } from 'src/schemas/earners/earner.schema';
import { UserTransaction, UserTransactionDocument } from 'src/schemas/transaction/userTransaction.schema';
import { User } from 'src/schemas/user/user.schema';
import type { UserModel } from 'src/schemas/user/user.schema';
import pLimit from 'p-limit'

@Injectable()
export class EarningsListenerService {
  private readonly logger = new Logger(EarningsListenerService.name);
  constructor(
    @InjectModel(User.name) private userModel: UserModel,
    @InjectModel(UserTransaction.name) private transactionModel: Model<UserTransactionDocument>,
    @InjectModel(Earner.name) private earnerModel: Model<EarnerDocument>,
  ) { }

  @Cron('*/15 * * * * *') // every 15 seconds
  async handleEarnerOrders() {
    const now = new Date();
    this.logger.log(`CRON IS RUNNING — ${now.toISOString()}`)

    const existing_earners = await this.earnerModel.find({
      status: 'pending',
      expiresAt: { $lte: now },
    });

    // for (const order of existing_earners) {
    //   await this.processcompledOrder(order);
    //   order.status = 'completed';
    //   order.save()
    // }

    this.logger.log('Total earners found: ' + existing_earners.length || 0);


    const limit = pLimit(50);

    await Promise.all(
      existing_earners.map(order =>
        limit(async () => {
          try {
            await this.processCompletedOrder(order);

            // order.status = 'completed';
            // await order.save();
            await this.earnerModel.deleteOne({ _id: order._id }); // delete after processing
            this.logger.log(`Processed and deleted order ${order._id}`);
          } catch (error) {
            order.status = 'failed';
            await order.save();
          }
        }),
      ),
    );
  }

  async processCompletedOrder(order: Earner) {

    // find and update update user balance
    const existingUser = await this.userModel.findOne({ userID: order.userID }, {})
    if (!existingUser) throw new NotFoundException("User Not found");

    // Update user
    await this.userModel.findOneAndUpdate(
      { userID: order.userID },
      {
        $inc: {
          balance: order.daily_rate,
          totalYield: order.daily_rate,
        },
        $set: {
          twentyFourHourTimerStart: '',
        },
      },
      { new: true } // return updated document
    );

    // create a transaction for the update
    const newTransaction = new this.transactionModel({
      email: existingUser.email,
      type: 'yield',
      amount: order.daily_rate,
      status: 'completed',
      date: new Date(),
    });

    await newTransaction.save();
  }


}
