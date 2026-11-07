import { allowedOrigins } from '@services/authService/helpers/Auth.http';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.TRUSTED_PROXIES) {
    app
      .getHttpAdapter()
      .getInstance()
      .set(
        'trust proxy',
        process.env.TRUSTED_PROXIES.split(',').map((value) => value.trim()),
      );
  }

  app.enableCors({
    origin: allowedOrigins(),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
