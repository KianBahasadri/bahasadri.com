import React, { useEffect, useRef } from "react";
import styles from "./Starfield.module.css";

function getVisualRandom(): number {
    // Use crypto.getRandomValues for visual effects to satisfy linter
    // This is overkill for visual effects but avoids pseudorandom warnings
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const value = array[0];
    if (value === undefined) {
        // This should never happen, but TypeScript requires the check
        return 0.5;
    }
    return value / (0xFF_FF_FF_FF + 1);
}

export default function Starfield(): React.JSX.Element {
    const starfieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const starfield = starfieldRef.current;
        if (!starfield) return;

        const starCount = 50;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            const starClassName = styles["star"];
            if (!starClassName) continue;
            star.className = starClassName;

            const leftPercent = getVisualRandom() * 100;
            const topPercent = getVisualRandom() * 100;
            star.style.left = `${String(leftPercent)}%`;
            star.style.top = `${String(topPercent)}%`;

            const size = getVisualRandom() * 2 + 1;
            star.style.width = `${String(size)}px`;
            star.style.height = `${String(size)}px`;

            const randomValue = getVisualRandom();
            if (randomValue > 0.8) {
                star.style.background = "#ff69b4";
                star.style.boxShadow = "0 0 3px #ff1493";
            }

            const delaySeconds = getVisualRandom() * 3;
            star.style.animationDelay = `${String(delaySeconds)}s`;

            starfield.append(star);
        }

        return (): void => {
            while (starfield.firstChild) {
                const child = starfield.firstChild;
                child.remove();
            }
        };
    }, []);

    return <div ref={starfieldRef} className={styles["starfield"]} />;
}

