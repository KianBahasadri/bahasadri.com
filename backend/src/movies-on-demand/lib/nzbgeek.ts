/**
 * NZBGeek API client for movies-on-demand feature
 * Searches for movie releases by IMDb ID
 */

import type {
    NZBGeekRelease,
    UsenetRelease,
    ParsedReleaseMetadata,
    QualityPreference,
} from "../types";

const NZBGEEK_BASE_URL = "https://api.nzbgeek.info/api";

/**
 * Parse release title to extract metadata
 * Example: "Movie.Title.2024.1080p.BluRay.x264-GROUP"
 */
function parseReleaseTitle(title: string): ParsedReleaseMetadata {
    const parts = title.toUpperCase();

    // Quality detection
    let quality: string | undefined = undefined;
    let resolution: string | undefined = undefined;
    if (
        parts.includes("2160P") ||
        parts.includes("4K") ||
        parts.includes("UHD")
    ) {
        quality = "4K";
        resolution = "3840x2160";
    } else if (parts.includes("1080P")) {
        quality = "1080p";
        resolution = "1920x1080";
    } else if (parts.includes("720P")) {
        quality = "720p";
        resolution = "1280x720";
    } else if (parts.includes("480P") || parts.includes("SD")) {
        quality = "480p";
        resolution = "720x480";
    }

    // Codec detection
    let codec: string | undefined = undefined;
    if (
        parts.includes("X265") ||
        parts.includes("HEVC") ||
        parts.includes("H265")
    ) {
        codec = "x265";
    } else if (
        parts.includes("X264") ||
        parts.includes("H264") ||
        parts.includes("AVC")
    ) {
        codec = "x264";
    } else if (parts.includes("XVID")) {
        codec = "XviD";
    }

    // Source detection
    let source: string | undefined = undefined;
    if (
        parts.includes("BLURAY") ||
        parts.includes("BLU-RAY") ||
        parts.includes("BDRIP")
    ) {
        source = "BluRay";
    } else if (parts.includes("WEB-DL") || parts.includes("WEBDL")) {
        source = "WEB-DL";
    } else if (parts.includes("WEBRIP")) {
        source = "WEBRip";
    } else if (parts.includes("HDTV")) {
        source = "HDTV";
    } else if (parts.includes("DVDRIP") || parts.includes("DVD")) {
        source = "DVD";
    } else if (parts.includes("CAM") || parts.includes("HDCAM")) {
        source = "CAM";
    } else if (parts.includes("HDTS") || parts.includes("TELESYNC")) {
        source = "HDTS";
    }

    // Group extraction (usually last part after hyphen)
    let group: string | undefined = undefined;
    const groupRegex = /-([A-Za-z0-9]+)$/;
    const groupMatch = groupRegex.exec(title);
    if (groupMatch) {
        group = groupMatch[1];
    }

    return { quality, resolution, codec, source, group };
}

/**
 * Parse NZBGeek XML response to extract releases
 * NZBGeek returns RSS/XML format
 */
function parseNZBGeekXML(xml: string): NZBGeekRelease[] {
    const releases: NZBGeekRelease[] = [];

    // Simple XML parsing for RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        // Extract title
        const titleRegex = /<title>([^<]*)<\/title>/i;
        const titleMatch = titleRegex.exec(itemXml);
        const title = titleMatch ? titleMatch[1] : "";

        // Extract guid (release ID)
        const guidRegex = /<guid[^>]*>([^<]*)<\/guid>/i;
        const guidMatch = guidRegex.exec(itemXml);
        const id = guidMatch ? guidMatch[1] : "";

        // Extract size from enclosure or size tag
        let size = 0;
        const enclosureRegex = /<enclosure[^>]*length="(\d+)"[^>]*>/i;
        const enclosureMatch = enclosureRegex.exec(itemXml);
        if (enclosureMatch) {
            size = Number.parseInt(enclosureMatch[1], 10);
        } else {
            const sizeRegex = /<size>(\d+)<\/size>/i;
            const sizeMatch = sizeRegex.exec(itemXml);
            if (sizeMatch) {
                size = Number.parseInt(sizeMatch[1], 10);
            }
        }

        // Extract NZB URL from link or enclosure
        const linkRegex = /<link>([^<]*)<\/link>/i;
        const linkMatch = linkRegex.exec(itemXml);
        const enclosureUrlRegex = /<enclosure[^>]*url="([^"]*)"[^>]*>/i;
        const enclosureUrlMatch = enclosureUrlRegex.exec(itemXml);
        const nzb_url = enclosureUrlMatch?.[1] ?? linkMatch?.[1] ?? "";

        if (id && title) {
            releases.push({ id, title, size, nzb_url });
        }
    }

    return releases;
}

