import type { SpotifyRecentlyPlayedItem, SpotifyTrack } from "@/types/spotify";

export function getTrackImage(track: SpotifyTrack): string | undefined {
  return track.album.images[0]?.url;
}

export function getTrackArtists(track: SpotifyTrack): string {
  return track.artists.map((artist) => artist.name).join(", ");
}

export function createHeatmapGrid(items: SpotifyRecentlyPlayedItem[]) {
  const grid = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({ day, hour, count: 0 })),
  ).flat();

  for (const item of items) {
    const date = new Date(item.played_at);
    const day = (date.getDay() + 6) % 7;
    const hour = date.getHours();
    const entry = grid.find((cell) => cell.day === day && cell.hour === hour);
    if (entry) {
      entry.count += 1;
    }
  }

  return grid;
}