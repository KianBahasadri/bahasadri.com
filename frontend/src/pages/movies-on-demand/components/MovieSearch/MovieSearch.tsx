import React, { useState, useEffect } from "react";
import styles from "./MovieSearch.module.css";

interface MovieSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function MovieSearch({
    onSearch,
    placeholder = "Search movies...",
}: MovieSearchProps): React.JSX.Element {
    const [query, setQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 400);

        return () => {
            clearTimeout(timer);
        };
    }, [query, onSearch]);

    return (
        <div className={styles["searchContainer"]}>
            <input
                type="text"
                className={styles["searchInput"]}
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
                aria-label="Search movies"
            />
        </div>
    );
}

