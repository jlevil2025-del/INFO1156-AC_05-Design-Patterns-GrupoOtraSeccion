import { Injectable } from '@nestjs/common';

// 1. La interfaz que define qué es un Observador
export interface InteractionObserver {
  update(payload: { type: string; postId: number; interactionId: number; reactionType?: string }): void;
}

// 2. Implementación concreta: El observador encargado de los Logs e Historial
export class LogObserver implements InteractionObserver {
  update(payload: any): void {
    console.log(`[event:${payload.type}.created]`, { 
      postId: payload.postId, 
      id: payload.interactionId 
    });
  }
}

// 3. Implementación concreta: El observador encargado de las Notificaciones
export class NotificationObserver implements InteractionObserver {
  update(payload: any): void {
    console.log(`[notify:${payload.type}]`, { postId: payload.postId });
  }
}

// 4. Implementación concreta: El observador encargado de los Recálculos de puntuación
export class RecomputeObserver implements InteractionObserver {
  update(payload: any): void {
    console.log(`[recompute] postId=${payload.postId}`);
  }
}

// 5. El Sujeto (Subject): La clase principal que NestJS inyectará para gestionar todo
@Injectable()
export class PostSubject {
  private observers: InteractionObserver[] = [];

  constructor() {
    // Registramos los observadores nativos al inicializar
    this.attach(new LogObserver());
    this.attach(new NotificationObserver());
    this.attach(new RecomputeObserver());
  }

  attach(observer: InteractionObserver): void {
    this.observers.push(observer);
  }

  notify(payload: { type: string; postId: number; interactionId: number; reactionType?: string }): void {
    for (const observer of this.observers) {
      observer.update(payload);
    }
  }
}