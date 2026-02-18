import './Footer.css';
import {
    Instagram,
    Twitter,
    Facebook,
    Youtube
} from 'lucide-react';
import { Translations } from '../../translations/translations';

export function Footer({ language = "ES", darkMode = false }) {
    const translations = Translations[language]?.footer || {};

    return (
        <footer className={`landing-footer ${darkMode ? 'dark-mode' : ''}`}>
            <div className="footer-content">
                <div className="footer-brand">
                    <img src="/assets/img/converlang_horizontal.png" alt="Converlang" className="footer-logo logo-desktop" />
                    <img src="/assets/img/converlang_mobile.png" alt="Converlang" className="footer-logo logo-mobile" />
                    <p className="footer-tagline">{translations.tagline}</p>
                    <div className="social-links">
                        <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                        <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                        <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                        <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
                    </div>
                </div>

                <div className="footer-grid">
                    <div className="footer-column">
                        <h4>{translations.company?.title}</h4>
                        <a href="#">{translations.company?.about}</a>
                        <a href="#">{translations.company?.blog}</a>
                        <a href="#">{translations.company?.careers}</a>
                    </div>
                    <div className="footer-column">
                        <h4>{translations.legal?.title}</h4>
                        <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">{translations.legal?.terms}</a>
                        <a href="#">{translations.legal?.privacy}</a>
                        <a href="#">{translations.legal?.cookies}</a>
                    </div>
                    <div className="footer-column">
                        <h4>{translations.support?.title}</h4>
                        <a href="#">{translations.support?.guide}</a>
                        <a href="#">{translations.support?.help}</a>
                        <a href="#">{translations.support?.contact}</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Converlang. {translations.copyright}</p>
            </div>
        </footer>
    );
}