/**
 * Calculate quality score for sorting
 * Higher score = better quality preference
 */
function getQualityScore(
    release: UsenetRelease,
    preference: QualityPreference
): number {
    let score = 0;

    // Quality matching
    switch (release.quality) {
        case preference: {
            score += 100;
            break;
        }
        case "1080p": {
            score += 80;
            break;
        }
        case "720p": {
            score += 60;
            break;
        }
        case "4K": {
            score += 50; // 4K can be too large, slightly lower default score
            break;
        }
        default: {
            break;
        }
    }

    // Source preference (BluRay > WEB-DL > others > CAM/HDTS)
    switch (release.source) {
        case "BluRay": {
            score += 30;
            break;
        }
        case "WEB-DL": {
            score += 25;
            break;
        }
        case "WEBRip": {
            score += 20;
            break;
        }
        case "HDTV": {
            score += 15;
            break;
        }
        case "DVD": {
            score += 10;
            break;
        }
        case "CAM":
        case "HDTS": {
            score -= 50; // Heavily penalize cam/telesync
            break;
        }
        default: {
            break;
        }
    }

    // Codec preference (x265 for smaller size, x264 for compatibility)
    if (release.codec === "x265") {
        score += 10;
    } else if (release.codec === "x264") {
        score += 8;
    }

    // Prefer smaller file sizes within same quality tier (penalize very large files)
    if (release.size > 0) {
        const sizeGB = release.size / (1024 * 1024 * 1024);
        if (sizeGB > 20) {
            score -= 30; // Heavy penalty for files over 20GB
        } else if (sizeGB > 10) {
            score -= 15; // Moderate penalty for files over 10GB
        }
    }

    return score;
}

/**
 * Search for movie releases on NZBGeek by IMDb ID
 */
export async function searchReleases(
    apiKey: string,
    imdbId: string
): Promise<UsenetRelease[]> {
    // Clean IMDb ID (ensure it has tt prefix)
    const cleanImdbId = imdbId.startsWith("tt")
        ? imdbId.replace("tt", "")
        : imdbId;

    const url = `${NZBGEEK_BASE_URL}?t=movie&imdbid=${cleanImdbId}&apikey=${apiKey}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    });

    if (!response.ok) {
        throw new Error(`NZBGEEK_ERROR: ${String(response.status)}`);
    }

    const xml = await response.text();
    const rawReleases = parseNZBGeekXML(xml);

    // Parse metadata for each release
    const releases: UsenetRelease[] = rawReleases.map((release) => ({
        ...release,
        ...parseReleaseTitle(release.title),
    }));

    // Sort by quality preference (default 1080p)
    const sortedReleases = releases.toSorted(
        (a, b) => getQualityScore(b, "1080p") - getQualityScore(a, "1080p")
    );

    // Limit to ~20 results
    return sortedReleases.slice(0, 20);
}

/**
 * Select best release based on quality preference
 */
export function selectBestRelease(
    releases: UsenetRelease[],
    preference: QualityPreference = "1080p"
): UsenetRelease | undefined {
    if (releases.length === 0) return undefined;

    // Sort by quality score for given preference
    const sorted = releases.toSorted(
        (a, b) =>
            getQualityScore(b, preference) - getQualityScore(a, preference)
    );

    return sorted[0];
}

/**
 * Find release by ID
 */
export function findReleaseById(
    releases: UsenetRelease[],
    releaseId: string
): UsenetRelease | undefined {
    return releases.find((r) => r.id === releaseId);
}
