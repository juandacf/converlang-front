import React from "react";
import "./Dashboard.css";

export function CalendarCard() {
    // Mock data for August 2025 as in the design or generic
    const monthName = "August 2025";
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

    // Starting from Friday 1st August 2025 (Example alignment)
    // Let's just mock the grid visual to match "August 2025"
    // August 1, 2025 is a Friday.

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < 5; i++) days.push(null);
    // Days 1-31
    for (let i = 1; i <= 31; i++) days.push(i);

    return (
        <div className="calendar-card ios-card">
            <div className="calendar-header">
                <h3>{monthName}</h3>
            </div>
            <div className="calendar-grid">
                {daysOfWeek.map((d, i) => (
                    <div key={i} className="calendar-day-header">{d}</div>
                ))}
                {days.map((d, i) => (
                    <div key={i} className={`calendar-day ${d === 8 ? "active-day" : ""}`}>
                        {d}
                    </div>
                ))}
            </div>
            <button className="match-btn-small">calendario</button>
        </div>
    );
}
