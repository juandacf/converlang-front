import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Calendar, Globe, Languages, Hash, FileText, CheckCircle2 } from 'lucide-react';
import { FormField, SelectField, TextAreaField } from '../forms/FormFields';
import { usersService, validationUtils, constants, catalogsService } from '../../../adminServices';

/**
 * Modal para crear nuevos usuarios en el sistema
 * * Características:
 * - Validación en tiempo real usando validationUtils
 * - Integración con usersService.createUser()
 * - Manejo de errores del backend
 * - Loading states durante la creación
 * - Diseño profesional estilo Power BI
 * * @param {boolean} isOpen - Controla la visibilidad del modal
 * @param {function} onClose - Callback al cerrar el modal
 * @param {function} onSuccess - Callback después de crear usuario exitosamente
 */
export const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        birth_date: '',
        gender_id: '',
        country_id: '',
        native_lang_id: '',
        target_lang_id: '',
        role_code: 'user',
        match_quantity: constants.DEFAULT_MATCH_QUANTITY,
        bank_id: '',
        description: '',
        profile_photo: ''
    });

    // Estados de UI
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // Nuevo estado para el check final

    // Estados para catálogos dinámicos
    const [catalogs, setCatalogs] = useState({
        countries: [],
        languages: [],
        genders: [],
        roles: []
    });

    useEffect(() => {
        if (isOpen) {
            loadCatalogs();
        }
    }, [isOpen]);

    const loadCatalogs = async () => {
        try {
            const [countries, languages, genders, roles] = await Promise.all([
                catalogsService.getCountries(),
                catalogsService.getLanguages(),
                catalogsService.getGenders(),
                catalogsService.getRoles()
            ]);

            setCatalogs({
                countries: countries || [],
                languages: languages || [],
                genders: genders || [],
                roles: roles || []
            });
        } catch (error) {
            console.error("Error cargando catálogos:", error);
            setServerError("Error cargando listas desplegables. Por favor recarga.");
        }
    };

    /**
     * Actualiza un campo del formulario
     */
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        setServerError('');
    };

    /**
     * Valida el formulario antes de enviar
     * Usa validationUtils del servicio
     */
    const validateForm = () => {
        const { isValid, errors: validationErrors } = validationUtils.validateUserData(formData);

        if (!isValid) {
            // Convertir array de errores a objeto para mostrar en campos específicos
            const errorObj = {};
            validationErrors.forEach(error => {
                if (error.includes('nombre')) errorObj.first_name = error;
                else if (error.includes('apellido')) errorObj.last_name = error;
                else if (error.includes('email')) errorObj.email = error;
                else if (error.includes('contraseña')) errorObj.password = error;
                else if (error.includes('fecha')) errorObj.birth_date = error;
                else if (error.includes('país')) errorObj.country_id = error;
                else if (error.includes('idioma nativo')) errorObj.native_lang_id = error;
                else if (error.includes('idioma objetivo')) errorObj.target_lang_id = error;
                else if (error.includes('idiomas')) {
                    errorObj.native_lang_id = error;
                    errorObj.target_lang_id = error;
                }
                else if (error.includes('matches')) errorObj.match_quantity = error;
            });
            setErrors(errorObj);
        }

        return isValid;
    };

    /**
     * Maneja el envío del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        // Validar formulario
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Preparar payload con tipos correctos
            const payload = {
                ...formData,
                gender_id: parseInt(formData.gender_id, 10),
                match_quantity: parseInt(formData.match_quantity, 10) || 10
            };

            // Llamar al servicio para crear usuario
            const newUser = await usersService.createUser(payload);

            // ACTIVAR ESTADO DE ÉXITO VISUAL
            setIsSuccess(true);

            // Resetear formulario
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                birth_date: '',
                gender_id: '',
                country_id: '',
                native_lang_id: '',
                target_lang_id: '',
                role_code: 'user',
                match_quantity: constants.DEFAULT_MATCH_QUANTITY,
                bank_id: '',
                description: '',
                profile_photo: ''
            });

            // Esperar un momento para mostrar el check antes de cerrar
            setTimeout(() => {
                onSuccess(newUser);
                onClose();
                setIsSuccess(false); // Resetear para la próxima apertura
            }, 1500);

        } catch (error) {
            // Mostrar error del servidor
            setServerError(error.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    // No renderizar si no está abierto
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-hidden">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200 relative">

                    {/* VISTA DE ÉXITO (CHECK) */}
                    {isSuccess && (
                        <div className="absolute inset-0 z-[70] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <CheckCircle2 className="text-green-600" size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">¡Usuario creado!</h3>
                            <p className="text-slate-500 mt-2 font-medium">Sincronizando base de datos...</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                <User className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Crear Nuevo Usuario</h2>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Alta de perfil en sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                        <div className="overflow-y-auto p-6 space-y-8">

                            {serverError && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs font-bold italic">!</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-red-800">Error de Registro</p>
                                        <p className="text-xs text-red-600">{serverError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                                {/* Sección 1 */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <User size={14} className="text-indigo-600" />
                                        Información Personal
                                    </h3>
                                    <div className="h-px bg-slate-100 mt-2"></div>
                                </div>

                                <FormField label="Nombre" value={formData.first_name} onChange={(val) => handleChange('first_name', val)} error={errors.first_name} required placeholder="Ej: Juan" />
                                <FormField label="Apellido" value={formData.last_name} onChange={(val) => handleChange('last_name', val)} error={errors.last_name} required placeholder="Ej: Pérez" />
                                <FormField label="Email" type="email" value={formData.email} onChange={(val) => handleChange('email', val)} error={errors.email} required placeholder="ejemplo@correo.com" />
                                <FormField label="Contraseña" type="password" value={formData.password} onChange={(val) => handleChange('password', val)} error={errors.password} required placeholder="Mínimo 6 caracteres" />
                                <FormField label="Fecha de Nacimiento" type="date" value={formData.birth_date} onChange={(val) => handleChange('birth_date', val)} error={errors.birth_date} required />
                                <SelectField
                                    label="Género"
                                    value={formData.gender_id}
                                    onChange={(val) => handleChange('gender_id', val)}
                                    error={errors.gender_id}
                                    options={catalogs.genders.map(g => ({ value: g.gender_id, label: g.gender_name }))}
                                    placeholder="Seleccionar género"
                                />

                                {/* Sección 2 */}
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Languages size={14} className="text-indigo-600" />
                                        Idiomas y Ubicación
                                    </h3>
                                    <div className="h-px bg-slate-100 mt-2"></div>
                                </div>

                                <SelectField
                                    label="País"
                                    value={formData.country_id}
                                    onChange={(val) => handleChange('country_id', val)}
                                    error={errors.country_id}
                                    required
                                    options={catalogs.countries.map(c => ({ value: c.country_code, label: c.country_name }))}
                                    placeholder="Seleccionar país"
                                />
                                <SelectField
                                    label="Idioma Nativo"
                                    value={formData.native_lang_id}
                                    onChange={(val) => handleChange('native_lang_id', val)}
                                    error={errors.native_lang_id}
                                    required
                                    options={catalogs.languages.map(l => ({ value: l.language_code, label: l.language_name }))}
                                    placeholder="Seleccionar idioma"
                                />
                                <SelectField
                                    label="Idioma Objetivo"
                                    value={formData.target_lang_id}
                                    onChange={(val) => handleChange('target_lang_id', val)}
                                    error={errors.target_lang_id}
                                    required
                                    options={catalogs.languages.map(l => ({ value: l.language_code, label: l.language_name }))}
                                    placeholder="Seleccionar idioma"
                                />

                                {/* Sección 3 */}
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Hash size={14} className="text-indigo-600" />
                                        Configuración de Cuenta
                                    </h3>
                                    <div className="h-px bg-slate-100 mt-2"></div>
                                </div>

                                <SelectField
                                    label="Rol"
                                    value={formData.role_code}
                                    onChange={(val) => handleChange('role_code', val)}
                                    error={errors.role_code}
                                    required
                                    options={catalogs.roles.map(r => ({ value: r.role_code, label: r.role_name }))}
                                />
                                <div className="md:col-span-2">
                                    <TextAreaField label="Descripción" value={formData.description} onChange={(val) => handleChange('description', val)} error={errors.description} placeholder="Información adicional..." rows={3} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 px-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 uppercase tracking-widest disabled:bg-slate-300"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <User size={14} />
                                        <span>Crear Usuario</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};