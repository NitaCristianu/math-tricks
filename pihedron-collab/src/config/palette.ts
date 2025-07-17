import { Gradient } from '@motion-canvas/2d';
import { Color } from '@motion-canvas/core';

// 🎨 Default UI (stil Apple vivid)
export default {
    bg: "#EDEBFF",                 // pastel background
    card: "#FFFFFF",
    border: "#D1D1D6",
    shadow: "rgba(0, 0, 0, 0.06)",

    text: "#1C1C1E",
    textSecondary: "#3A3A3C",
    textMuted: "#8E8E93",

    primary: "#4F9CFF",            // lightened vivid blue
    secondary: "#5DFFA3",          // minty green
    accent: "#FFB84D",             // warm orange

    success: "#5EF38C",
    warning: "#FF6B6B",
    info: "#7FD7FF",
    purple: "#C490FF",
    indigo: "#9B99FF",
    yellow: "#FFE773",
    pink: "#FF6E9C",
    cyan: "#78E5FF",

    highlight: "#FFD858",
    muted: "#F5F5FA",
    glass: "rgba(255, 255, 255, 0.65)",
};

export const introPalette = {
    bg: new Color("#7F61FF"),  // bold purple background
    primary: new Color("#FFFFFF"),
    secondary: new Color("#EDEBFF"),
    accent: new Color("#D6C3FF"),
    border: new Color("#B7A3F2"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#A287F4"),
    shadow: new Color("rgba(0, 0, 0, 0.15)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#7F61FF") },
            { offset: 1, color: new Color("#BFA5FF") },
        ],
        from: 0,
        to: 2000,
    }),
};

export const discretePalette = {
    bg: new Color("#0DD38C"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#CFFFE9"),
    accent: new Color("#8EFFD1"),
    border: new Color("#A1F3CC"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#54FFC2"),
    shadow: new Color("rgba(0, 64, 32, 0.15)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#0DD38C") },
            { offset: 1, color: new Color("#45FBC0") },
        ],
        from: 0,
        to: 2000,


    }),
};

export const algebraPalette = {
    bg: new Color("#FF4D4D"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#FFEFE0"),
    accent: new Color("#FFC49C"),
    border: new Color("#FFB08A"),
    text: new Color("#FAFAFA"),
    highlight: new Color("#FFD875"),
    shadow: new Color("rgba(128, 0, 0, 0.12)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#FF4D4D") },
            { offset: 1, color: new Color("#ec2c59") },
        ],
        from: 0,
        to: 2000,
    }),
};

export const geometryPalette = {
    bg: new Color("#6D42DF"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#E8DFFF"),
    accent: new Color("#C9B6FF"),
    border: new Color("#A183E8"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#D1B7FF"),
    shadow: new Color("rgba(64, 0, 128, 0.12)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#6D42DF") },
            { offset: 1, color: new Color("#A87CFF") },
        ],
        from: 0,
        to: 2000,
    }),
};

export const probabilityPalette = {
    bg: new Color("#007FFF"),
    primary: new Color("#FFFFFF"),
    secondary: new Color("#DFF4FF"),
    accent: new Color("#FF99CC"),
    border: new Color("#80D0FF"),
    text: new Color("#F5F5F7"),
    highlight: new Color("#FFAAD4"),
    shadow: new Color("rgba(0, 64, 128, 0.12)"),
    gradient: new Gradient({
        stops: [
            { offset: 0, color: new Color("#007FFF") },
            { offset: 1, color: new Color("#FF2D55") },
        ],
        from: 0,
        to: 2000,
    }),
};
