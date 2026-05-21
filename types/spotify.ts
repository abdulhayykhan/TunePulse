export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyFollowers {
  total: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  followers: SpotifyFollowers;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<Pick<SpotifyArtist, "id" | "name">>;
  album: {
    images: SpotifyImage[];
  };
  popularity: number;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyRecentlyPlayedItem {
  played_at: string;
  track: SpotifyTrack;
}

export interface SpotifyRecentlyPlayed {
  items: SpotifyRecentlyPlayedItem[];
}

export interface SpotifyTopResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  images: SpotifyImage[];
  followers: SpotifyFollowers;
  external_urls: SpotifyExternalUrls;
}

export interface GenreCount {
  genre: string;
  count: number;
}

export interface HeatmapCell {
  hour: number;
  day: number;
  count: number;
}