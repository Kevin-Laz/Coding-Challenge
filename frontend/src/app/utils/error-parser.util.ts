import { GLOBAL_MESSAGES } from '../constants';

export interface HttpErrorPayload {
  status?: number;
  message?: string;
  error?: {
    error?: string;
    details?: string;
    message?: string;
  } | string;
}

/**
 * Detecta si una cadena contiene código HTML o páginas de error de servidor (ej. 502 de Render/Cloudflare).
 */
export function containsHtml(content: string): boolean {
  return /<!DOCTYPE|<html|<head|<body|<style|<title/i.test(content);
}

/**
 * Elimina etiquetas HTML y espacios redundantes si hay fragmentos residuales.
 */
export function sanitizeHtmlText(content: string): string {
  if (containsHtml(content)) {
    return '';
  }
  return content.replace(/<[^>]*>/g, '').trim();
}

/**
 * Parsea y formatea errores HTTP o de red, evitando mostrar código HTML en crudo
 * cuando los microservicios en Render están en reposo (cold start / 502).
 */
export function parseApiError(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return GLOBAL_MESSAGES.NETWORK_OR_SERVER_ERROR;
  }

  const httpError = err as HttpErrorPayload;
  const status = httpError.status;
  
  let errorTitle = '';
  let errorDetails = '';

  if (typeof httpError.error === 'object' && httpError.error !== null) {
    errorTitle = httpError.error.error || httpError.error.message || '';
    errorDetails = httpError.error.details || '';
  } else if (typeof httpError.error === 'string') {
    if (containsHtml(httpError.error)) {
      errorTitle = '';
    } else {
      errorTitle = httpError.error;
    }
  }

  const rawMessage = httpError.message || '';
  const combinedContext = `${errorTitle} ${errorDetails} ${rawMessage}`.toLowerCase();

  // Caso 1: Cold start / 502 Bad Gateway del contenedor Go o Gateway
  if (
    status === 502 ||
    combinedContext.includes('502') ||
    combinedContext.includes('bad gateway') ||
    containsHtml(errorDetails) ||
    containsHtml(rawMessage)
  ) {
    return GLOBAL_MESSAGES.SERVICE_COLD_START_502;
  }

  // Caso 2: Timeout / 504 Gateway Timeout
  if (
    status === 504 ||
    combinedContext.includes('timeout') ||
    combinedContext.includes('aborted')
  ) {
    return GLOBAL_MESSAGES.TIMEOUT_504;
  }

  // Caso 3: 503 Service Unavailable
  if (status === 503) {
    return GLOBAL_MESSAGES.SERVICE_UNAVAILABLE_503;
  }

  // Caso 4: 401 / 403 No autorizado
  if (status === 401 || status === 403) {
    return GLOBAL_MESSAGES.UNAUTHORIZED_401;
  }

  // Caso 5: Error estructurado con detalles limpios
  const cleanTitle = sanitizeHtmlText(errorTitle);
  const cleanDetails = sanitizeHtmlText(errorDetails);

  if (cleanTitle) {
    if (cleanDetails && cleanDetails !== cleanTitle) {
      return `${cleanTitle} (${cleanDetails})`;
    }
    return cleanTitle;
  }

  if (rawMessage && !containsHtml(rawMessage)) {
    return rawMessage;
  }

  return GLOBAL_MESSAGES.NETWORK_OR_SERVER_ERROR;
}
