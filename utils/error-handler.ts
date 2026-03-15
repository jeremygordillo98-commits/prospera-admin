/**
 * GESTOR DE ERRORES CENTRALIZADO - PROSPERA FINANZAS
 * Proporciona utilidades para capturar, registrar y formatear errores de servicios.
 */

export interface ServiceError {
    message: string;
    code?: string;
    details?: any;
    origin: string;
}

export class AppError extends Error {
    constructor(
        public message: string,
        public origin: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const ErrorHandler = {
    /**
     * Procesa un error de servicio y lo convierte en un AppError estandarizado.
     */
    handle(error: any, origin: string): never {
        console.error(`[Error en ${origin}]:`, error);

        let message = "Ha ocurrido un error inesperado.";
        let code = "UNKNOWN_ERROR";

        if (error.message) message = error.message;
        if (error.code) code = error.code;

        // Mapeo de errores comunes de Supabase
        if (code === '23505') message = "Ya existe un registro con estos datos.";
        if (code === 'PGRST116') message = "El registro solicitado no fue encontrado.";
        if (code === '42P01') message = "Error de conexión con la base de datos.";

        throw new AppError(message, origin, code, error);
    },

    /**
     * Wrapper para llamadas a servicios que asegura un manejo consistente.
     */
    async wrap<T>(promise: any, origin: string): Promise<T> {
        try {
            const { data, error } = await promise;
            if (error) {
                return this.handle(error, origin);
            }
            return data as T;
        } catch (err) {
            if (err instanceof AppError) throw err;
            return this.handle(err, origin);
        }
    }
};
