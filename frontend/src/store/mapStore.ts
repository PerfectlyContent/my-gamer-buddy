import { create } from 'zustand';
import { GameMap, MapMarker } from '../types';
import { mapsApi } from '../lib/api';

interface MapStore {
  maps: GameMap[];
  selectedMap: GameMap | null;
  allMarkers: MapMarker[];
  markers: MapMarker[];
  selectedMarkerType: string | null;
  selectedMarker: MapMarker | null;
  loading: boolean;
  markersLoading: boolean;
  fetchMaps: (slug: string) => Promise<void>;
  selectMap: (map: GameMap) => void;
  fetchMarkers: (mapId: string) => Promise<void>;
  setMarkerType: (type: string | null) => void;
  selectMarker: (marker: MapMarker | null) => void;
}

function filterMarkers(all: MapMarker[], type: string | null): MapMarker[] {
  if (!type) return all;
  return all.filter((m) => m.marker_type === type);
}

export const useMapStore = create<MapStore>((set, get) => ({
  maps: [],
  selectedMap: null,
  allMarkers: [],
  markers: [],
  selectedMarkerType: null,
  selectedMarker: null,
  loading: false,
  markersLoading: false,

  fetchMaps: async (slug: string) => {
    set({ loading: true, maps: [], selectedMap: null, allMarkers: [], markers: [], selectedMarker: null });
    try {
      const maps = await mapsApi.listMaps(slug);
      if (maps.length > 0) {
        const firstMap = maps[0];
        // Fetch maps and first map's markers in parallel-ish (set map immediately, kick off markers)
        set({ maps, selectedMap: firstMap, loading: false });
        get().fetchMarkers(firstMap.id);
      } else {
        set({ maps, loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch maps:', error);
      set({ maps: [], loading: false });
    }
  },

  selectMap: (map: GameMap) => {
    set({ selectedMap: map, allMarkers: [], markers: [], selectedMarker: null });
    get().fetchMarkers(map.id);
  },

  fetchMarkers: async (mapId: string) => {
    set({ markersLoading: true });
    try {
      const allMarkers = await mapsApi.getMarkers(mapId);
      const { selectedMarkerType } = get();
      set({
        allMarkers,
        markers: filterMarkers(allMarkers, selectedMarkerType),
        markersLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch markers:', error);
      set({ allMarkers: [], markers: [], markersLoading: false });
    }
  },

  setMarkerType: (type) => {
    set({ selectedMarkerType: type });
    const { allMarkers } = get();
    set({ markers: filterMarkers(allMarkers, type) });
  },

  selectMarker: (marker) => set({ selectedMarker: marker }),
}));
