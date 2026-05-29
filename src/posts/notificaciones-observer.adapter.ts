import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { InteractionObserver, InteractionPayload, PostSubject } from './posts.observer';

@Injectable()
export class NotificacionesObserverAdapter implements InteractionObserver, OnModuleInit {
    constructor(
        private readonly notificacionesService: NotificacionesService,
        private readonly postSubject: PostSubject,
    ) {}

    onModuleInit(): void {
        this.postSubject.attach(this);
    }

    update(payload: InteractionPayload): void {
        const mensaje = this.buildMessage(payload);
        this.notificacionesService.enviarAlerta('email', 'admin@sistema.com', mensaje);
    }

    private buildMessage(payload: InteractionPayload): string {
        if (payload.type === 'like' && payload.reactionType) {
            return `Reacción "${payload.reactionType}" en publicación #${payload.postId}`;
        }
        return `Nuevo ${payload.type} en publicación #${payload.postId}`;
    }
}
