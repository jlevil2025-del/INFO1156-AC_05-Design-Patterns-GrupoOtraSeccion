import { Module } from "@nestjs/common"
import { PostsModule } from "@/posts/posts.module"
import { PrismaModule } from "@/prisma/prisma.module"
import { AppController } from "@/app.controller"
import { NotificacionesModule } from "@/notificaciones/notificaciones.module"

@Module({
    imports: [
        PrismaModule,
        PostsModule,
        NotificacionesModule
    ],
    controllers: [AppController],
})
export class AppModule { }
