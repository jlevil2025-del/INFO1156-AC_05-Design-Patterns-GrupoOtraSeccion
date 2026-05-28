import { Injectable } from '@nestjs/common';

// 1. Contrato estricto
export interface InteractionPayload {
  type: string;
  postId: number;
  interactionId: number;
  reactionType?: string;
}

export interface InteractionObserver {
  update(payload: InteractionPayload): void;
}

// 2. Observadores Inyectables y fuertemente tipados
@Injectable()
export class LogObserver implements InteractionObserver {
  update(payload: InteractionPayload): void {
    console.log(`[event:${payload.type}.created]`, {
      postId: payload.postId,
      id: payload.interactionId
    });
  }
}

@Injectable()
export class NotificationObserver implements InteractionObserver {
  update(payload: InteractionPayload): void {
    console.log(`[notify:${payload.type}]`, { postId: payload.postId });
  }
}

@Injectable()
export class RecomputeObserver implements InteractionObserver {
  update(payload: InteractionPayload): void {
    console.log(`[recompute] postId=${payload.postId}`);
  }
}

// 3. El Sujeto usando Inyección de Dependencias
@Injectable()
export class PostSubject {
  private observers: InteractionObserver[] = [];

  // NestJS inyecta las dependencias, el Sujeto ya no usa 'new'
  constructor(
    private readonly logObserver: LogObserver,
    private readonly notificationObserver: NotificationObserver,
    private readonly recomputeObserver: RecomputeObserver,
  ) {
    this.attach(this.logObserver);
    this.attach(this.notificationObserver);
    this.attach(this.recomputeObserver);
  }

  attach(observer: InteractionObserver): void {
    this.observers.push(observer);
  }

  notify(payload: InteractionPayload): void {
    for (const observer of this.observers) {
      observer.update(payload);
    }
  }
}
