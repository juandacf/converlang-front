
import { api } from './api';

/**
 * Service to fetch catalogs (Countries, Languages, Genders, Roles)
 * Centralizes all static/semi-static data fetching
 */
export const catalogsService = {

    /**
     * Get all countries
     * GET /countries
     */
    getCountries: async () => {
        try {
            const response = await api.get('/countries');
            return response;
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    },

    /**
     * Get all languages
     * GET /languages
     */
    getLanguages: async () => {
        try {
            const response = await api.get('/languages');
            return response;
        } catch (error) {
            console.error('Error fetching languages:', error);
            return [];
        }
    },

    /**
     * Get all gender types
     * GET /gender-type
     */
    getGenders: async () => {
        try {
            const response = await api.get('/gender-type');
            return response;
        } catch (error) {
            console.error('Error fetching genders:', error);
            return [];
        }
    },

    /**
     * Get all user roles
     * GET /user-roles
     */
    getRoles: async () => {
        try {
            const response = await api.get('/user-roles');
            return response;
        } catch (error) {
            console.error('Error fetching roles:', error);
            return [];
        }
    }
};
