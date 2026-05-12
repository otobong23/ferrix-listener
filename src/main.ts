import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { configDotenv } from 'dotenv';
configDotenv()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8080;

  app.use(
    bodyParser.urlencoded({
      limit: '10mb',
      extended: true,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in the DTO
      forbidNonWhitelisted: true, // throws error if extra properties
      transform: true, // transforms plain JSON into class instances
    }),
  );


  await app.listen(port, '0.0.0.0');
}
bootstrap();
