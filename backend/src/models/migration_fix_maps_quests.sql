-- Migration: fix map image URLs and quest progress response format
-- Run this against your existing database to apply the fixes.

-- Fix GTA V: replace dead bragitoff.com URL with local SVG
UPDATE game_maps
SET image_url = '/maps/gta-los-santos.svg',
    width     = 1200,
    height    = 1200
WHERE slug = 'los-santos'
  AND game_id = (SELECT id FROM games WHERE slug = 'gta');

-- Fix Elden Ring: replace fextralife URL (hotlink-protected = 403) with local SVG
UPDATE game_maps
SET image_url = '/maps/elden-ring-lands-between.svg',
    width     = 1200,
    height    = 1400
WHERE slug = 'lands-between'
  AND game_id = (SELECT id FROM games WHERE slug = 'elden-ring');

-- Fix Zelda: replace fextralife URL (hotlink-protected = 403) with local SVG
UPDATE game_maps
SET image_url = '/maps/zelda-hyrule.svg',
    width     = 1200,
    height    = 1200
WHERE slug = 'hyrule'
  AND game_id = (SELECT id FROM games WHERE slug = 'zelda');

-- Fix Fortnite: reset to local SVG fallback
-- (the backend will overwrite this with the live fortnite-api.com URL on next request)
UPDATE game_maps
SET image_url = '/maps/fortnite-battle-royale.svg',
    width     = 1200,
    height    = 1200
WHERE slug = 'battle-royale'
  AND game_id = (SELECT id FROM games WHERE slug = 'fortnite');
