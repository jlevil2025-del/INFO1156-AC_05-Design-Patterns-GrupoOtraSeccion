import { Injectable } from '@nestjs/common';
import { legacyModerationApi } from './legacy-moderation.client';

// La interfaz moderna que nuestro sistema espera
export interface ModernModerator {
  isBlocked(content: string): boolean;
}

@Injectable()
export class LegacyModerationAdapter implements ModernModerator {
  isBlocked(content: string): boolean {
    const moderation = legacyModerationApi.review(content);

    if (moderation === 'BLOCK') return true;
    if (typeof moderation === 'number') return moderation < 1;
    if (typeof moderation === 'object') return !('pass' in moderation && moderation.pass);
    if (moderation === 'OK') return false;
    
    return false;
  }
}