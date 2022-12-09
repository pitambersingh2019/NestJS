import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AdminModule } from './modules/admin/admin.module';
import { AdminSettingsModule } from './modules/adminSettings/adminSettings.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientProjectModule } from './modules/clientProject/clientProject.module';
import { CommunityModule } from './modules/community/community.module';
import { ConnectionModule } from './modules/connection/connection.module';
import { EducationModule } from './modules/education/education.module';
import { EmploymentModule } from './modules/employment/employment.module';
import { MailModule } from './modules/mail/mail.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ProjectModule } from './modules/project/project.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { ReputationConstantModule } from './modules/reputationConstant/reputationConstant.module';
import { SkillModule } from './modules/skill/skill.module';
import { TeamModule } from './modules/team/team.module';
import { TemplateModule } from './modules/template/template.module';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ConfigModule } from './shared/config/config.module';
import { ConfigService } from './shared/config/config.service';
import { LoggerService } from './shared/providers/logger.service';
import { StripeIntegrationModule } from './modules/stripe/stripeIntegration.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 25,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.winstonLoggerConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MailModule,
    SkillModule,
    EducationModule,
    EmploymentModule,
    ClientProjectModule,
    ConnectionModule,
    CommunityModule,
    TeamModule,
    ProjectModule,
    WalletModule,
    ReputationConstantModule,
    ReputationModule,
    NotificationModule,
    TemplateModule,
    AdminModule,
    AdminSettingsModule,
    StripeIntegrationModule,
  ],
  controllers: [],
  providers: [
    LoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
