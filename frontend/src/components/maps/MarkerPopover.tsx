import { MapMarker } from '@/types';
import { GamingCard } from '@/components/ui/GamingCard';
import { GamingBadge } from '@/components/ui/GamingBadge';
import { X } from 'lucide-react';

interface MarkerPopoverProps {
  marker: MapMarker | null;
  onClose: () => void;
}

const typeLabels: Record<MapMarker['marker_type'], string> = {
  loot: 'Loot',
  boss: 'Boss',
  quest: 'Quest',
  secret: 'Secret',
  collectible: 'Collectible',
  vendor: 'Vendor',
  'fast-travel': 'Fast Travel',
  danger: 'Danger Zone',
};

export default function MarkerPopover({ marker, onClose }: MarkerPopoverProps) {
  if (!marker) return null;

  return (
    <div className="absolute top-4 right-4 z-30 w-72 animate-[stagger-up_0.2s_ease-out]">
      <GamingCard hover={false} className="relative glass-surface">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gaming-muted hover:text-gaming-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-3">
          <GamingBadge>{typeLabels[marker.marker_type]}</GamingBadge>

          <h3 className="text-base font-semibold text-gaming-text pr-6">
            {marker.label}
          </h3>

          {marker.description && (
            <p className="text-sm text-gaming-muted leading-relaxed">
              {marker.description}
            </p>
          )}

          <div className="text-xs text-gaming-muted/60 font-mono">
            Coords: ({marker.x_coord.toFixed(1)}, {marker.y_coord.toFixed(1)})
          </div>
        </div>
      </GamingCard>
    </div>
  );
}
