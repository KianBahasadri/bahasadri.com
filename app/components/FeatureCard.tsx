/**
 * Feature Card Component
 * 
 * A reusable component for displaying feature information.
 * Extracted to a separate file for better code splitting and reusability.
 * 
 * Performance optimizations:
 * - Server Component by default (no client-side JavaScript)
 * - Minimal props for optimal rendering
 * 
 * @param title - The feature title
 * @param description - The feature description
 */

import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  title: string;
  description: string;
}

/**
 * Feature Card Component
 * 
 * Displays a feature card with title and description.
 * This is a Server Component, so it renders on the server/edge.
 */
export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  );
}
