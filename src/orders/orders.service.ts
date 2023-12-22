import { SkuDetails } from 'src/shared/schema/products';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { checkoutDtoArr } from './dto/checkout-dto';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { OrderRepository } from 'src/shared/repositories/order.repository';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { UsersRepository } from 'src/shared/repositories/user.repository';
import config from 'config';
import { userTypes } from 'src/shared/schema/users';
import { orderStatus, paymentStatus } from 'src/shared/schema/orders';
import { sendEmail } from 'src/shared/utils/mail-handler';

@Injectable()
export class OrdersService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @Inject(OrderRepository) private readonly orderDB: OrderRepository,
    @Inject(ProductRepository) private readonly productDB: ProductRepository,
    @Inject(UsersRepository) private readonly userDB: UsersRepository,
  ) {}
  async create(createOrderDto: Record<string, any>) {
    try {
      const order = await this.orderDB.findOne({
        checkoutSessionId: createOrderDto.checkoutSessionId,
      });
      if (order) {
        return order;
      }
      const result = await this.orderDB.create(createOrderDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(status: string, user: Record<string, any>) {
    try {
      const userDeails = await this.userDB.findOne({
        _id: user._id.toString(),
      });
      const query = {} as Record<string, any>;
      if (userDeails.type === userTypes.CUSTOMER) {
        query.userId = user._id.toString();
      }
      if (status) {
        query.status = status;
      }
      const orders = await this.orderDB.find(query);
      return {
        success: true,
        result: orders,
        message: 'orders fetched successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.orderDB.findOne({ _id: id });
      if (!order) {
        throw new Error('order not found');
      }
      return {
        success: true,
        result: order,
        message: 'order fetched successfully',
      };
    } catch (error) {
      throw error;
    }
  }
  async checkout(body: checkoutDtoArr, user: Record<string, any>) {
    try {
      const lineItems = [];
      const cardItems = body.checkoutDetails;
      for (const item of cardItems) {
        const itemsInStock = await this.productDB.findLicense({
          productSku: item.skuId,
          isSold: false,
        });
        if (itemsInStock.length <= item.quantity) {
          lineItems.push({
            price: item.skuPriceId,
            quantity: item.quantity,
            adjustable_quantity: {
              enabled: true,
              maximum: 5,
              minimum: 1,
            },
          });
        }
      }
      if (lineItems.length === 0) {
        throw new BadRequestException('No items in cart');
      }
      console.log('card-items-----', cardItems);
      console.log('line-items-----', lineItems);
      console.log('user----------', user);

      const session = await this.stripeClient.checkout.sessions.create({
        line_items: lineItems,
        metadata: {
          userId: user._id.toString(),
        },
        mode: 'payment',
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
        customer_email: user.email,
        success_url: config.get('stripe.sucessUrl'),
        cancel_url: config.get('stripe.cancelUrl'),
      });
      console.log('session----------------:', session);
      return {
        message: 'Payment checkout session successfully created',
        success: true,
        result: session.url,
      };
    } catch (error) {
      throw error;
    }
  }

  async webhook(rawBody: Buffer, sig: string) {

    console.log("rawBody-----------------",rawBody);
    console.log("sig----------------------",sig);
    try {
      let event;
      try {
        event = this.stripeClient.webhooks.constructEvent(
          rawBody,
          sig,
          config.get('stripe.webhook_secret'),
        );
      } catch (error) {
        throw new BadRequestException('Webhook Error', error.message);
      }
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderData = await this.createOrderObject(session);
        const order = await this.orderDB.create(orderData);
        if (session.payment_status === paymentStatus.paid) {
          if (order.orderStatus !== orderStatus.completed) {
            for (const item of order.orderedItems) {
              const licenses = await this.getLicense(orderData.orderId, item);
              item.licenses = licenses;
            }
          }
          await this.fullfillOrder(session.id, {
            orderStatus: orderStatus.completed,
            isOrderDelivered: true,
            ...orderData,
          });
          this.sendOrderEmail(
            orderData.customerEmail,
            orderData.orderId,
            `${config.get('emailService.emailTemplates.orderSuccess')}${
              order._id
            }`,
          );
        } else {
          console.log('Unhandled event type', event.type);
        }
      }
    } catch (error) {
      throw error;
    }
  }
  async fullfillOrder(
    checkoutSessionId: string,
    updateOrderDto: Record<string, any>,
  ) {
    try {
      return await this.orderDB.findOneAndUpdate(
        { checkoutSessionId },
        updateOrderDto,
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }
  async sendOrderEmail(email: string, orderId: string, orderLink: string) {
    await sendEmail(
      email,
      config.get('emailService.emailTemplates.orderSuccess'),
      'Order Success - WinSolutions',
      {
        orderId,
        orderLink,
      },
    );
  }

  async getLicense(orderId: string, item: Record<string, any>) {
    try {
      const product = await this.productDB.findOneProduct({
        _id: item.productId,
      });
      const skuDetails = product.skuDetails.find(
        (sku) => sku.skuCode === item.skuCode,
      );
      const licenses = await this.productDB.findLicense(
        {
          productSku: skuDetails._id,
          isSold: false,
        },
        item.quantity,
      );
      const licenseIds = licenses.map((license) => license._id);
      await this.productDB.updateLicenseMany(
        {
          _id: {
            $in: licenseIds,
          },
        },
        {
          isSold: true,
          orderId,
        },
      );
      return licenses.map((license) => license.licenseKey);
    } catch (error) {
      throw error;
    }
  }
  async createOrderObject(session: Stripe.Checkout.Session) {
    try {
      const lineItems = await this.stripeClient.checkout.sessions.listLineItems(
        session.id,
      );
      const orderData = {
        orderId: Math.floor(new Date().valueOf() * Math.random()) + '',
        userId: session.metadata?.userId?.toString(),
        customerAddress: session.customer_details?.address,
        customerEmail: session.customer_email,
        customerPhoneNumber: session.customer_details?.phone,
        paymentInfo: {
          paymentMethod: session.payment_method_types[0],
          paymentIntentId: session.payment_intent,
          paymentDate: new Date(),
          paymentAmount: session.amount_total / 100,
          paymentStatus: session.payment_status,
        },
        orderDate: new Date(),
        checkoutSessionId: session.id,
        orderedItems: lineItems.data.map((item) => {
          item.price.metadata.quantity = item.quantity + '';
          return item.price.metadata;
        }),
      };
      return orderData;
    } catch (error) {
      throw error;
    }
  }
}
