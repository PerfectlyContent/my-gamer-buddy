import { useEffect } from 'react';
import { Loader2, Map as MapIcon } from 'lucide-react';
import { playSound, triggerHaptic } from '@/lib/sounds';
import GameHeader from '@/components/layout/GameHeader';
import InteractiveMap from '@/components/maps/InteractiveMap';
import MarkerPopover from '@/components/maps/MarkerPopover';
import { useGameStore } from '@/store/gameStore';
import { useMapStore } from '@/store/mapStore';
import { MapMarker } from '@/types';

function FilterPill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-display uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
        active
          ? 'bg-gaming-blue/20 border-gaming-blue/50 ring-1 ring-gaming-blue/20 text-gaming-blue'
          : 'bg-white/[0.05] border-white/10 text-gaming-muted hover:bg-white/[0.08] hover:text-gaming-text'
      }`}
    >
      {children}
    </button>
  );
}

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
        icon={<MapIcon className="w-3.5 h-3.5" />}
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-white/10 text-gaming-muted text-xs">
            <span>👆</span>
            <span>Select a game above to explore maps</span>
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
          <div className="px-4 py-3 lg:px-6 border-b border-white/[0.06] glass-surface space-y-2.5 shrink-0">
            {maps.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0 mr-1">Map</span>
                {maps.map((map) => (
                  <FilterPill key={map.id} active={selectedMap?.id === map.id} onClick={() => selectMap(map)}>
                    {map.name}
                  </FilterPill>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0 mr-1">Show</span>
              <FilterPill active={selectedMarkerType === null} onClick={() => setMarkerType(null)}>All</FilterPill>
              {MARKER_TYPES.map(({ type, label }) => (
                <FilterPill key={type} active={selectedMarkerType === type} onClick={() => setMarkerType(selectedMarkerType === type ? null : type)}>
                  {label}
                </FilterPill>
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
