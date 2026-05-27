import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from '../prisma/prisma.module';
// Asegúrate de importar todas las clases
import {
  PostSubject,
  LogObserver,
  NotificationObserver,
  RecomputeObserver
} from './posts.observer';
import { PostFactory } from './posts.factory';
import { LegacyModerationAdapter } from './moderation.adapter';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostFactory,
    LegacyModerationAdapter,
    // El Sujeto y todos sus Observadores deben estar registrados aquí
    PostSubject,
    LogObserver,
    NotificationObserver,
    RecomputeObserver
  ],
})
export class PostsModule {}
