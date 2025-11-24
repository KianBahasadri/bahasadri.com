import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./HomeButton.module.css";

export default function HomeButton(): React.JSX.Element | null {
    const location = useLocation();
    
    if (location.pathname === "/") {
        return null;
    }
    
    return (
        <Link to="/" className={styles["button"]}>
            🏠
        </Link>
    );
}

