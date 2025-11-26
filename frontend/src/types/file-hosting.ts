export interface UploadResponse {
    fileId: string;
    downloadUrl: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
}

export interface FileMetadata {
    id: string;
    name: string;
    originalSize: number;
    compressedSize: number | null;
    mimeType: string;
    uploadTime: string;
    compressionStatus: "pending" | "processing" | "done" | "failed";
    originalUrl: string;
    compressedUrl: string | null;
    compressionRatio: number | null;
    accessCount: number;
    lastAccessed: string | null;
    deleted: boolean;
    isPublic: boolean;
}

export interface FileListResponse {
    files: FileMetadata[];
    nextCursor?: string;
}

