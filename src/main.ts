import { AppModule } from "@/app.module"

import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from "@nestjs/platform-express"
import { setupSwagger } from "@/config/swagger.config"

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    setupSwagger(app)

    await app.listen(3000, "0.0.0.0")

    console.log("Application running on: http://localhost:3000")
    console.log("Documentation at: http://localhost:3000/docs")
}

bootstrap()
