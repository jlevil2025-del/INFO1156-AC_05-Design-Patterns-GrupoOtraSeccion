import { Module } from "@nestjs/common"
import { PostsModule } from "@/posts/posts.module"
import { PrismaModule } from "@/prisma/prisma.module"
// 1. Agregamos la importación con el mismo formato de alias:
import { NotificacionesModule } from "@/notificaciones/notificaciones.module"

@Module({

    imports: [PrismaModule, PostsModule, NotificacionesModule],
})
export class AppModule { }