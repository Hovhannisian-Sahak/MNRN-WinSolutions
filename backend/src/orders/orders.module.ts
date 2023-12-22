import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderRepository } from 'src/shared/repositories/order.repository';
import { RolesGuard } from 'src/shared/middleware/roles.guard';
import { UsersRepository } from 'src/shared/repositories/user.repository';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { StripeModule } from 'nestjs-stripe';
import config from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema, Products } from 'src/shared/schema/products';
import { UserSchema, Users } from 'src/shared/schema/users';
import { OrderSchema, Orders } from 'src/shared/schema/orders';
import { License, LicenseSchema } from 'src/shared/schema/license';
import { AuthMiddleware } from 'src/shared/middleware/auth';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    UsersRepository,
    ProductRepository,
    OrderRepository,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
  imports: [
    StripeModule.forRoot({
      apiKey: config.get('stripe.secretKey'),
      apiVersion: '2023-10-16',
    }),
    MongooseModule.forFeature([
      {
        name: Products.name,
        schema: ProductSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Orders.name,
        schema: OrderSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: License.name,
        schema: LicenseSchema,
      },
    ]),
  ],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({
        path: 'orders/webhook',
        method: RequestMethod.POST,
      })
      .forRoutes(OrdersController);
  }
}
