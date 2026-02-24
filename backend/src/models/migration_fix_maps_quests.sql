-- Migration: fix map image URLs and quest progress response format
-- Run this against your existing database to apply the fixes.

-- Fix GTA V: replace dead bragitoff.com URL with Fandom CDN image
-- (GTA Wiki – Los Santos County in San Andreas, GTA V world map)
UPDATE game_maps
SET image_url = 'https://static.wikia.nocookie.net/gtawiki/images/d/d5/Los_Santos_County_in_San_Andreas.png/revision/latest',
    width     = 2048,
    height    = 2048
WHERE slug = 'los-santos'
  AND game_id = (SELECT id FROM games WHERE slug = 'gta');

-- Fix Elden Ring: replace fextralife URL (hotlink-protected = 403) with Fandom CDN image
-- (Elden Ring Wiki – 4K Lands Between world map)
UPDATE game_maps
SET image_url = 'https://static.wikia.nocookie.net/eldenring/images/f/f2/EldenRing-Map_4k.jpg/revision/latest',
    width     = 2048,
    height    = 2048
WHERE slug = 'lands-between'
  AND game_id = (SELECT id FROM games WHERE slug = 'elden-ring');

-- Fix Zelda: replace fextralife URL (hotlink-protected = 403) with Fandom CDN image
-- (Zelda Wiki – TotK central Hyrule surface map)
UPDATE game_maps
SET image_url = 'https://static.wikia.nocookie.net/zelda_gamepedia_en/images/5/52/TotK_Central_Hyrule_Map.png/revision/latest',
    width     = 1920,
    height    = 1353
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
