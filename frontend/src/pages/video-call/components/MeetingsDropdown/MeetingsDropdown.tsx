import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAllPresets } from "../../../../lib/api";
import type { Preset } from "../../../../types/video-call";
import styles from "./MeetingsDropdown.module.css";

interface MeetingsDropdownProps {
    readonly onSelectPreset?: (presetId: string) => void;
}

export default function MeetingsDropdown({
    onSelectPreset,
}: MeetingsDropdownProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["video-call", "presets"],
        queryFn: listAllPresets,
    });

    const presets: Preset[] = data?.data ?? [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return (): void => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = (): void => {
        setIsOpen(!isOpen);
    };

    const handleSelectPreset = (presetId: string): void => {
        const preset = presets.find((p) => p.id === presetId);
        if (preset) {
            setSelectedPreset(preset);
            onSelectPreset?.(presetId);
        }
        setIsOpen(false);
    };

    const renderPresetItem = (preset: Preset): React.JSX.Element => {
        return (
            <li key={preset.id}>
                <button
                    type="button"
                    className={styles["meetingItem"]}
                    onClick={() => {
                        handleSelectPreset(preset.id);
                    }}
                >
                    <div className={styles["meetingName"]}>
                        {preset.name ?? preset.id}
                    </div>
                </button>
            </li>
        );
    };

    const renderDropdownContent = (): React.JSX.Element => {
        if (isLoading) {
            return (
                <div className={styles["emptyState"]}>
                    Loading presets... ⏳
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles["emptyState"]}>
                    Failed to load presets
                </div>
            );
        }

        if (presets.length === 0) {
            return (
                <div className={styles["emptyState"]}>No presets available</div>
            );
        }

        return (
            <div className={styles["dropdownContent"]}>
                <ul className={styles["meetingsList"]}>
                    {presets.map((preset) => renderPresetItem(preset))}
                </ul>
            </div>
        );
    };

    return (
        <div className={styles["dropdownContainer"]} ref={dropdownRef}>
            <button
                type="button"
                className={styles["dropdownButton"]}
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span>
                    {selectedPreset
                        ? selectedPreset.name ?? selectedPreset.id
                        : "Meeting Preset"}
                </span>
                <span className={styles["arrow"]}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen ? (
                <div className={styles["dropdownMenu"]}>
                    {renderDropdownContent()}
                </div>
            ) : null}
        </div>
    );
}
