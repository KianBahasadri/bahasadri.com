import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { provideRtkDesignSystem } from "@cloudflare/realtimekit-react-ui";
import App from "./App";
import "./styles.css";

// Initialize RealtimeKit UI design system
provideRtkDesignSystem(document.body, {
    theme: "darkest",
    colors: {
        background: {
            1000: "#1a1a2e",
            900: "#16213e",
            800: "#1f2937",
            700: "#374151",
            600: "#4b5563",
        },
        "video-bg": "#1a1a2e",
        text: "#f5f5f5",
        "text-on-brand": "#ffffff",
        brand: {
            500: "#ff69b4",
            600: "#ff1493",
            700: "#db2777",
        },
    },
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const rootElement = document.querySelector("#root");
if (!rootElement) {
    throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);
