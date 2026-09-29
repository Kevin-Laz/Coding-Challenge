import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/matriz/matriz.page').then((m) => m.MatrizPage),
  },
  {
    path: 'resultados',
    loadComponent: () =>
      import('./pages/resultados/resultados.page').then(
        (m) => m.ResultadosPage
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
