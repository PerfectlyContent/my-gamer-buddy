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
    ('Zelda', 'zelda', '🛡️', '#00cc66', 9),
    ('Red Dead Redemption 2', 'rdr2', '🤠', '#c41e3a', 10),
    ('Elder Scrolls', 'elder-scrolls', '📜', '#8b7355', 11)
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
-- Fortnite: image_url is updated dynamically by the backend via fortnite-api.com;
--           the local SVG is the initial/fallback value.
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Battle Royale Island',
       'battle-royale',
       '/maps/fortnite-battle-royale.svg',
       1200, 1200
FROM games g WHERE g.slug = 'fortnite'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- GTA V – fallback SVG; image_url replaced at runtime if a better source is found
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Los Santos',
       'los-santos',
       '/maps/gta-los-santos.svg',
       2048, 2048
FROM games g WHERE g.slug = 'gta'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Elden Ring – fallback SVG
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Lands Between',
       'lands-between',
       '/maps/elden-ring-lands-between.svg',
       2048, 2048
FROM games g WHERE g.slug = 'elden-ring'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Zelda: Tears of the Kingdom – fallback SVG
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Hyrule',
       'hyrule',
       '/maps/zelda-hyrule.svg',
       1920, 1353
FROM games g WHERE g.slug = 'zelda'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Valorant – image_url updated dynamically by the backend via valorant-api.com;
--            the local SVG is the initial/fallback value.
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Ascent',
       'ascent',
       '/maps/valorant-ascent.svg',
       1024, 1024
FROM games g WHERE g.slug = 'valorant'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Bind',
       'bind',
       '/maps/valorant-bind.svg',
       1024, 1024
FROM games g WHERE g.slug = 'valorant'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Apex Legends – fallback SVGs
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Storm Point',
       'storm-point',
       '/maps/apex-storm-point.svg',
       2048, 2048
FROM games g WHERE g.slug = 'apex'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'World''s Edge',
       'worlds-edge',
       '/maps/apex-worlds-edge.svg',
       2048, 2048
FROM games g WHERE g.slug = 'apex'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- League of Legends – image_url updated dynamically by the backend via Riot Data Dragon;
--                     the local SVG is the initial/fallback value.
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Summoner''s Rift',
       'summoners-rift',
       '/maps/lol-summoners-rift.svg',
       2048, 2048
FROM games g WHERE g.slug = 'lol'
ON CONFLICT ON CONSTRAINT game_maps_game_slug_unique DO NOTHING;

-- Call of Duty Warzone – fallback SVG
INSERT INTO game_maps (game_id, name, slug, image_url, width, height)
SELECT g.id,
       'Urzikstan',
       'urzikstan',
       '/maps/cod-urzikstan.svg',
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

-- =============================================
-- Cheat Codes table
-- =============================================
CREATE TABLE IF NOT EXISTS cheat_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    code TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL DEFAULT 'All',
    category VARCHAR(30) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cheat_codes_game ON cheat_codes(game_id);
CREATE INDEX IF NOT EXISTS idx_cheat_codes_category ON cheat_codes(category);

-- =============================================
-- Quests table
-- =============================================
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL CHECK (category IN ('npc_encounter', 'secret', 'mini_event', 'easter_egg', 'missable')),
    region VARCHAR(100),
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_missable BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_game ON quests(game_id);
CREATE INDEX IF NOT EXISTS idx_quests_category ON quests(category);

