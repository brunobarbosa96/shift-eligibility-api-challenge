import { BannedErrorHandler } from '@/utils/banned-errors-handler';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        error: (exception) => {
          const banned = BannedErrorHandler(exception);
          if (banned) {
            return;
          }
          Sentry.captureException(exception);
        },
      }),
    );
  }
}
