import { Notificacion } from "./interfaces/notificacion.interface"
import { EmailNotificacion } from "./estrategias/email.notificacion"
import { WhatsappNotificacion } from "./estrategias/whatsapp.notificacion"

export class NotificacionFactory {
    // Este es el método fábrica encargado de la creación de objetos
    static crearCanal(tipo: "email" | "whatsapp"): Notificacion {
        if (tipo === "email") {
            return new EmailNotificacion()
        }
        if (tipo === "whatsapp") {
            return new WhatsappNotificacion()
        }
        throw new Error(`El canal de notificación "${tipo}" no está soportado.`)
    }
}