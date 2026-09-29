import { Routes } from '@angular/router';
import { APP_ROUTES } from './constants';

export const routes: Routes = [
  {
    path: APP_ROUTES.ROOT,
    loadComponent: () =>
      import('./pages/matriz/matriz.page').then((m) => m.MatrizPage),
  },
  {
    path: APP_ROUTES.RESULTADOS,
    loadComponent: () =>
      import('./pages/resultados/resultados.page').then(
        (m) => m.ResultadosPage
      ),
  },
  {
    path: APP_ROUTES.WILDCARD,
    redirectTo: APP_ROUTES.ROOT,
  },
];
