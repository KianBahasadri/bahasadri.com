import React from "react";
import styles from "./NetworkMesh.module.css";

interface Node {
    id: number;
    x: number;
    y: number;
    connections: number[];
    pulseDelay: number;
}

export default function NetworkMesh(): React.JSX.Element {
    const nodes: Node[] = [
        { id: 0, x: 10, y: 15, connections: [1, 3], pulseDelay: 0 },
        { id: 1, x: 25, y: 20, connections: [0, 2, 4], pulseDelay: 0.3 },
        { id: 2, x: 40, y: 10, connections: [1, 5], pulseDelay: 0.6 },
        { id: 3, x: 15, y: 40, connections: [0, 4, 6], pulseDelay: 0.9 },
        { id: 4, x: 35, y: 45, connections: [1, 3, 5, 7], pulseDelay: 1.2 },
        { id: 5, x: 55, y: 35, connections: [2, 4, 8], pulseDelay: 1.5 },
        { id: 6, x: 20, y: 65, connections: [3, 7], pulseDelay: 1.8 },
        { id: 7, x: 45, y: 70, connections: [4, 6, 8], pulseDelay: 2.1 },
        { id: 8, x: 70, y: 60, connections: [5, 7], pulseDelay: 2.4 },
        { id: 9, x: 80, y: 25, connections: [2, 5], pulseDelay: 2.7 },
        { id: 10, x: 5, y: 50, connections: [0, 3], pulseDelay: 3 },
        { id: 11, x: 90, y: 80, connections: [7, 8], pulseDelay: 3.3 },
    ];

    return (
        <div className={styles["networkMesh"]}>
            <svg className={styles["connections"]} viewBox="0 0 100 100" preserveAspectRatio="none">
                {nodes.map((node) =>
                    node.connections.map((targetId) => {
                        const target = nodes[targetId];
                        if (!target) return null;
                        return (
                            <line
                                key={`${String(node.id)}-${String(targetId)}`}
                                x1={String(node.x)}
                                y1={String(node.y)}
                                x2={String(target.x)}
                                y2={String(target.y)}
                                className={styles["connectionLine"]}
                                style={{
                                    animationDelay: `${String(node.pulseDelay)}s`,
                                }}
                            />
                        );
                    })
                )}
            </svg>
            <div className={styles["nodes"]}>
                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className={styles["node"]}
                        style={{
                            left: `${String(node.x)}%`,
                            top: `${String(node.y)}%`,
                            animationDelay: `${String(node.pulseDelay)}s`,
                        }}
                    >
                        <div className={styles["nodeCore"]} />
                        <div className={styles["nodeRing"]} />
                    </div>
                ))}
            </div>
            <div className={styles["gradientOverlay"]} />
        </div>
    );
}

