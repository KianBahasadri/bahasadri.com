/**
 * UtilityCard Component
 *
 * A card component for displaying utility tools on the dashboard.
 * Each card represents a utility tool with a title, description, and link.
 *
 * Features:
 * - Clickable card that links to utility pages
 * - Hover effects for better UX
 * - Responsive design
 * - Accessible link structure
 *
 * Type: Server Component
 *
 * @param props - Component props
 * @param props.title - The title of the utility tool
 * @param props.description - Brief description of what the utility does
 * @param props.href - The route path to the utility page
 * @param props.icon - Optional icon/emoji to display (default: "🔧")
 *
 * @returns JSX element representing a utility card
 *
 * @example
 * ```tsx
 * <UtilityCard
 *   title="JSON Formatter"
 *   description="Format and validate JSON data"
 *   href="/tools/json-formatter"
 *   icon="📝"
 * />
 * ```
 *
 * @see [docs/COMPONENTS.md](../docs/COMPONENTS.md) - Component patterns
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/AI_AGENT_STANDARDS.md](../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */

import Link from "next/link";
import styles from "./UtilityCard.module.css";

/**
 * Props interface for UtilityCard component
 */
interface UtilityCardProps {
    /** The title of the utility tool */
    title: string;
    /** Brief description of what the utility does */
    description: string;
    /** The route path to the utility page */
    href: string;
    /** Optional icon/emoji to display (default: "🔧") */
    icon?: string;
}

/**
 * UtilityCard Component
 *
 * Renders a card that links to a utility tool page.
 *
 * @param props - Component props
 * @returns React element representing a utility card
 */
export default function UtilityCard({
    title,
    description,
    href,
    icon = "🔧",
}: UtilityCardProps) {
    return (
        <Link href={href} className={styles.card}>
            <div className={styles.icon}>{icon}</div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <div className={styles.arrow}>→</div>
        </Link>
    );
}

