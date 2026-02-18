import React, { useState, useEffect } from 'react';
import { X, User, Save, MapPin, Languages } from 'lucide-react'; // Añadí iconos extra para decorar
import { FormField, SelectField, TextAreaField } from '../forms/FormFields';
import { usersService, validationUtils, catalogsService } from '../../../adminServices';

/**
 * Modal para editar usuarios existentes - Versión Estilizada
 */
export const EditUserModal = ({ isOpen, onClose, onSuccess, userId }) => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        birth_date: '',
        gender_id: '',
        country_id: '',
        native_lang_id: '',
        target_lang_id: '',
        match_quantity: 10,

        description: '',
        profile_photo: ''
    });

    // Estados de UI
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [serverError, setServerError] = useState('');

    // Estados para catálogos dinámicos
    const [catalogs, setCatalogs] = useState({
        countries: [],
        languages: [],
        genders: [],
        roles: []
    });

    useEffect(() => {
        if (isOpen && userId) {
            loadUserData();
            loadCatalogs();
        }
    }, [isOpen, userId]);

    const loadCatalogs = async () => {
        try {
            const [countries, languages, genders] = await Promise.all([
                catalogsService.getCountries(),
                catalogsService.getLanguages(),
                catalogsService.getGenders()
            ]);

            setCatalogs(prev => ({
                ...prev,
                countries: countries || [],
                languages: languages || [],
                genders: genders || []
            }));
        } catch (error) {
            console.error("Error cargando catálogos:", error);
        }
    };

    const loadUserData = async () => {
        setLoadingUser(true);
        setServerError('');
        try {
            const user = await usersService.getUserById(userId);
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
                gender_id: user.gender_id?.toString() || '',
                country_id: user.country_id || '',
                native_lang_id: user.native_lang_id || '',
                target_lang_id: user.target_lang_id || '',
                match_quantity: user.match_quantity || 10,

                description: user.description || '',
                profile_photo: user.profile_photo || ''
            });
        } catch (error) {
            setServerError(error.message || 'Error al cargar usuario');
        } finally {
            setLoadingUser(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        setServerError('');
    };

    const validateForm = () => {
        const dataToValidate = { ...formData, password: 'dummy123' };
        const { isValid, errors: validationErrors } = validationUtils.validateUserData(dataToValidate);

        if (!isValid) {
            const errorObj = {};
            validationErrors.forEach(error => {
                if (error.includes('contraseña')) return;
                if (error.includes('nombre')) errorObj.first_name = error;
                else if (error.includes('apellido')) errorObj.last_name = error;
                else if (error.includes('email')) errorObj.email = error;
                else if (error.includes('fecha')) errorObj.birth_date = error;
                else if (error.includes('país')) errorObj.country_id = error;
                else if (error.includes('idioma nativo')) errorObj.native_lang_id = error;
                else if (error.includes('idioma objetivo')) errorObj.target_lang_id = error;
                else if (error.includes('matches')) errorObj.match_quantity = error;
            });
            setErrors(errorObj);
            return Object.keys(errorObj).length === 0;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validateForm()) return;
        setLoading(true);
        try {
            // Convertir campos numéricos
            const payload = {
                ...formData,
                gender_id: parseInt(formData.gender_id, 10),
                match_quantity: parseInt(formData.match_quantity, 10) || 10
            };

            await usersService.updateUser(userId, payload);
            onSuccess();
            onClose();
        } catch (error) {
            setServerError(error.message || 'Error al actualizar usuario');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Estilo común para los inputs para asegurar bordes visibles y consistencia
    const fieldStyle = "border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm";

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                {/* Reduje max-w-4xl a max-w-2xl para hacerlo más compacto */}
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 transform transition-all border border-slate-100">

                    {/* Header más limpio */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                <User size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Editar Perfil</h2>
                                <p className="text-xs text-slate-500 font-medium">ID Usuario: {userId}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-red-500">
                            <X size={20} />
                        </button>
                    </div>

                    {loadingUser ? (
                        <div className="p-16 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-500 text-sm font-medium">Recuperando datos...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6">
                            {serverError && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                    <span className="font-bold">Error:</span> {serverError}
                                </div>
                            )}

                            {/* Contenedor Grid optimizado con gap reducido (4 en vez de 6) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Sección: Datos Principales */}
                                <div className="md:col-span-2 flex items-center gap-2 mb-1 mt-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos Personales</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>

                                <FormField
                                    label="Nombre"
                                    value={formData.first_name}
                                    onChange={(val) => handleChange('first_name', val)}
                                    error={errors.first_name}
                                    required
                                    className={fieldStyle}
                                />

                                <FormField
                                    label="Apellido"
                                    value={formData.last_name}
                                    onChange={(val) => handleChange('last_name', val)}
                                    error={errors.last_name}
                                    required
                                    className={fieldStyle}
                                />

                                <FormField
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(val) => handleChange('email', val)}
                                    error={errors.email}
                                    required
                                    className={fieldStyle}
                                />

                                <FormField
                                    label="Nacimiento"
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(val) => handleChange('birth_date', val)}
                                    error={errors.birth_date}
                                    required
                                    className={fieldStyle}
                                />

                                {/* Reordenado para simetría: Género y País juntos */}
                                <SelectField
                                    label="Género"
                                    value={formData.gender_id}
                                    onChange={(val) => handleChange('gender_id', val)}
                                    error={errors.gender_id}
                                    className={fieldStyle}
                                    options={catalogs.genders.map(g => ({ value: g.gender_id, label: g.gender_name }))}
                                />

                                <SelectField
                                    label="País"
                                    value={formData.country_id}
                                    onChange={(val) => handleChange('country_id', val)}
                                    error={errors.country_id}
                                    required
                                    className={fieldStyle}
                                    options={catalogs.countries.map(c => ({ value: c.country_code, label: c.country_name }))}
                                />

                                {/* Sección: Idiomas */}
                                <div className="md:col-span-2 flex items-center gap-2 mb-1 mt-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuración de Idiomas</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>

                                <SelectField
                                    label="Idioma Nativo"
                                    value={formData.native_lang_id}
                                    onChange={(val) => handleChange('native_lang_id', val)}
                                    error={errors.native_lang_id}
                                    required
                                    className={fieldStyle}
                                    options={catalogs.languages.map(l => ({ value: l.language_code, label: l.language_name }))}
                                />

                                <SelectField
                                    label="Idioma Objetivo"
                                    value={formData.target_lang_id}
                                    onChange={(val) => handleChange('target_lang_id', val)}
                                    error={errors.target_lang_id}
                                    required
                                    className={fieldStyle}
                                    options={catalogs.languages.map(l => ({ value: l.language_code, label: l.language_name }))}
                                />

                                <div className="md:col-span-2 mt-2">
                                    <TextAreaField
                                        label="Descripción del Perfil"
                                        value={formData.description}
                                        onChange={(val) => handleChange('description', val)}
                                        error={errors.description}
                                        placeholder="Escribe una breve descripción..."
                                        rows={3}
                                        className={fieldStyle}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Guardar Cambios</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};