// services/api.js
// Configuración base para todas las llamadas a la API

import { API_URL } from "../config/api";

const API_BASE_URL = API_URL

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Obtiene el token JWT del localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene los headers por defecto incluyendo autenticación
   */
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Maneja errores HTTP de forma centralizada
   */
  async handleResponse(response) {
    if (!response.ok) {
      // Si es 401, puede ser token expirado o cuenta inactiva
      if (response.status === 401) {
        // Intentar obtener el mensaje de error
        const errorData = await response.json().catch(() => ({ message: '' }));

        // Si el mensaje contiene ACCOUNT_INACTIVE, es un usuario bloqueado
        if (errorData.message && errorData.message.includes('ACCOUNT_INACTIVE')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirigir al login con estado para mostrar el modal de cuenta inactiva
          window.location.href = '/?inactive=true';
          throw new Error('Tu cuenta ha sido desactivada. Por favor contacta a converlang@gmail.com');
        }

        // Si no es ACCOUNT_INACTIVE, es sesión expirada normal
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      // Si es 403, no tiene permisos
      if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción.');
      }

      // Otros errores
      const error = await response.json().catch(() => ({ message: 'Error en el servidor' }));
      throw new Error(error.message || 'Error en la petición');
    }

    // Intentar parsear JSON, si falla retornar texto
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }

  /**
   * Método GET
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Método POST
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Método PUT
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Método PATCH
   */
  async patch(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Método DELETE
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }
}

// Exportar instancia única (Singleton)
export const api = new ApiService();

// Exportar también la clase por si se necesita crear instancias personalizadas
export default ApiService;