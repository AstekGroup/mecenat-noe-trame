import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { Natura2000Module } from './natura2000/natura2000.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProjectsModule,
    Natura2000Module,
  ],
  controllers: [AppController],
})
export class AppModule {}
