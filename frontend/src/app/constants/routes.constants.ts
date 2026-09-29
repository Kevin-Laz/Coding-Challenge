export const APP_ROUTES = {
  ROOT: '',
  HOME: '/',
  RESULTADOS: 'resultados',
  RESULTADOS_PATH: '/resultados',
  WILDCARD: '**',
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
