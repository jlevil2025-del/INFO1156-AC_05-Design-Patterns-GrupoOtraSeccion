import { Controller, Get } from "@nestjs/common"

@Controller()
export class AppController {
    @Get()
    getStatus() {
        return {
            status: "running",
            repository: "INFO1156-Design-Patterns",
            message: "Backend API is live. Go to /docs for documentation.",
        }
    }
}
