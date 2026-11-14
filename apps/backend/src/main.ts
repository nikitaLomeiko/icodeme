import { allowedOrigins } from '@core/config/app/allowed-origins';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@modules/app.module';
import { DockerTerminalGateway } from '@modules/ide/docker-terminal.gateway';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();

  if (process.env.TRUSTED_PROXIES) {
    app.set(
      'trust proxy',
      process.env.TRUSTED_PROXIES.split(',').map((value) => value.trim()),
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: allowedOrigins(),
    credentials: true,
  });

  app.get(DockerTerminalGateway).attach(app.getHttpServer());

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
