import React from 'react';
import { X } from 'lucide-react';

/**
 * Campo de formulario reutilizable con validación y estilos consistentes
 * Diseño profesional estilo Power BI
 * 
 * @param {string} label - Etiqueta del campo
 * @param {string} type - Tipo de input (text, email, password, date, number)
 * @param {string} value - Valor actual del campo
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {string} error - Mensaje de error (si existe)
 * @param {boolean} required - Si el campo es requerido
 * @param {string} placeholder - Placeholder del input
 * @param {boolean} disabled - Si el campo está deshabilitado
 */
export const FormField = ({
    label,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    disabled = false,
    name
}) => {
    return (
        <div className="mb-4">
            {/* Label con indicador de requerido */}
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Input field */}
            <input
                type={type}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          ${error
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }
          ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}
          text-slate-800 placeholder-slate-400
          focus:outline-none
        `}
            />

            {/* Error message */}
            {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                </p>
            )}
        </div>
    );
};

/**
 * Campo select reutilizable con estilos consistentes
 * 
 * @param {string} label - Etiqueta del campo
 * @param {string} value - Valor seleccionado
 * @param {function} onChange - Callback cuando cambia la selección
 * @param {Array} options - Array de opciones [{value, label}]
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Si el campo es requerido
 * @param {boolean} disabled - Si el campo está deshabilitado
 */
export const SelectField = ({
    label,
    value,
    onChange,
    options = [],
    error,
    required = false,
    disabled = false,
    name,
    placeholder = 'Seleccionar...'
}) => {
    return (
        <div className="mb-4">
            {/* Label */}
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Select field */}
            <select
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          ${error
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }
          ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'cursor-pointer'}
          text-slate-800
          focus:outline-none
        `}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {/* Error message */}
            {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                </p>
            )}
        </div>
    );
};

/**
 * Textarea reutilizable para campos de texto largo
 */
export const TextAreaField = ({
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    disabled = false,
    name,
    rows = 4
}) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <textarea
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          ${error
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }
          ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}
          text-slate-800 placeholder-slate-400
          focus:outline-none resize-none
        `}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                </p>
            )}
        </div>
    );
};
