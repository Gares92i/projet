import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm'; // Commented out for testing
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({ // Commented out for testing
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     url: configService.get<string>('DATABASE_URL'),
    //     autoLoadEntities: true,
    //     synchronize: false, // As we'll use schema.sql
    //     ssl: {
    //       rejectUnauthorized: false, // Necessary for some cloud providers like Railway
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    UsersModule,
    ProjectsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
