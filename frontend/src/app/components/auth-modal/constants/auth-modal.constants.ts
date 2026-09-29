export const AUTH_MODAL_DEFAULTS = {
  USERNAME: 'admin',
  PASSWORD: 'secretpassword123',
} as const;

export const AUTH_MODAL_TEXT = {
  TITLE: 'Autenticación',
  CLOSE_LABEL: 'Cerrar modal',
  DESCRIPTION:
    'Ingrese sus credenciales para obtener acceso a las solicitudes al motor QR.',
  USER_LABEL: 'Usuario',
  USER_PLACEHOLDER: 'admin',
  PASSWORD_LABEL: 'Contraseña',
  PASSWORD_PLACEHOLDER: '••••••••',
  INFO_HELPER: 'Ingrese sus datos para autenticar y desbloquear el cálculo.',
  CANCEL_BTN: 'Cancelar',
  SUBMIT_BTN: 'Autenticar',
  SUBMITTING_BTN: 'Autenticando...',
} as const;
