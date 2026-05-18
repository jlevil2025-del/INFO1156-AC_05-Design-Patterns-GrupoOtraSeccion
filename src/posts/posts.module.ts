import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostSubject } from './posts.observer'; // <-- Importamos el Sujeto
import { LegacyModerationAdapter } from './moderation.adapter';
import { PostFactory } from './posts.factory';

@Module({
  controllers: [PostsController],
  providers: [
    PostsService, 
    PostSubject, // <-- Registramos el Sujeto como proveedor
    PostFactory, // <-- Registramos el factory como proveedor
    LegacyModerationAdapter // <-- Registramos el adaptador como proveedor
  ],
})
export class PostsModule {}                                                                                                                                                     