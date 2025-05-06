import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Enable CORS
  app.enableCors();
  
  // Use global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Setup Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('SuiTale API')
    .setDescription('API for SuiTale - decentralized storytelling platform on Sui blockchain')
    .setVersion('1.0')
    .addTag('tales')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Start the application
  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 