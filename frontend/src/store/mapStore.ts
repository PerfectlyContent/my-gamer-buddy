import { create } from 'zustand';
import { GameMap, MapMarker } from '../types';
import { mapsApi } from '../lib/api';

interface MapStore {
  maps: GameMap[];
  selectedMap: GameMap | null;
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

export const useMapStore = create<MapStore>((set, get) => ({
  maps: [],
  selectedMap: null,
  markers: [],
  selectedMarkerType: null,
  selectedMarker: null,
  loading: false,
  markersLoading: false,

  fetchMaps: async (slug: string) => {
    set({ loading: true, maps: [], selectedMap: null, markers: [], selectedMarker: null });
    try {
      const raw = await mapsApi.listMaps(slug);
      const maps = Array.isArray(raw) ? raw : [];
      set({ maps, loading: false });
      // Auto-select first map and fetch its markers
      if (maps.length > 0) {
        const firstMap = maps[0];
        set({ selectedMap: firstMap });
        get().fetchMarkers(firstMap.id);
      }
    } catch (error) {
      console.error('Failed to fetch maps:', error);
      set({ maps: [], loading: false });
    }
  },

  selectMap: (map: GameMap) => {
    set({ selectedMap: map, markers: [], selectedMarker: null });
    get().fetchMarkers(map.id);
  },

  fetchMarkers: async (mapId: string) => {
    set({ markersLoading: true });
    try {
      const { selectedMarkerType } = get();
      const markers = await mapsApi.getMarkers(mapId, selectedMarkerType || undefined);
      set({ markers: Array.isArray(markers) ? markers : [], markersLoading: false });
    } catch (error) {
      console.error('Failed to fetch markers:', error);
      set({ markers: [], markersLoading: false });
    }
  },

  setMarkerType: (type) => set({ selectedMarkerType: type }),
  selectMarker: (marker) => set({ selectedMarker: marker }),
}));
