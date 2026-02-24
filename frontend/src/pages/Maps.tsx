import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { playSound, triggerHaptic } from '@/lib/sounds';
import GameHeader from '@/components/layout/GameHeader';
import { GamingButton } from '@/components/ui/GamingButton';
import InteractiveMap from '@/components/maps/InteractiveMap';
import MarkerPopover from '@/components/maps/MarkerPopover';
import { useGameStore } from '@/store/gameStore';
import { useMapStore } from '@/store/mapStore';
import { MapMarker } from '@/types';

const MARKER_TYPES: { type: MapMarker['marker_type']; label: string }[] = [
  { type: 'loot', label: 'Loot' },
  { type: 'boss', label: 'Boss' },
  { type: 'quest', label: 'Quest' },
  { type: 'secret', label: 'Secret' },
  { type: 'collectible', label: 'Collectible' },
  { type: 'vendor', label: 'Vendor' },
  { type: 'fast-travel', label: 'Fast Travel' },
  { type: 'danger', label: 'Danger' },
];

export default function Maps() {
  const { selectedGame } = useGameStore();
  const {
    maps,
    selectedMap,
    markers,
    selectedMarkerType,
    selectedMarker,
    loading,
    markersLoading,
    fetchMaps,
    selectMap,
    fetchMarkers,
    setMarkerType,
    selectMarker,
  } = useMapStore();

  // Fetch maps when game changes
  useEffect(() => {
    if (selectedGame) {
      fetchMaps(selectedGame.slug);
    }
  }, [selectedGame, fetchMaps]);

  // Re-fetch markers when marker type filter changes
  useEffect(() => {
    if (selectedMap) {
      fetchMarkers(selectedMap.id);
    }
  }, [selectedMarkerType, selectedMap, fetchMarkers]);

  const handleMarkerClick = (marker: MapMarker) => {
    playSound('marker');
    triggerHaptic('tap');
    selectMarker(selectedMarker?.id === marker.id ? null : marker);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <GameHeader
        title="Game Maps"
        subtitle="Explore interactive maps with points of interest"
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-xl font-bold text-gaming-text mb-2">
              Select a Game
            </h2>
            <p className="text-gaming-muted">
              Choose a game above to explore maps
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gaming-blue animate-spin" />
        </div>
      ) : maps.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-semibold text-gaming-text mb-1">
              No maps available
            </h3>
            <p className="text-gaming-muted text-sm">
              This game doesn't have any maps yet
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Map Selector + Marker Type Filter */}
          <div className="px-4 py-3 lg:px-6 border-b border-white/[0.10] glass space-y-3 shrink-0">
            {/* Map Tabs */}
            {maps.length > 1 && (
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
                <span className="text-xs text-gaming-muted font-medium mr-1 shrink-0">
                  Map:
                </span>
                {maps.map((map) => (
                  <GamingButton
                    key={map.id}
                    variant={
                      selectedMap?.id === map.id ? 'primary' : 'ghost'
                    }
                    size="sm"
                    className="shrink-0 whitespace-nowrap"
                    onClick={() => selectMap(map)}
                  >
                    {map.name}
                  </GamingButton>
                ))}
              </div>
            )}

            {/* Marker Type Filter */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              <span className="text-xs text-gaming-muted font-medium mr-1 shrink-0">
                Markers:
              </span>
              <GamingButton
                variant={selectedMarkerType === null ? 'primary' : 'ghost'}
                size="sm"
                className="shrink-0 whitespace-nowrap"
                onClick={() => setMarkerType(null)}
              >
                All
              </GamingButton>
              {MARKER_TYPES.map(({ type, label }) => (
                <GamingButton
                  key={type}
                  variant={selectedMarkerType === type ? 'primary' : 'ghost'}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() =>
                    setMarkerType(selectedMarkerType === type ? null : type)
                  }
                >
                  {label}
                </GamingButton>
              ))}
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative min-h-0 p-4 lg:p-6">
            {markersLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                <Loader2 className="w-6 h-6 text-gaming-blue animate-spin" />
              </div>
            )}

            {selectedMap && (
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden h-full">
                <InteractiveMap
                  map={selectedMap}
                  markers={markers}
                  selectedMarkerId={selectedMarker?.id || null}
                  onMarkerClick={handleMarkerClick}
                  fallbackSrc={`/maps/${selectedGame.slug}-${selectedMap.slug}.svg`}
                />
              </div>
            )}

            {/* Marker Detail Popover */}
            <MarkerPopover
              marker={selectedMarker}
              onClose={() => selectMarker(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