-- Quest Progress tracking
CREATE TABLE IF NOT EXISTS quest_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT quest_progress_session_quest_unique UNIQUE (session_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_quest_progress_session ON quest_progress(session_id);

-- =============================================
-- Seed cheat codes
-- =============================================

-- GTA cheat codes
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Invincibility', 'RIGHT, A, RIGHT, LEFT, RIGHT, RB, RIGHT, LEFT, A, Y', 'Xbox', 'god-mode', '5 minutes of invincibility – re-enter to refresh'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Invincibility', 'RIGHT, X, RIGHT, LEFT, RIGHT, R1, RIGHT, LEFT, X, TRIANGLE', 'PlayStation', 'god-mode', '5 minutes of invincibility – re-enter to refresh'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Health & Armor', 'TURTLE', 'PC', 'god-mode', 'Restores health and armor to full'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Buzzard Helicopter', 'BUZZOFF', 'PC', 'vehicles', 'Spawns a Buzzard attack helicopter'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give All Weapons', 'TOOLUP', 'PC', 'weapons', 'Gives all weapons with full ammo'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, '$250,000 Money', 'Complete Lester assassination missions with stock market', 'All', 'money', 'Use Lester missions to manipulate the stock market for billions'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Super Jump', 'HOPTOIT', 'PC', 'fun', 'Jump extremely high – hold jump for higher leaps'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Melee', 'HOTHANDS', 'PC', 'fun', 'Punch enemies and they explode on contact'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion Aim', 'DEADEYE', 'PC', 'stats', 'Activates slow motion when aiming – stack up to 3 times'
FROM games g WHERE g.slug = 'gta';

-- Minecraft cheat codes (commands)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Creative Mode', '/gamemode creative', 'All', 'god-mode', 'Switch to creative mode – fly and unlimited blocks'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Diamonds', '/give @p diamond 64', 'All', 'spawn', 'Gives yourself a stack of 64 diamonds'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Time Day', '/time set day', 'All', 'world', 'Sets the time to daytime'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Kill All Mobs', '/kill @e[type=!player]', 'All', 'fun', 'Kills all entities except players'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Enchant Held Item', '/enchant @p sharpness 5', 'All', 'weapons', 'Adds Sharpness V to your held weapon'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Keep Inventory on Death', '/gamerule keepInventory true', 'All', 'other', 'Keep your items when you die'
FROM games g WHERE g.slug = 'minecraft';

-- RDR2 cheat codes
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Ammo', 'ABUNDANCE IS THE DULLEST DESIRE', 'All', 'weapons', 'Unlimited ammunition for all weapons'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Dead Eye', 'BE GREEDY ONLY FOR FORESIGHT', 'All', 'stats', 'Dead Eye core never drains'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Health, Stamina & Dead Eye', 'YOU FLOURISH BEFORE YOU DIE', 'All', 'god-mode', 'Fills all three stat bars to maximum'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn War Horse', 'YOU ARE A BEAST BUILT FOR WAR', 'All', 'vehicles', 'Spawns a War Horse nearby'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Race Horse', 'RUN! RUN! RUN!', 'All', 'vehicles', 'Spawns a fast race horse nearby'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Wagon', 'KEEP YOUR DREAMS LIGHT', 'All', 'vehicles', 'Spawns a wagon nearby'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Dead Eye to Rank 3', 'I SHALL BE BETTER', 'All', 'stats', 'Immediately unlocks Dead Eye rank 3'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Dead Eye to Rank 5', 'I SEEK AND I FIND IN ABUNDANCE', 'All', 'stats', 'Immediately unlocks Dead Eye rank 5'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Heavy Weapons', 'GREED IS NOW A VIRTUE', 'All', 'weapons', 'Unlocks heavy weapons: pump shotgun, bolt action rifle, etc.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Increase Wanted Level', 'YOU WANT PUNISHMENT', 'All', 'fun', 'Raises your wanted level by one star'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Decrease Wanted Level', 'YOU WANT FREEDOM', 'All', 'fun', 'Lowers your wanted level by one star'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Increase Honor', 'VIRTUE UNEARNED IS NOT VIRTUE', 'All', 'stats', 'Raises your honor rating'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Decrease Honor', 'YOU REVEL IN YOUR DISGRACE', 'All', 'stats', 'Lowers your honor rating'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Drunk Mode', 'A FOOL ON COMMAND', 'All', 'fun', 'Arthur becomes permanently drunk until deactivated'
FROM games g WHERE g.slug = 'rdr2';

-- Elder Scrolls (Skyrim) cheat codes (console commands)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'God Mode', 'tgm', 'PC', 'god-mode', 'Toggle god mode – infinite health, stamina, and magicka'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Toggle No Clip', 'tcl', 'PC', 'fun', 'Walk through walls and fly – toggle collision off'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Add Gold', 'player.additem 0000000f 10000', 'PC', 'money', 'Adds 10,000 gold to your inventory'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Add Lockpicks', 'player.additem 0000000a 100', 'PC', 'spawn', 'Adds 100 lockpicks to your inventory'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Player Level', 'player.setlevel 50', 'PC', 'stats', 'Sets your character to level 50 (change number as desired)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Unlock All Shouts', 'player.unlockword <shoutID>', 'PC', 'weapons', 'Unlocks a specific dragon shout – look up shout IDs online'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Kill Target', 'kill', 'PC', 'fun', 'Click on any NPC or enemy and type kill to instantly defeat them'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Resurrect Target', 'resurrect', 'PC', 'fun', 'Click on a dead NPC and type resurrect to bring them back'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Carry Weight', 'player.modav carryweight 1000', 'PC', 'stats', 'Increases carry weight by 1000 – no more over-encumbered'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Unlock Door/Chest', 'unlock', 'PC', 'other', 'Click on any locked door or chest and type unlock'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Toggle AI', 'tai', 'PC', 'fun', 'Disables all AI – NPCs and enemies freeze in place'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Skill Level', 'player.setav <skill> 100', 'PC', 'stats', 'Sets any skill to 100 (e.g., player.setav destruction 100)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Daedric Sword', 'player.additem 000139B9 1', 'PC', 'weapons', 'Adds a Daedric Sword to your inventory'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Daedric Armor Set', 'player.additem 000139B4 1', 'PC', 'spawn', 'Adds Daedric Armor to your inventory'
FROM games g WHERE g.slug = 'elder-scrolls';

-- =============================================
-- Seed quests
-- =============================================

-- GTA quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Epsilon Program', 'Complete the Epsilon Program questline to join the cult and earn rewards', 'secret', 'Los Santos', 'hard', false, 1
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Mount Chiliad Mystery', 'Investigate the mural on Mount Chiliad and discover the UFO Easter eggs', 'easter_egg', 'Blaine County', 'hard', false, 2
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Strangers & Freaks: Drunk Driver', 'Meet a drunk couple who need a ride home from the bar', 'npc_encounter', 'Los Santos', 'easy', false, 3
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Bigfoot Hunt', 'Find and photograph Bigfoot in the wilderness', 'easter_egg', 'Blaine County', 'hard', false, 4
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Spaceship Parts Collection', 'Collect all 50 spaceship parts scattered around the map', 'secret', 'San Andreas', 'medium', false, 5
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Random Events: Hitchhiker', 'Pick up a hitchhiker who turns out to be a celebrity stalker', 'mini_event', 'Highway', 'easy', true, 6
FROM games g WHERE g.slug = 'gta';

-- Elden Ring quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Ranni''s Questline', 'Follow Ranni the Witch''s quest to unlock the Age of Stars ending', 'npc_encounter', 'Liurnia', 'hard', true, 1
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Fia''s Deathbed Companion', 'Follow Fia''s storyline to the Deeproot Depths for an alternative ending', 'npc_encounter', 'Roundtable Hold', 'hard', true, 2
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Patches the Untethered', 'Encounter Patches multiple times – spare him for a merchant and quest giver', 'npc_encounter', 'Murkwater Cave', 'medium', true, 3
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hidden Wall in Volcano Manor', 'Hit illusory walls in Volcano Manor to find hidden rooms and loot', 'secret', 'Mt. Gelmir', 'medium', false, 4
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Goldmask''s Colossal Form', 'Help Goldmask solve the Golden Order''s theological mysteries', 'npc_encounter', 'Altus Plateau', 'hard', true, 5
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Finger Reader Crone Messages', 'Find all finger reader crones for cryptic hints about the world', 'easter_egg', 'Various', 'easy', false, 6
FROM games g WHERE g.slug = 'elden-ring';

-- Zelda quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Dragon Tear Memories', 'Find all 12 Dragon Tear locations to piece together the full story', 'secret', 'Hyrule', 'medium', false, 1
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Yiga Clan Infiltration', 'Infiltrate the Yiga Clan hideout without being detected', 'mini_event', 'Gerudo Desert', 'hard', false, 2
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hestu''s Maracas', 'Return Hestu''s maracas and trade Korok seeds for inventory upgrades', 'npc_encounter', 'Various', 'easy', false, 3
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Tarrey Town Construction', 'Help Hudson build an entire town from scratch by recruiting NPCs', 'npc_encounter', 'Akkala', 'medium', false, 4
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Lord of the Mountain', 'Find and ride the mythical Lord of the Mountain at Satori Mountain', 'easter_egg', 'Satori Mountain', 'medium', false, 5
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Eventide Island Trial', 'Survive Eventide Island with no equipment – all items stripped on arrival', 'mini_event', 'Necluda Sea', 'hard', false, 6
FROM games g WHERE g.slug = 'zelda';

-- Minecraft quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Find a Woodland Mansion', 'Locate and clear a Woodland Mansion for rare loot and the Totem of Undying', 'secret', 'Dark Forest', 'hard', false, 1
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Beat the Ender Dragon', 'Find the End portal, enter The End, and defeat the Ender Dragon', 'mini_event', 'The End', 'hard', false, 2
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Discover an Ancient City', 'Find an Ancient City in the Deep Dark and avoid the Warden', 'secret', 'Deep Dark', 'hard', false, 3
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Music Disc Collection', 'Collect all music discs from Creeper drops and dungeon chests', 'easter_egg', 'Various', 'medium', false, 4
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Villager Trading Hall', 'Create a trading hall with villagers for enchanted books and emeralds', 'npc_encounter', 'Any Village', 'medium', false, 5
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Trial Chambers Exploration', 'Find and clear the new Trial Chambers in the 1.21 update', 'mini_event', 'Underground', 'hard', false, 6
FROM games g WHERE g.slug = 'minecraft';

-- RDR2 quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Veteran', 'Help a Civil War veteran named Hamish with a series of hunting and fishing challenges', 'npc_encounter', 'O''Creagh''s Run', 'medium', true, 1
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Strange Man''s Cabin', 'Find the mysterious cabin near Bayall Edge where a painting slowly completes itself', 'easter_egg', 'Bayall Edge', 'easy', false, 2
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Ghost Train of Lemoyne', 'Witness the ghost train at 3am near Lemoyne – only appears once', 'easter_egg', 'Lemoyne', 'easy', true, 3
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Animals Hunt', 'Track and hunt all 16 legendary animals for unique trinkets and clothing', 'secret', 'Various', 'hard', false, 4
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'UFO Sightings', 'Find both UFO locations – one in a cabin near Shann and one atop Mount Shann', 'easter_egg', 'Mount Shann', 'medium', false, 5
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Widow Charlotte', 'Help Charlotte Balfour learn to survive on her own after her husband''s death', 'npc_encounter', 'Roanoke Ridge', 'easy', true, 6
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Treasure Maps', 'Follow the Jack Hall Gang, High Stakes, and Poisonous Trail treasure maps for gold bars', 'secret', 'Various', 'medium', false, 7
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Night Folk Encounters', 'Survive the terrifying Night Folk ambushes in the Bluewater Marsh at night', 'mini_event', 'Bluewater Marsh', 'hard', false, 8
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Robot', 'Find the inventor Marko Dragic and help him with his mechanical experiments', 'npc_encounter', 'Saint Denis', 'medium', true, 9
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Camp Activities', 'Play poker, dominoes, and have conversations with camp members – missable after Chapter 6', 'missable', 'Camp', 'easy', true, 10
FROM games g WHERE g.slug = 'rdr2';

-- Elder Scrolls (Skyrim) quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Black Star', 'Choose between Azura''s Star or The Black Star daedric artifact', 'npc_encounter', 'Azura''s Shrine', 'medium', false, 1
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'A Night to Remember', 'Follow Sanguine''s wild drinking quest across Skyrim', 'easter_egg', 'Any Inn', 'easy', false, 2
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Mind of Madness', 'Enter Pelagius'' mind through the Sheogorath daedric quest', 'easter_egg', 'Solitude', 'medium', false, 3
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Destroy the Dark Brotherhood', 'Kill Astrid instead of a hostage to unlock the quest to destroy the entire Dark Brotherhood', 'secret', 'Abandoned Shack', 'hard', true, 4
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Notched Pickaxe Easter Egg', 'Find the Notched Pickaxe at the very top of the Throat of the World – a Minecraft reference', 'easter_egg', 'Throat of the World', 'medium', false, 5
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Headless Horseman', 'Spot the Headless Horseman riding at night and follow him to his grave', 'mini_event', 'Various Roads', 'easy', false, 6
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Paarthurnax Dilemma', 'Choose whether to kill or spare Paarthurnax – affects Blade faction', 'missable', 'Throat of the World', 'hard', true, 7
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Blackreach Dragon', 'Use Unrelenting Force on the giant glowing orb in Blackreach to summon a secret dragon', 'secret', 'Blackreach', 'hard', false, 8
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'M''aiq the Liar', 'Find M''aiq the Liar wandering Skyrim – he breaks the fourth wall with developer jokes', 'npc_encounter', 'Random', 'easy', false, 9
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Forgotten Vale Paragon Portals', 'Collect all 5 Paragons in the Forgotten Vale to unlock secret treasure rooms', 'secret', 'Forgotten Vale', 'hard', false, 10
FROM games g WHERE g.slug = 'elder-scrolls';
