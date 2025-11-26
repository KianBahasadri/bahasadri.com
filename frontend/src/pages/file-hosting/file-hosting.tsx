import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile, fetchFileList } from "../../lib/api";
import type { FileMetadata } from "../../types/file-hosting";
import styles from "./file-hosting.module.css";

export default function FileHosting(): React.JSX.Element {
    const [isDragging, setIsDragging] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { data: fileList, isLoading } = useQuery({
        queryKey: ["file-hosting", "files"],
        queryFn: () => fetchFileList(),
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadFile(file, isPublic),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["file-hosting"] });
        },
    });

    const handleDragOver = (e: React.DragEvent): void => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (): void => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const handleClickUpload = (): void => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString();
    };

    const handleDownload = (file: FileMetadata): void => {
        const url = file.isPublic
            ? file.originalUrl
            : `${file.originalUrl}?uiAccess=true`;
        window.open(url, "_blank");
    };

    return (
        <div className={styles["container"]}>
            <h1 className={styles["title"]}>File Hosting</h1>

            <div className={styles["upload-section"]}>
                <div
                    className={`${styles["upload-zone"]} ${
                        isDragging ? styles["dragging"] : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClickUpload}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className={styles["file-input"]}
                    />
                    {uploadMutation.isPending ? (
                        <p>Uploading...</p>
                    ) : (
                        <p>Drop file here or click to select</p>
                    )}
                </div>

                <div className={styles["toggle-section"]}>
                    <label className={styles["toggle-label"]}>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <span>Public (anyone with link can access)</span>
                    </label>
                </div>

                {uploadMutation.isError && (
                    <p className={styles["error"]}>
                        {uploadMutation.error instanceof Error
                            ? uploadMutation.error.message
                            : "Upload failed"}
                    </p>
                )}

                {uploadMutation.isSuccess && (
                    <p className={styles["success"]}>Upload successful!</p>
                )}
            </div>

            <div className={styles["file-list-section"]}>
                <h2>Uploaded Files</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : fileList?.files.length === 0 ? (
                    <p>No files uploaded yet</p>
                ) : (
                    <div className={styles["file-list"]}>
                        {fileList?.files.map((file) => (
                            <div key={file.id} className={styles["file-item"]}>
                                <div className={styles["file-info"]}>
                                    <h3>{file.name}</h3>
                                    <p>
                                        {formatFileSize(file.originalSize)} •{" "}
                                        {formatDate(file.uploadTime)}
                                    </p>
                                    <p>
                                        {file.isPublic ? "🔓 Public" : "🔒 Private"} •{" "}
                                        {file.accessCount} downloads
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDownload(file)}
                                    className={styles["download-button"]}
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

