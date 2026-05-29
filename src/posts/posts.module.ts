import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from '../prisma/prisma.module';
import {
  PostSubject,
  LogObserver,
  NotificationObserver,
  RecomputeObserver
} from './posts.observer';
import { PostFactory } from './posts.factory';
import { LegacyModerationAdapter } from './moderation.adapter';
import { NotificacionesObserverAdapter } from './notificaciones-observer.adapter';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostFactory,
    LegacyModerationAdapter,
    PostSubject,
    LogObserver,
    NotificationObserver,
    RecomputeObserver,
    NotificacionesObserverAdapter,
  ],
})
export class PostsModule {}
