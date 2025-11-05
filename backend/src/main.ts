import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('✅ SQLite database connected successfully');
  } catch (error) {
    console.log('❌ Database connection failed:', error);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('🚀 Backend started on http://localhost:3000');
}
bootstrap();