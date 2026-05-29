import { Injectable } from "@nestjs/common"
import { NotificacionFactory } from "./notificacion.factory"

@Injectable()
export class NotificacionesService {
    enviarAlerta(tipo: "email" | "whatsapp", destino: string, texto: string): void {
        const canal = NotificacionFactory.crearCanal(tipo)
        canal.enviar(destino, texto)
    }
}