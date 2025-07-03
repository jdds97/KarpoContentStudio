// Form helpers para manejo de errores y validación con Astro Actions
import type { ActionError } from 'astro:actions';

// Tipo para errores de campos
interface FieldError {
  [fieldName: string]: string | string[];
}

// Tipo extendido para errores con campos
interface ExtendedActionError extends ActionError {
  fields?: FieldError;
}

// Tipo para el resultado de las actions
export interface ActionResult<T = any> {
  data?: T;
  error?: ExtendedActionError;
}

// Función para verificar si hay error en un campo específico
export const hasFieldError = (result: ActionResult | undefined, fieldName: string): boolean => {
  return !!(result?.error?.fields?.[fieldName]);
};

// Función para obtener errores de un campo específico  
export const getFieldErrors = (result: ActionResult | undefined, fieldName: string): string[] => {
  const fieldErrors = result?.error?.fields?.[fieldName];
  return fieldErrors ? [fieldErrors].flat() : [];
};

// Función para obtener el valor anterior de un campo en caso de error
export const getFieldValue = (result: ActionResult | undefined, fieldName: string, defaultValue: string = ''): string => {
  // Si hay un error, intentar obtener el valor del formulario previo
  if (result?.error && result.data) {
    return result.data[fieldName] || defaultValue;
  }
  return defaultValue;
};

// Función para obtener las clases CSS de un campo con manejo de errores
export const getFieldClasses = (
  result: ActionResult | undefined, 
  fieldName: string, 
  baseClasses: string = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-beige',
  errorClasses: string = 'border-red-300 bg-red-50',
  normalClasses: string = 'border-secondary-lightgray'
): string => {
  const hasError = hasFieldError(result, fieldName);
  return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
};

// Función para obtener el mensaje de error general
export const getGeneralError = (result: ActionResult | undefined): string | null => {
  if (result?.error) {
    // Si hay un mensaje general
    if (typeof result.error === 'string') {
      return result.error;
    }
    // Si hay un objeto de error con mensaje
    if (result.error.message) {
      return result.error.message;
    }
    // Mensaje por defecto si hay errores de campos
    if (result.error.fields) {
      return 'Por favor, revisa los campos del formulario.';
    }
  }
  return null;
};

// Función para verificar si la acción fue exitosa
export const isActionSuccess = (result: ActionResult | undefined): boolean => {
  return !!(result?.data && !result?.error);
};

// Función para obtener mensaje de éxito
export const getSuccessMessage = (result: ActionResult | undefined): string | null => {
  if (isActionSuccess(result)) {
    return result?.data?.message || 'Operación completada exitosamente';
  }
  return null;
};

// Función para obtener clases de select con manejo de errores
export const getSelectClasses = (
  result: ActionResult | undefined,
  fieldName: string,
  baseClasses: string = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-beige'
): string => {
  return getFieldClasses(result, fieldName, baseClasses);
};

// Función para obtener clases de textarea con manejo de errores  
export const getTextareaClasses = (
  result: ActionResult | undefined,
  fieldName: string,
  baseClasses: string = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-beige'
): string => {
  return getFieldClasses(result, fieldName, baseClasses);
};

// Función para obtener clases de checkbox con manejo de errores
export const getCheckboxClasses = (
  result: ActionResult | undefined,
  fieldName: string,
  baseClasses: string = 'focus:ring-primary-beige h-4 w-4 text-primary-black border rounded'
): string => {
  const hasError = hasFieldError(result, fieldName);
  return `${baseClasses} ${hasError ? 'border-red-300' : 'border-secondary-lightgray'}`;
};