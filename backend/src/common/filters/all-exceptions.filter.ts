import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * AllExceptionsFilter — Tüm hataları yakalayıp tutarlı JSON formatında döndürür.
 *
 * Frontend her zaman:  response.data.message  →  Türkçe kullanıcı mesajı
 * Ek olarak:           response.data.statusCode, response.data.path
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse();
    const request  = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // NestJS HttpException.getResponse() string veya { message, statusCode, error } döner
    let message: string;
    if (exception instanceof HttpException) {
      const raw = exception.getResponse();
      if (typeof raw === 'string') {
        message = raw;
      } else if (typeof raw === 'object' && raw !== null && 'message' in raw) {
        const m = (raw as any).message;
        // ValidationPipe array döner — join et
        message = Array.isArray(m) ? m.join(', ') : String(m);
      } else {
        message = exception.message;
      }
    } else {
      message = 'Beklenmedik bir hata oluştu.';
    }

    // Dev modunda gerçek hatayı logla
    if (process.env.NODE_ENV !== 'production') {
      console.error('[AllExceptionsFilter]', {
        path:   request.url,
        method: request.method,
        status,
        error:  exception instanceof Error
          ? { message: exception.message, stack: exception.stack }
          : exception,
      });
    }

    response.status(status).json({
      statusCode: status,
      message,              // ← Frontend'in beklediği yer: data.message
      path:      request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
