import { Module } from "@nestjs/common"
import { PostsModule } from "@/posts/posts.module"
import { PrismaModule } from "@/prisma/prisma.module"
<<<<<<< HEAD
// 1. Agregamos la importación con el mismo formato de alias:
import { NotificacionesModule } from "@/notificaciones/notificaciones.module"

@Module({

    imports: [PrismaModule, PostsModule, NotificacionesModule],
=======
import { AppController } from "@/app.controller"

@Module({
    imports: [PrismaModule, PostsModule],
    controllers: [AppController],
>>>>>>> 8814e04563b4063d0258e4affa524b0460370fc8
})
export class AppModule { }