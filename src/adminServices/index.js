/**
 * Punto de entrada centralizado para todos los servicios de administración
 * Facilita la importación en componentes
 */

export { api } from './api';
export { dashboardService, mocks } from './dashboardService';
export { usersService } from './usersService';
export { authService } from './authService';
export { catalogsService } from './catalogsService';

/**
 * Utilidades de validación para formularios de usuario
 */
export const validationUtils = {

    /**
     * Validar formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} true si es válido
     */
    isValidEmail: (email) => {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    },

    /**
     * Validar edad mínima (15 años)
     * @param {string} birthDate - Fecha de nacimiento en formato ISO
     * @returns {boolean} true si tiene al menos 15 años
     */
    isValidAge: (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
        return birth <= minDate;
    },

    /**
     * Validar que dos idiomas sean diferentes
     * @param {string} lang1 - Primer idioma
     * @param {string} lang2 - Segundo idioma
     * @returns {boolean} true si son diferentes
     */
    areDifferentLanguages: (lang1, lang2) => {
        return lang1 && lang2 && lang1.toUpperCase() !== lang2.toUpperCase();
    },

    /**
     * Validar longitud de nombre/apellido
     * @param {string} name - Nombre o apellido
     * @returns {boolean} true si tiene entre 3 y 100 caracteres
     */
    isValidName: (name) => {
        return name && name.trim().length >= 3 && name.trim().length <= 100;
    },

    /**
     * Validar formato de password
     * @param {string} password - Password a validar
     * @returns {boolean} true si tiene al menos 6 caracteres
     */
    isValidPassword: (password) => {
        return password && password.length >= 6;
    },

    /**
     * Validar match_quantity
     * @param {number} quantity - Cantidad de matches
     * @returns {boolean} true si está entre 1 y 100
     */
    isValidMatchQuantity: (quantity) => {
        return quantity >= 1 && quantity <= 100;
    },

    /**
     * Validar datos completos de usuario para crear
     * @param {Object} userData - Datos del usuario
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    validateUserData: (userData) => {
        const errors = [];

        if (!validationUtils.isValidName(userData.first_name)) {
            errors.push('El nombre debe tener entre 3 y 100 caracteres');
        }

        if (!validationUtils.isValidName(userData.last_name)) {
            errors.push('El apellido debe tener entre 3 y 100 caracteres');
        }

        if (!validationUtils.isValidEmail(userData.email)) {
            errors.push('El formato del email no es válido');
        }

        if (userData.password && !validationUtils.isValidPassword(userData.password)) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        if (!userData.birth_date) {
            errors.push('La fecha de nacimiento es requerida');
        } else if (!validationUtils.isValidAge(userData.birth_date)) {
            errors.push('El usuario debe tener al menos 15 años');
        }

        if (!userData.country_id) {
            errors.push('El país es requerido');
        }

        if (!userData.native_lang_id) {
            errors.push('El idioma nativo es requerido');
        }

        if (!userData.target_lang_id) {
            errors.push('El idioma objetivo es requerido');
        }

        if (!validationUtils.areDifferentLanguages(userData.native_lang_id, userData.target_lang_id)) {
            errors.push('Los idiomas nativo y objetivo deben ser diferentes');
        }

        if (userData.match_quantity && !validationUtils.isValidMatchQuantity(userData.match_quantity)) {
            errors.push('La cantidad de matches debe estar entre 1 y 100');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

/**
 * Constantes útiles para el frontend
 */
export const constants = {
    ROLES: {
        ADMIN: 'admin',
        TEACHER: 'teacher',
        USER: 'user'
    },

    ROLE_LABELS: {
        admin: 'Administrador',
        teacher: 'Profesor',
        user: 'Usuario'
    },

    DEFAULT_MATCH_QUANTITY: 10,

    MIN_AGE: 15,

    PASSWORD_MIN_LENGTH: 6
};
