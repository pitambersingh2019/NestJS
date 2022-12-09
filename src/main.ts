import {
  ClassSerializerInterceptor,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import helmet from 'helmet';
import hpp from 'hpp';
import * as health from '@cloudnative/health-connect';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ConfigModule } from './shared/config/config.module';
import { ConfigService } from './shared/config/config.service';
import { setupSwagger } from './shared/swagger/setup-swagger';
import { HttpExceptionFilter } from './shared/filters/unprocessable-entity.filter';
import { QueryFailedFilter } from './shared/filters/query-failed.filter';

const healthCheck = new health.HealthChecker();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.select(ConfigModule).get(ConfigService);
  const corsOptions = configService.corsConfigOptions;

  app.use(cookieParser.default());
  app.setGlobalPrefix('api');
  app.enableCors(corsOptions);
  app.use(helmet());
  app.use(hpp());

  const reflector = app.get(Reflector);
  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validationError: {
        target: false,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new UnprocessableEntityException(validationErrors);
      },
    }),
  );

  if (['development', 'staging'].includes(configService.nodeEnv)) {
    setupSwagger(app);
  }

  app.use('/live', health.LivenessEndpoint(healthCheck));
  app.use('/ready', health.ReadinessEndpoint(healthCheck));

  const port = configService.getNumber('PORT');
  await app.listen(port);
  console.info(`server running on port ${port}`);
}
bootstrap();
