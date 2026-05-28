import { Module } from "@nestjs/common"
import { PostsModule } from "@/posts/posts.module"
import { PrismaModule } from "@/prisma/prisma.module"
import { AppController } from "@/app.controller"

@Module({
    imports: [PrismaModule, PostsModule],
    controllers: [AppController],
})
export class AppModule {}
