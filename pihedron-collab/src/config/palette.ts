import { Gradient } from '@motion-canvas/2d';
import { Color } from '@motion-canvas/core';

// 🌒 Dark Mode UI
export default {
    bg: "#050505",                 // dark gray background
    card: "#2C2C2E",
    border: "#3A3A3C",
    shadow: "rgba(0, 0, 0, 0.5)",

    text: "#F2F2F7",
    textSecondary: "#C7C7CC",
    textMuted: "#8E8E93",

    primary: "#4F9CFF",            // same vibrant blue
    secondary: "#5DFFA3",          // mint green stands out
    accent: "#FFB84D",             // warm accent remains

    success: "#5EF38C",
    warning: "#FF6B6B",
    info: "#7FD7FF",
    purple: "#C490FF",
    indigo: "#9B99FF",
    yellow: "#FFE773",
    pink: "#FF6E9C",
    cyan: "#78E5FF",

    highlight: "#FFD858",
    muted: "#2A2A2D",
    glass: "rgba(44, 44, 46, 0.65)",
};

export const introPalette = {
    bg: new Color("#2B1A4D"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#D6C3FF"),
    accent: new Color("#B69EFF"),
    border: new Color("#7157A3"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#A287F4"),
    shadow: new Color("rgba(0, 0, 0, 0.5)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#2B1A4D") },
            { offset: 1, color: new Color("#7F61FF") },
        ],
        from: 0,
        to: 2000,
    }),
};

export const discretePalette = {
    bg: new Color("#003F2B"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#A8FFE1"),
    accent: new Color("#6FFFD2"),
    border: new Color("#49D9B0"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#4EFFC0"),
    shadow: new Color("rgba(0, 64, 32, 0.3)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#003F2B") },
            { offset: 1, color: new Color("#0DD38C") },
        ],
        from: 0,
        to: 2000,
    }),
};

export const algebraPalette = {
    bg: new Color("#1f1f1f"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#FFCCC2"),
    accent: new Color("#FF9A8A"),
    border: new Color("#D36D6D"),
    text: new Color("#FAFAFA"),
    highlight: new Color("#FFD875"),
    shadow: new Color("rgba(128, 0, 0, 0.25)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#080b36") },
            { offset: 1, color: new Color("#000000") },
        ],
        fromY: 0,
        toY: 1000,
    }),
};

export const geometryPalette = {
    bg: new Color("#1E103A"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#D6CFFF"),
    accent: new Color("#A98FFF"),
    border: new Color("#6D42DF"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#D1B7FF"),
    shadow: new Color("rgba(64, 0, 128, 0.3)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#1E103A") },
            { offset: 1, color: new Color("#6D42DF") },
        ],
        from: 0,
        to: 2000,
    }),
};

export const probabilityPalette = {
    bg: new Color("#002244"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#CFEFFF"),
    accent: new Color("#FF99CC"),
    border: new Color("#599FD9"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#FFAAD4"),
    shadow: new Color("rgba(0, 64, 128, 0.3)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#002244") },
            { offset: 1, color: new Color("#007FFF") },
        ],
        from: 0,
        to: 2000,
    }),
};
