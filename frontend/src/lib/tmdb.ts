export const getImageUrl = (
    path: string | null | undefined,
    size: "w500" | "original" = "w500"
): string => {
    if (!path) return "/placeholder-poster.png";

    return `https://image.tmdb.org/t/p/${size}${path}`;
};

