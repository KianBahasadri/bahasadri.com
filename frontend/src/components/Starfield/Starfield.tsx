import React, { useEffect, useRef } from "react";
import styles from "./Starfield.module.css";

export default function Starfield(): React.JSX.Element {
    const starfieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const starfield = starfieldRef.current;
        if (!starfield) return;

        const starCount = 50;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            star.className = styles.star;

            star.style.left = Math.random() * 100 + "%";
            star.style.top = Math.random() * 100 + "%";

            const size = Math.random() * 2 + 1;
            star.style.width = size + "px";
            star.style.height = size + "px";

            if (Math.random() > 0.8) {
                star.style.background = "#ff69b4";
                star.style.boxShadow = "0 0 3px #ff1493";
            }

            star.style.animationDelay = Math.random() * 3 + "s";

            starfield.appendChild(star);
        }

        return () => {
            while (starfield.firstChild) {
                starfield.removeChild(starfield.firstChild);
            }
        };
    }, []);

    return <div ref={starfieldRef} className={styles.starfield}></div>;
}

