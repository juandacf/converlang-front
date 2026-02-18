import { useNavigate } from "react-router-dom";
import "./TermsAndConditions.css";

export function TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <div className="termsContainer">
            <div className="termsContent">
                <button
                    className="backButton"
                    onClick={() => window.close()}
                    title="Cerrar pestaña"
                >
                    ✕
                </button>

                <div className="termsHeader">
                    <img
                        src="/assets/img/converlang_horizontal.png"
                        alt="Converlang"
                        className="termsLogo"
                    />
                    <h1>Términos y Condiciones</h1>
                    <p className="lastUpdated">Última actualización: Febrero 2026</p>
                </div>

                <div className="termsBody">
                    <section>
                        <h2>1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar Converlang, usted acepta estar sujeto a estos Términos y Condiciones.
                            Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma.
                        </p>
                    </section>

                    <section>
                        <h2>2. Descripción del Servicio</h2>
                        <p>
                            Converlang es una plataforma de intercambio de idiomas que conecta a usuarios que desean
                            aprender y practicar diferentes idiomas. Proporcionamos herramientas de chat y emparejamiento
                            para facilitar el aprendizaje colaborativo.
                        </p>
                    </section>

                    <section>
                        <h2>3. Registro de Cuenta</h2>
                        <p>Para utilizar Converlang, debe:</p>
                        <ul>
                            <li>Tener al menos 15 años de edad</li>
                            <li>Proporcionar información precisa y actualizada durante el registro</li>
                            <li>Mantener la confidencialidad de su contraseña</li>
                            <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Conducta del Usuario</h2>
                        <p>Al utilizar Converlang, usted se compromete a:</p>
                        <ul>
                            <li>Tratar a otros usuarios con respeto y cortesía</li>
                            <li>No publicar contenido ofensivo, discriminatorio o inapropiado</li>
                            <li>No acosar, intimidar o amenazar a otros usuarios</li>
                            <li>No utilizar la plataforma para actividades ilegales</li>
                            <li>No suplantar la identidad de otra persona</li>
                            <li>No compartir información personal sensible de terceros sin su consentimiento</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Sistema de Reportes</h2>
                        <p>
                            Converlang cuenta con un sistema de reportes para mantener un ambiente seguro. Los usuarios
                            pueden reportar comportamientos inapropiados. Después de tres reportes, una cuenta puede ser
                            desactivada automáticamente mientras se realiza una revisión.
                        </p>
                    </section>

                    <section>
                        <h2>6. Privacidad y Protección de Datos</h2>
                        <p>
                            Nos comprometemos a proteger su información personal. Los datos recopilados incluyen:
                        </p>
                        <ul>
                            <li>Nombre y apellido</li>
                            <li>Correo electrónico</li>
                            <li>Fecha de nacimiento</li>
                            <li>País de residencia</li>
                            <li>Idiomas nativos y de aprendizaje</li>
                            <li>Descripción personal (opcional)</li>
                        </ul>
                        <p>
                            Esta información se utiliza exclusivamente para proporcionar y mejorar nuestros servicios.
                            No vendemos ni compartimos sus datos con terceros sin su consentimiento explícito.
                        </p>
                    </section>

                    <section>
                        <h2>7. Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido de la plataforma Converlang, incluyendo pero no limitado a texto, gráficos,
                            logotipos, iconos e imágenes, es propiedad de Converlang y está protegido por las leyes de
                            propiedad intelectual aplicables.
                        </p>
                    </section>

                    <section>
                        <h2>8. Limitación de Responsabilidad</h2>
                        <p>
                            Converlang se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables de:
                        </p>
                        <ul>
                            <li>La exactitud o calidad del intercambio lingüístico entre usuarios</li>
                            <li>Daños directos o indirectos derivados del uso de la plataforma</li>
                            <li>Interrupciones o errores en el servicio</li>
                            <li>Acciones o comportamientos de otros usuarios</li>
                        </ul>
                    </section>

                    <section>
                        <h2>9. Modificaciones del Servicio</h2>
                        <p>
                            Nos reservamos el derecho de modificar, suspender o descontinuar cualquier aspecto de Converlang
                            en cualquier momento, con o sin previo aviso.
                        </p>
                    </section>

                    <section>
                        <h2>10. Terminación de Cuenta</h2>
                        <p>
                            Podemos suspender o terminar su cuenta si:
                        </p>
                        <ul>
                            <li>Viola estos Términos y Condiciones</li>
                            <li>Recibe múltiples reportes de otros usuarios</li>
                            <li>Utiliza la plataforma para actividades fraudulentas o ilegales</li>
                        </ul>
                        <p>
                            Usted puede eliminar su cuenta en cualquier momento desde la configuración de su perfil.
                        </p>
                    </section>

                    <section>
                        <h2>11. Cambios a los Términos</h2>
                        <p>
                            Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento.
                            Los cambios significativos serán notificados a través de la plataforma. El uso continuado
                            del servicio después de dichos cambios constituye su aceptación de los nuevos términos.
                        </p>
                    </section>

                    <section>
                        <h2>12. Ley Aplicable</h2>
                        <p>
                            Estos Términos y Condiciones se rigen por las leyes aplicables en la jurisdicción donde
                            opera Converlang. Cualquier disputa será resuelta en los tribunales correspondientes.
                        </p>
                    </section>

                    <section>
                        <h2>13. Contacto</h2>
                        <p>
                            Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
                        </p>
                        <ul>
                            <li>Email: soporte@converlang.com</li>
                            <li>Formulario de contacto en la plataforma</li>
                        </ul>
                    </section>

                    <div className="termsFooter">
                        <p>
                            Al hacer clic en "Acepto los términos y condiciones" durante el registro, usted reconoce
                            que ha leído, entendido y acepta estar sujeto a estos Términos y Condiciones.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
