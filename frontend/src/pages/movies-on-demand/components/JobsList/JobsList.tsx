import React from "react";
import MovieWithJobStatus from "../MovieWithJobStatus/MovieWithJobStatus";
import type { Movie, JobStatus } from "../../../../types/movies-on-demand";
import styles from "./JobsList.module.css";

interface JobsListProps {
    items: { movie: Movie; job: JobStatus }[];
    isLoading: boolean;
}

export default function JobsList({
    items,
    isLoading,
}: JobsListProps): React.JSX.Element {
    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <div className={styles["grid"]}>
                    {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className={styles["skeleton"]} />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className={styles["empty"]}>
                <p>No active jobs found.</p>
            </div>
        );
    }

    return (
        <div className={styles["container"]}>
            <div className={styles["grid"]}>
                {items.map((item) => (
                    <MovieWithJobStatus
                        key={item.job.job_id}
                        movie={item.movie}
                        job={item.job}
                    />
                ))}
            </div>
        </div>
    );
}

