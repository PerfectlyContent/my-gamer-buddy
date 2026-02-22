-- My Gamer Buddy Database Schema

-- Sessions (anonymous users identified by browser session)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games catalog
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color_accent VARCHAR(7) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_game ON conversations(game_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Seed games data
INSERT INTO games (name, slug, icon, color_accent, sort_order) VALUES
    ('Fortnite', 'fortnite', '🏗️', '#00d4ff', 1),
    ('Call of Duty', 'cod', '🎯', '#ff6b00', 2),
    ('GTA', 'gta', '🚗', '#39ff14', 3),
    ('Valorant', 'valorant', '🔫', '#ff4655', 4),
    ('Minecraft', 'minecraft', '⛏️', '#8b5cf6', 5),
    ('Apex Legends', 'apex', '🦅', '#ff3333', 6),
    ('Elden Ring', 'elden-ring', '🗡️', '#d4a017', 7),
    ('League of Legends', 'lol', '🏆', '#c89b3c', 8),
    ('Zelda', 'zelda', '🛡️', '#00cc66', 9)
ON CONFLICT (slug) DO NOTHING;

-- Game Maps
CREATE TABLE IF NOT EXISTS game_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    width INTEGER DEFAULT 2048,
    height INTEGER DEFAULT 2048,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT game_maps_game_slug_unique UNIQUE (game_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_game_maps_game ON game_maps(game_id);

-- Map Markers
CREATE TABLE IF NOT EXISTS map_markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES game_maps(id) ON DELETE CASCADE,
    marker_type VARCHAR(20) NOT NULL CHECK (marker_type IN ('loot', 'boss', 'quest', 'secret', 'collectible', 'vendor', 'fast-travel', 'danger')),
    label VARCHAR(100) NOT NULL,
    description TEXT,
    x_coord DECIMAL(5,2) NOT NULL,
    y_coord DECIMAL(5,2) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_map_markers_map ON map_markers(map_id);
CREATE INDEX IF NOT EXISTS idx_map_markers_type ON map_markers(marker_type);

-- Seed game maps
-- Fortnite: image_url is populated dynamically by the backend via fortnite-api.com;
--           this placeholder gets overwritten on first request.
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Battle Royale Island',
       'battle-royale',
       'https://media.fortniteapi.io/images/map.png',
       2048, 2048
FROM games g WHERE g.slug = 'fortnite'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- GTA V – high-res atlas map (bragitoff community mirror, public domain fan use)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Los Santos',
       'los-santos',
       'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png',
       2048, 2048
FROM games g WHERE g.slug = 'gta'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Elden Ring – full Lands Between world map (fextralife wiki community image)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Lands Between',
       'lands-between',
       'https://eldenring.wiki.fextralife.com/file/Elden-Ring/elden_ring_world_map.jpg',
       2048, 2048
FROM games g WHERE g.slug = 'elden-ring'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Zelda: Tears of the Kingdom – Hyrule surface map (fextralife wiki community image)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Hyrule',
       'hyrule',
       'https://zeldatearsofthekingdom.wiki.fextralife.com/file/Zelda-Tears-of-the-Kingdom/totk_world_map.jpg',
       2048, 2048
FROM games g WHERE g.slug = 'zelda'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Valorant – Ascent map (Valorant fandom wiki)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Ascent',
       'ascent',
       'https://static.wikia.nocookie.net/valorant/images/e/e7/Loading_Screen_Ascent.png/revision/latest',
       1024, 1024
FROM games g WHERE g.slug = 'valorant'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Bind',
       'bind',
       'https://static.wikia.nocookie.net/valorant/images/2/23/Loading_Screen_Bind.png/revision/latest',
       1024, 1024
FROM games g WHERE g.slug = 'valorant'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Apex Legends – Storm Point (Apex fandom wiki)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Storm Point',
       'storm-point',
       'https://static.wikia.nocookie.net/apexlegends/images/3/30/Storm_Point_Map_S13.png/revision/latest',
       2048, 2048
FROM games g WHERE g.slug = 'apex'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'World''s Edge',
       'worlds-edge',
       'https://static.wikia.nocookie.net/apexlegends/images/b/b8/World%27s_Edge_Loading_Screen.png/revision/latest',
       2048, 2048
FROM games g WHERE g.slug = 'apex'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- League of Legends – Summoner's Rift (LoL fandom wiki)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Summoner''s Rift',
       'summoners-rift',
       'https://static.wikia.nocookie.net/leagueoflegends/images/8/82/Summoner%27s_Rift_Map.png/revision/latest',
       2048, 2048
FROM games g WHERE g.slug = 'lol'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Call of Duty Warzone – Urzikstan (CoD fandom wiki)
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Urzikstan',
       'urzikstan',
       'https://static.wikia.nocookie.net/callofduty/images/3/36/Urzikstan_WZ_Map.jpg/revision/latest',
       2048, 2048
FROM games g WHERE g.slug = 'cod'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- =============================================
-- Seed map markers
-- =============================================

-- GTA V – Los Santos markers
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Pacific Standard Bank',    'High-value heist target in downtown LS',              65.20, 68.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Vangelico Jewelry',        'Jewel store job start location',                      63.80, 67.90 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Los Santos Airport (LSIA)','Main airport – buy planes and helicopters here',      62.50, 79.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Ammu-Nation Downtown',     'Weapons and ammo shop',                               64.00, 68.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Los Santos Customs',       'Vehicle upgrades and modifications',                  60.00, 73.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Mount Chiliad UFO',        'UFO spawns at the summit at 3am in foggy weather',    72.00, 28.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Infinity 8 Space Docker', 'Unlock the space car by collecting spaceship parts',   45.00, 52.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'Fort Zancudo',             'Military base – kill on sight, 4-star wanted level',  27.50, 47.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'Alamo Sea Meth Lab',       'Methamphetamine lab – Trevor''s territory',           80.00, 47.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Michael''s Mansion',       'Michael De Santa''s home in Rockford Hills',          57.00, 63.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Trevor''s Trailer',        'Trevor Philips'' home in Sandy Shores',               77.50, 45.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Franklin''s House',        'Franklin Clinton''s starting home in Strawberry',     63.50, 72.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'collectible', 'Sandy Shores Airfield',    'Trevor''s airfield – fly here for drug missions',     78.00, 38.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Vinewood Sign Easter Egg', 'Real-world Hollywood sign recreation',                59.50, 61.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Maze Bank Tower',          'Tallest building in LS – buy as a property',          65.00, 68.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'gta' AND gm.slug = 'los-santos';

-- Elden Ring – Lands Between markers
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Margit, the Fell Omen',   'First major boss – guards Stormveil Castle gate',      31.50, 44.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Godrick the Grafted',     'Shardbearer – Stormveil Castle throne room',           30.00, 42.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Rennala, Queen of the Full Moon', 'Shardbearer – Raya Lucaria Academy',            27.50, 29.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Starscourge Radahn',      'Shardbearer – Caelid festival, Redmane Castle',        70.00, 61.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Morgott, the Omen King', 'Shardbearer – Leyndell Royal Capital',                  46.50, 40.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Malenia, Blade of Miquella','Optional – hardest boss, Miquella''s Haligtree',     72.00, 21.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Church of Elleh',         'Starting grace – buy crafting kit from Kalé here',     35.00, 49.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Roundtable Hold',         'Hub area – unlocks after first grace rest',            45.00, 45.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Kalé (Church of Elleh)', 'First merchant – sells cookbook and crafting kit',      35.00, 49.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Enia (Two Fingers)',      'Finger Reader – exchanges Remembrances for weapons',   45.00, 45.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Stormveil Castle',        'Full legacy dungeon – great early rune farming',       30.50, 43.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Raya Lucaria Academy',   'Mid-game dungeon – Glintstone spells and ashes',       27.50, 28.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Nokron, Eternal City',   'Hidden underground city – access via Radahn meteor',   42.00, 52.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Siofra River',           'Underground river biome – accessed via Limgrave well', 46.00, 48.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'Caelid',                 'Scarlet Rot wasteland – avoid early game',             63.00, 55.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Volcano Manor',          'Rya questline and Rykard assassination covenant',      23.50, 32.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Stormhill Shack',        'Roderika NPC – puppet spirit upgrade questline',       34.00, 44.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'elden-ring' AND gm.slug = 'lands-between';

-- Zelda: Tears of the Kingdom – Hyrule markers
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Phantom Ganon (Hyrule Castle)', 'Story boss – must defeat to enter throne room',  50.00, 44.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Queen Gibdo (Lightning Temple)', 'Desert temple boss – Gerudo region',            25.50, 63.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Colgera (Wind Temple)',  'Sky temple boss – Rito region',                        22.00, 24.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Lookout Landing',        'Main hub, Purah''s base – start most main quests here', 50.00, 54.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Hyrule Castle',          'Final dungeon – Gloom in the depths',                  50.00, 44.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Lookout Landing Shop',   'Arrows, food, and basic supplies',                     50.20, 54.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Rito Village',           'Clothing and cold-weather items – Rito merchants',     22.00, 26.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'vendor',      'Gerudo Town',            'Special armor and secrets – women and Voe allowed',    25.50, 65.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Akkala Ancient Tech Lab','Enhance weapons with ancient Zonaite',                  72.00, 18.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Zora''s Domain',         'Treasure chests underwater – Zora Armor needed',       68.00, 29.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Dragon Tear locations',  'Gleeok tear memories – scattered across Hyrule',      50.00, 50.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Mineru''s Construct',   'Secret boss in the Depths below the Gerudo Desert',    25.50, 65.50 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Kakariko Village',       'Cece Hat and Paya questlines – Ring Ruins here',       62.00, 48.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'quest',       'Hateno Village',         'Zelda sightings questline, Cece''s shop',              68.00, 55.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'Gloom Hands Area',       'Cursed hands near Hyrule Castle moat – highly dangerous', 48.50, 46.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'zelda' AND gm.slug = 'hyrule';

-- Valorant – Ascent markers
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'A Site',       'Primary bomb plant – flanked via Market and CT',  76.00, 38.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'valorant' AND gm.slug = 'ascent';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'B Site',       'Secondary bomb plant – accessed via B Main/Lane',  24.00, 38.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'valorant' AND gm.slug = 'ascent';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'Mid Market',   'Central control point – key for flanks on both sites', 52.00, 50.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'valorant' AND gm.slug = 'ascent';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Attacker Spawn','Attackers start here each round',                   50.00, 85.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'valorant' AND gm.slug = 'ascent';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Defender Spawn','Defenders start here each round',                   50.00, 15.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'valorant' AND gm.slug = 'ascent';

-- League of Legends – Summoner's Rift markers
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Baron Nashor',      'Powerful neutral – spawns at 20 min, buffs team',    23.00, 29.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'boss',        'Dragon',            'Elemental dragons – stacking buffs for team',         77.00, 73.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Blue Sentinel',     'Blue buff – CDR for mages and junglers',              25.00, 40.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Red Brambleback',   'Red buff – slow on attacks for fighters',             74.00, 60.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'Enemy Jungle',      'Contest dragon and baron to deny enemy resources',   50.00, 50.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'collectible', 'Rift Herald',       'Sunder the Herald – use for tower destruction',      23.00, 29.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'secret',      'River Scuttler',    'Scuttle Crab – vision and slow zone in river',       37.00, 55.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'lol' AND gm.slug = 'summoners-rift';

-- Fortnite markers (fallback for when API is unavailable)
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'loot',        'Loot Lake Area',     'High-density loot zone – center island',            50.00, 50.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'danger',      'Storm Circle Center','Final storm circles tend to converge here',          50.00, 50.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'fast-travel', 'Bus Path (North→South)', 'Common bus path – adjust strategy based on drop', 50.00, 20.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'collectible', 'Named POI (NW)',      'Northwest named location – updated each season',    25.00, 30.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'collectible', 'Named POI (NE)',      'Northeast named location – updated each season',    75.00, 30.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'collectible', 'Named POI (SW)',      'Southwest named location – updated each season',    25.00, 70.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
INSERT INTO map_markers (map_id, marker_type, label, description, x_coord, y_coord)
SELECT gm.id, 'collectible', 'Named POI (SE)',      'Southeast named location – updated each season',    75.00, 70.00 FROM game_maps gm JOIN games g ON gm.game_id = g.id WHERE g.slug = 'fortnite' AND gm.slug = 'battle-royale';
