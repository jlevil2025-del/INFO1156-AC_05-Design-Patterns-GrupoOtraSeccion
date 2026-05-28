import { Notificacion } from "../interfaces/notificacion.interface"

export class EmailNotificacion implements Notificacion {
    enviar(destinatario: string, mensaje: string): void {
        console.log(`[Email] Enviando correo a ${destinatario}: "${mensaje}"`)
    }
}

