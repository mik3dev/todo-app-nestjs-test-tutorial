import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
    }),
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
