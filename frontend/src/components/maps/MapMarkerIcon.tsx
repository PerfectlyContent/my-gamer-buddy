import { MapMarker } from '@/types';
import { cn } from '@/lib/utils';
import {
  CircleDot,
  Skull,
  CircleAlert,
  Star,
  Gem,
  ShoppingBag,
  ArrowUpFromDot,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface MapMarkerIconProps {
  marker: MapMarker;
  isSelected: boolean;
  onClick: () => void;
}

const markerConfig: Record<
  MapMarker['marker_type'],
  { color: string; ringColor: string; Icon: React.ElementType }
> = {
  loot: { color: 'text-yellow-400', ringColor: 'ring-yellow-400/50', Icon: CircleDot },
  boss: { color: 'text-red-500', ringColor: 'ring-red-500/50', Icon: Skull },
  quest: { color: 'text-blue-400', ringColor: 'ring-blue-400/50', Icon: CircleAlert },
  secret: { color: 'text-purple-400', ringColor: 'ring-purple-400/50', Icon: Star },
  collectible: { color: 'text-green-400', ringColor: 'ring-green-400/50', Icon: Gem },
  vendor: { color: 'text-cyan-400', ringColor: 'ring-cyan-400/50', Icon: ShoppingBag },
  'fast-travel': { color: 'text-white', ringColor: 'ring-white/50', Icon: ArrowUpFromDot },
  danger: { color: 'text-red-400', ringColor: 'ring-red-400/50', Icon: AlertTriangle },
};

export default function MapMarkerIcon({
  marker,
  isSelected,
  onClick,
}: MapMarkerIconProps) {
  const [hovered, setHovered] = useState(false);
  const config = markerConfig[marker.marker_type];
  const { Icon } = config;

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${marker.x_coord}%`,
        top: `${marker.y_coord}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'w-6 h-6 flex items-center justify-center rounded-full',
          'bg-black/60 backdrop-blur-sm border border-white/[0.15]',
          'transition-all duration-150 cursor-pointer',
          'hover:scale-125',
          config.color,
          isSelected && `ring-2 ring-cyan-400/60 scale-125 bg-white/[0.12] shadow-[0_0_16px_rgba(0,212,255,0.5)]`
        )}
        title={marker.label}
      >
        <Icon className="w-3.5 h-3.5" />
      </button>

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
          <div className="bg-black/60 backdrop-blur-sm border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gaming-text whitespace-nowrap shadow-lg">
            {marker.label}
          </div>
        </div>
      )}
    </div>
  );
}
