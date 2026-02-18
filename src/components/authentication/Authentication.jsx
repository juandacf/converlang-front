import './Authentication.css';
import { motion } from 'framer-motion';
import LottieIcon from '../common/LottieIcon'; // Import the new component
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube
} from 'lucide-react';

export function Authentication() {

  const steps = [
    {
      icon: <LottieIcon src="/assets/img/globe.json" alt="Mundo" className="step-lottie-icon" />,
      title: "Explora el Mundo",
      description: "Conecta con personas de cualquier continente desde la comodidad de tu casa."
    },
    {
      icon: <LottieIcon src="/assets/img/match.json" alt="Match" className="step-lottie-icon" />,
      title: "Encuentra tu Match",
      description: "Algoritmos inteligentes que te conectan con hablantes nativos afines a tus intereses."
    },
    {
      icon: <LottieIcon src="/assets/img/chat.json" alt="Practica" className="step-lottie-icon" />,
      title: "Practica en Real",
      description: "Chat, video y herramientas de corrección en tiempo real para un aprendizaje fluido."
    },
    {
      icon: <LottieIcon src="/assets/img/mejora.json" alt="Mejora" className="step-lottie-icon" />,
      title: "Mejora Sin Filtros",
      description: "La forma más rápida de hablar como un nativo es practicando con uno."
    }
  ];

  return (
    <div className="landing-container">
      {/* Header Fijo */}
      <header className="landing-header">
        <div className="logo-container">
          <img src="/assets/img/converlang_horizontal.png" alt="Converlang Logo" className="logo-desktop" />
          <img src="/assets/img/converlang_mobile.png" alt="Converlang Logo" className="logo-mobile" />
        </div>
        <nav className="landing-nav">
          <a href="/login" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Iniciar Sesión
          </a>
          <a href="/signup" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Crear Cuenta
          </a>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="landing-main">
        {/* Sección Hero */}
        <section className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">Conecta. Aprende. Crece.</h1>
            <p className="hero-description">
              Converlang es la plataforma definitiva para el intercambio de idiomas.
              Rompe barreras culturales, practica con hablantes nativos y lleva tus habilidades lingüísticas al siguiente nivel.
              Únete a nuestra comunidad global hoy mismo.
            </p>
            <div className="hero-actions">
              <a href="/signup" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                Empezar Ahora
              </a>
              <a href="/login" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Ya tengo cuenta &rarr;
              </a>
            </div>
          </div>

          <motion.div
            className="hero-image-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/assets/img/converlang_contexto_grafico.png"
              alt="Converlang Contexto"
              className="hero-image"
            />
          </motion.div>
        </section>

        {/* Sección Cómo Funciona */}
        <section className="features-section">
          <div className="section-header">
            <span className="badge">Cómo funciona</span>
            <h2 className="section-title">Tu camino hacia el aprendizaje</h2>
          </div>

          <div className="features-grid">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="feature-icon">{step.icon}</div>
                <h3 className="feature-title">{step.title}</h3>
                <p className="feature-description">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/assets/img/converlang_horizontal.png" alt="Converlang" className="footer-logo logo-desktop" />
            <img src="/assets/img/converlang_mobile.png" alt="Converlang" className="footer-logo logo-mobile" />
            <p className="footer-tagline">El mundo es tu aula. Habla con confianza.</p>
            <div className="social-links">
              <a href="#"><Instagram size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
              <a href="#"><Facebook size={20} /></a>
              <a href="#"><Youtube size={20} /></a>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-column">
              <h4>Compañía</h4>
              <a href="#">Quiénes somos</a>
              <a href="#">Blog</a>
              <a href="#">Carreras</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Términos y condiciones</a>
              <a href="#">Privacidad</a>
              <a href="#">Cookies</a>
            </div>
            <div className="footer-column">
              <h4>Soporte</h4>
              <a href="#">Guía básica</a>
              <a href="#">Centro de ayuda</a>
              <a href="#">Contacto</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Converlang. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
