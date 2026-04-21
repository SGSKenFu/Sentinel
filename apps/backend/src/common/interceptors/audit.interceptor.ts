import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!MUTATING_METHODS.has(req.method)) {
      return next.handle();
    }

    const user = (req as Request & { user?: { id: string; email: string } }).user;
    const startMs = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startMs;
        this.logger.log(
          JSON.stringify({
            action: req.method,
            path: req.url,
            userId: user?.id ?? 'anonymous',
            email: user?.email ?? 'anonymous',
            durationMs: duration,
            timestamp: new Date().toISOString(),
          }),
        );
      }),
    );
  }
}
