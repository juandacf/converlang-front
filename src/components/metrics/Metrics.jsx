import "./Metrics.css";
import { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { authFetch } from "../../config/authFetch";
import { Translations } from "../../translations/translations";
import { NavBar } from "../dashboard/Dashboard";

import { getAvatarUrl } from "../../utils/avatarUtils";
import { ArrowLeft } from "lucide-react";

const API_BACKEND = API_URL;
const translations = Translations;

const PIE_COLORS = [
    "#5b6cff", "#a855f7", "#ec4899", "#f97316",
    "#14b8a6", "#f59e0b", "#6366f1", "#8b5cf6",
    "#06b6d4", "#10b981",
];

export function Metrics() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const [language, setLanguage] = useState("ES");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.sub;

    const t = translations[language]?.metricsModule || {};

    // ── Cargar preferencias (tema + idioma) ──
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await authFetch(
                    `${API_BACKEND}/preferences/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                setDarkMode(!data.theme);
                localStorage.setItem("theme", !data.theme ? "dark" : "light");
                setLanguage(data.language_code);
            } catch (error) {
                console.error("Error cargando preferencias:", error);
            }
        };
        fetchPreferences();
    }, []);

    // ── Sincronizar dark mode con body ──
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    // ── Cargar métricas ──
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await authFetch(
                    `${API_BACKEND}/metrics/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                setMetrics(data);
            } catch (error) {
                console.error("Error cargando métricas:", error);
                setMetrics({
                    preferredUser: null,
                    matchCountries: [],
                    chatWords: [],
                    newMatches: 0,
                    avgInteractionsPerCall: 0,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    // ── Skeleton loader ──
    const renderSkeleton = () => (
        <div className="metricsGrid">
            <div className="metricsCard statsSection">
                <div className="preferredUserCard">
                    <div className="metricsSkeleton skeletonCircle" />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div className="metricsSkeleton skeletonLine skeletonLineLong" />
                        <div className="metricsSkeleton skeletonLine skeletonLineShort" />
                    </div>
                </div>
                <div className="statsRow">
                    <div className="statItem" style={{ height: 100 }}>
                        <div className="metricsSkeleton skeletonLine" style={{ width: 60 }} />
                    </div>
                    <div className="statItem" style={{ height: 100 }}>
                        <div className="metricsSkeleton skeletonLine" style={{ width: 60 }} />
                    </div>
                </div>
            </div>
            <div className="metricsCard pieSection" style={{ height: 300 }}>
                <div className="metricsSkeleton" style={{ width: "100%", height: "100%", borderRadius: 24 }} />
            </div>
            <div className="metricsCard wordsSection" style={{ height: 300 }}>
                <div className="metricsSkeleton" style={{ width: "100%", height: "100%", borderRadius: 24 }} />
            </div>
        </div>
    );

    // ── Sección 1: Stats principales ──
    const renderStatsSection = () => {
        const preferred = metrics?.preferredUser;
        return (
            <div className="metricsCard statsSection">
                <h3 className="statsSectionTitle">
                    {t.overviewTitle || "Resumen General"}
                </h3>

                {/* Preferred User */}
                {preferred ? (
                    <div className="preferredUserCard">
                        <img
                            className="preferredUserPhoto"
                            src={getAvatarUrl(preferred.profile_photo)}
                            alt={preferred.first_name}
                        />
                        <div className="preferredUserInfo">
                            <p className="preferredUserLabel">
                                {t.preferredUser || "Usuario Preferido"}
                            </p>
                            <p className="preferredUserName">
                                {preferred.first_name} {preferred.last_name}
                            </p>
                            <p className="preferredUserInteractions">
                                {preferred.interaction_count} {t.interactions || "interacciones"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="metricsEmpty">
                        <span className="metricsEmptyIcon">👤</span>
                        <p className="metricsEmptyText">
                            {t.noPreferredUser || "Aún no tienes un usuario preferido"}
                        </p>
                    </div>
                )}

                {/* Stats Row */}
                <div className="statsRow">
                    <div className="statItem">
                        <span className="statValue">
                            {Math.round(metrics?.avgInteractionsPerCall ?? 0)}
                        </span>
                        <span className="statLabel">
                            {t.avgPerCall || "Mensajes enviados por llamada"}
                        </span>
                        <div className="statProgressBar">
                            <div
                                className="statProgressFill"
                                style={{
                                    width: `${Math.min((metrics?.avgInteractionsPerCall ?? 0) * 5, 100)}%`
                                }}
                            />
                        </div>
                    </div>
                    <div className="statItem">
                        <span className="statValue">
                            {metrics?.newMatches ?? 0}
                        </span>
                        <span className="statLabel">
                            {t.newMatches || "Matches nuevos (30 días)"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // ── Sección 2: Pie Chart de países ──
    const renderPieSection = () => {
        const countries = (metrics?.matchCountries || []).map(c => ({
            ...c,
            match_count: Number(c.match_count)
        }));
        return (
            <div className="metricsCard pieSection">
                <h3 className="pieSectionTitle">
                    {t.countriesTitle || "Países de tus Matches"}
                </h3>

                {countries.length > 0 ? (
                    <>
                        <div className="pieChartContainer">
                            <ResponsiveContainer width="100%" height={220} minWidth={200}>
                                <PieChart>
                                    <Pie
                                        data={countries}
                                        dataKey="match_count"
                                        nameKey="country_name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={35}
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {countries.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            fontSize: "0.85rem",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="pieLegend">
                            {countries.map((c, i) => (
                                <div key={c.country_name} className="pieLegendItem">
                                    <span
                                        className="pieLegendDot"
                                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                                    />
                                    {c.country_name} ({c.match_count})
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="metricsEmpty">
                        <span className="metricsEmptyIcon">🌍</span>
                        <p className="metricsEmptyText">
                            {t.noCountries || "Haz match para ver la distribución de países"}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // ── Sección 3: Palabras más usadas ──
    const renderWordsSection = () => {
        const words = (metrics?.chatWords || []).slice(0, 16);
        const maxFreq = words.length > 0 ? words[0].frequency : 1;

        const getWordSize = (freq) => {
            const ratio = freq / maxFreq;
            if (ratio > 0.6) return "word-lg";
            if (ratio > 0.3) return "word-md";
            return "word-sm";
        };

        return (
            <div className="metricsCard wordsSection">
                <h3 className="wordsSectionTitle">
                    {t.wordsTitle || "Palabras más usadas"}
                </h3>

                {words.length > 0 ? (
                    <div className="wordsCloud">
                        {words.map((w) => (
                            <span
                                key={w.word}
                                className={`wordTag ${getWordSize(w.frequency)}`}
                                title={`${w.word}: ${w.frequency}`}
                            >
                                {w.word}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="metricsEmpty">
                        <span className="metricsEmptyIcon">💬</span>
                        <p className="metricsEmptyText">
                            {t.noWords || "Empieza a chatear para ver tu vocabulario"}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className={darkMode ? "dark-mode dark-mode-root" : "dark-mode-root"}>
                <NavBar language={language} />
                <div className="metricsPageWrapper">
                    <div className="metricsContentWrapper">
                        <div className="metricsHeader">
                            <button
                                className="metricsBackBtn"
                                onClick={() => navigate("/dashboard")}
                            >
                                <ArrowLeft size={20} />
                                {t.backToDashboard || "Volver"}
                            </button>
                            <h2 className="metricsTitle">
                                {t.pageTitle || "Mis Métricas"}
                            </h2>
                            <div style={{ width: 80 }} /> {/* Spacer */}
                        </div>

                        {loading ? renderSkeleton() : (
                            <div className="metricsGrid">
                                {renderStatsSection()}
                                {renderPieSection()}
                                {renderWordsSection()}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}
