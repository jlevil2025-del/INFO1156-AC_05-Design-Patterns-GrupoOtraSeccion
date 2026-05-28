import { Notificacion } from "../interfaces/notificacion.interface"

export class WhatsappNotificacion implements Notificacion {
    enviar(destinatario: string, mensaje: string): void {
        console.log(`[WhatsApp] Enviando mensaje al +56${destinatario}: "${mensaje}"`)
    }
}