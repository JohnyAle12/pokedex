import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // allow that nest transform our params implicitly so i we have a '10' param nest parse to 10 number
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  await app.listen(3000);
}
bootstrap();
