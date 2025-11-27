import React, { useMemo } from "react";
import styles from "./NetworkMesh.module.css";

interface Node {
    id: number;
    x: number;
    y: number;
    connections: number[];
    pulseDelay: number;
}

function generateRandomNodes(count: number): Node[] {
    const nodes: Node[] = [];
    const minDistance = 8;
    const maxConnections = 4;
    const minConnections = 1;
    const xRange = 150;
    const yRange = 150;
    const centerX = 50;
    const centerY = 50;

    for (let i = 0; i < count; i++) {
        let x: number;
        let y: number;
        let attempts = 0;
        do {
            // Use deterministic randomness for visual effect (not security-critical)
            x = centerX + (Math.random() - 0.5) * xRange;
            y = centerY + (Math.random() - 0.5) * yRange;
            attempts++;
        } while (
            attempts < 50 &&
            nodes.some(
                (node) =>
                    Math.sqrt(
                        Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)
                    ) < minDistance
            )
        );

        // Use deterministic randomness for visual effect (not security-critical)
        nodes.push({
            id: i,
            x,
            y,
            connections: [],
            pulseDelay: Math.random() * 4,
        });
    }

    for (const node of nodes) {
        // Use deterministic randomness for visual effect (not security-critical)
        const connectionCount =
            Math.floor(Math.random() * (maxConnections - minConnections + 1)) +
            minConnections;
        const sortedCandidates = nodes
            .filter((n) => n.id !== node.id)
            .map((n) => ({
                node: n,
                distance: Math.sqrt(
                    Math.pow(node.x - n.x, 2) + Math.pow(node.y - n.y, 2)
                ),
            }))
            .toSorted((a, b) => a.distance - b.distance);
        const candidates = sortedCandidates
            .slice(0, connectionCount)
            .map((c) => c.node.id);

        node.connections = candidates;
    }

    return nodes;
}

export default function NetworkMesh(): React.JSX.Element {
    const nodes = useMemo(() => generateRandomNodes(40), []);

    return (
        <div className={styles["networkMesh"]}>
            <svg
                className={styles["connections"]}
                viewBox="0 0 150 150"
                preserveAspectRatio="none"
            >
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
                {nodes.map((node) => {
                    const xPercent = (node.x / 150) * 100;
                    const yPercent = (node.y / 150) * 100;
                    return (
                        <div
                            key={node.id}
                            className={styles["node"]}
                            style={{
                                left: `${String(xPercent)}%`,
                                top: `${String(yPercent)}%`,
                                animationDelay: `${String(node.pulseDelay)}s`,
                            }}
                        >
                            <div className={styles["nodeCore"]} />
                            <div className={styles["nodeRing"]} />
                        </div>
                    );
                })}
            </div>
            <div className={styles["gradientOverlay"]} />
        </div>
    );
}

