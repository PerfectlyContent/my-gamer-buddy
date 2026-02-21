import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { GameMap, MapMarker } from '@/types';
import { GamingButton } from '@/components/ui/GamingButton';
import MapMarkerIcon from './MapMarkerIcon';
import { Plus, Minus, Maximize2 } from 'lucide-react';

interface InteractiveMapProps {
  map: GameMap;
  markers: MapMarker[];
  selectedMarkerId: string | null;
  onMarkerClick: (marker: MapMarker) => void;
}

export default function InteractiveMap({
  map,
  markers,
  selectedMarkerId,
  onMarkerClick,
}: InteractiveMapProps) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={4}
      centerOnInit
      wheel={{ step: 0.1 }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative w-full h-full overflow-hidden bg-black/40 rounded-2xl">
          {/* Zoom Controls */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
            <GamingButton
              variant="ghost"
              size="sm"
              onClick={() => zoomIn()}
              className="bg-black/50 backdrop-blur-xl border border-white/[0.08] hover:border-gaming-blue/30 hover:shadow-glow-teal-sm"
              title="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </GamingButton>
            <GamingButton
              variant="ghost"
              size="sm"
              onClick={() => zoomOut()}
              className="bg-black/50 backdrop-blur-xl border border-white/[0.08] hover:border-gaming-blue/30 hover:shadow-glow-teal-sm"
              title="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </GamingButton>
            <GamingButton
              variant="ghost"
              size="sm"
              onClick={() => resetTransform()}
              className="bg-black/50 backdrop-blur-xl border border-white/[0.08] hover:border-gaming-blue/30 hover:shadow-glow-teal-sm"
              title="Reset view"
            >
              <Maximize2 className="w-4 h-4" />
            </GamingButton>
          </div>

          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="relative"
                style={{
                  width: `${map.width}px`,
                  maxWidth: '100%',
                  aspectRatio: `${map.width} / ${map.height}`,
                }}
              >
                <img
                  src={map.image_url}
                  alt={map.name}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                {/* Markers */}
                {markers.map((marker) => (
                  <MapMarkerIcon
                    key={marker.id}
                    marker={marker}
                    isSelected={marker.id === selectedMarkerId}
                    onClick={() => onMarkerClick(marker)}
                  />
                ))}
              </div>
            </div>
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  );
}
