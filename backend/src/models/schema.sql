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
    ('Elder Scrolls', 'elder-scrolls', '📜', '#8b7355', 11),
    ('Rainbow Six Siege', 'rainbow-six', '🛡️', '#1f4e78', 12)
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
CREATE INDEX IF NOT EXISTS idx_cheat_codes_game_category ON cheat_codes(game_id, category);
CREATE INDEX IF NOT EXISTS idx_cheat_codes_platform ON cheat_codes(platform);

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
CREATE INDEX IF NOT EXISTS idx_quests_game_category ON quests(game_id, category);

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
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest ON quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_map_markers_map_type ON map_markers(map_id, marker_type);

-- =============================================
-- Seed cheat codes
-- =============================================

-- =============================================
-- GTA V cheat codes (PC text, Phone numbers, Xbox, PlayStation)
-- =============================================

-- Invincibility
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Invincibility', 'PAINKILLER', 'PC', 'god-mode', '5 minutes of invincibility – re-enter to refresh. Phone: 1-999-724-654-5537'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Invincibility', '1-999-724-654-5537', 'Phone', 'god-mode', '5 min of invincibility – re-enter to refresh (PAINKILLER)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Invincibility', 'RIGHT, A, RIGHT, LEFT, RIGHT, RB, RIGHT, LEFT, A, Y', 'Xbox', 'god-mode', '5 minutes of invincibility – re-enter to refresh'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Invincibility', 'RIGHT, X, RIGHT, LEFT, RIGHT, R1, RIGHT, LEFT, X, TRIANGLE', 'PlayStation', 'god-mode', '5 minutes of invincibility – re-enter to refresh'
FROM games g WHERE g.slug = 'gta';

-- Max Health & Armor
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Health & Armor', 'TURTLE', 'PC', 'god-mode', 'Restores health and armor to full. Phone: 1-999-887-853'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Health & Armor', '1-999-887-853', 'Phone', 'god-mode', 'Restores health and armor to full (TURTLE)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Health & Armor', 'B, LB, Y, RT, A, X, B, RIGHT, X, LB, LB, LB', 'Xbox', 'god-mode', 'Restores health and armor to full'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Health & Armor', 'CIRCLE, L1, TRIANGLE, R2, X, SQUARE, CIRCLE, RIGHT, SQUARE, L1, L1, L1', 'PlayStation', 'god-mode', 'Restores health and armor to full'
FROM games g WHERE g.slug = 'gta';

-- Recharge Special Ability
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Recharge Special Ability', 'POWERUP', 'PC', 'god-mode', 'Instantly recharges your character special ability. Phone: 1-999-769-3787'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Recharge Special Ability', '1-999-769-3787', 'Phone', 'god-mode', 'Instantly recharges your character special ability (POWERUP)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Recharge Special Ability', 'A, A, X, RB, LB, A, RIGHT, LEFT, A', 'Xbox', 'god-mode', 'Instantly recharges your character special ability'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Recharge Special Ability', 'X, X, SQUARE, R1, L1, X, RIGHT, LEFT, X', 'PlayStation', 'god-mode', 'Instantly recharges your character special ability'
FROM games g WHERE g.slug = 'gta';

-- Give All Weapons
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give All Weapons', 'TOOLUP', 'PC', 'weapons', 'Gives all weapons with full ammo. Phone: 1-999-866-587'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give All Weapons', '1-999-866-587', 'Phone', 'weapons', 'Gives all weapons with full ammo (TOOLUP)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give All Weapons', 'Y, RT, LEFT, LB, A, RIGHT, Y, DOWN, X, LB, LB, LB', 'Xbox', 'weapons', 'Gives all weapons with full ammo'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give All Weapons', 'TRIANGLE, R2, LEFT, L1, X, RIGHT, TRIANGLE, DOWN, SQUARE, L1, L1, L1', 'PlayStation', 'weapons', 'Gives all weapons with full ammo'
FROM games g WHERE g.slug = 'gta';

-- Explosive Ammo Rounds
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Ammo Rounds', 'HIGHEX', 'PC', 'weapons', 'All bullets become explosive rounds. Phone: 1-999-444-439'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Ammo Rounds', '1-999-444-439', 'Phone', 'weapons', 'All bullets become explosive rounds (HIGHEX)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Ammo Rounds', 'RIGHT, X, A, LEFT, RB, RT, LEFT, RIGHT, RIGHT, LB, LB, LB', 'Xbox', 'weapons', 'All bullets become explosive rounds'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Ammo Rounds', 'RIGHT, SQUARE, X, LEFT, R1, R2, LEFT, RIGHT, RIGHT, L1, L1, L1', 'PlayStation', 'weapons', 'All bullets become explosive rounds'
FROM games g WHERE g.slug = 'gta';

-- Flaming Bullets
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Flaming Bullets', 'INCENDIARY', 'PC', 'weapons', 'Your bullets set things on fire. Phone: 1-999-462-363-4279'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Flaming Bullets', '1-999-462-363-4279', 'Phone', 'weapons', 'Your bullets set things on fire (INCENDIARY)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Flaming Bullets', 'LB, RB, X, RB, LEFT, RT, RB, LEFT, X, RIGHT, LB, LB', 'Xbox', 'weapons', 'Your bullets set things on fire'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Flaming Bullets', 'L1, R1, SQUARE, R1, LEFT, R2, R1, LEFT, SQUARE, RIGHT, L1, L1', 'PlayStation', 'weapons', 'Your bullets set things on fire'
FROM games g WHERE g.slug = 'gta';

-- Explosive Melee
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Melee', 'HOTHANDS', 'PC', 'weapons', 'Punches and kicks cause explosions. Phone: 1-999-468-42637'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Melee', '1-999-468-42637', 'Phone', 'weapons', 'Punches and kicks cause explosions (HOTHANDS)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Melee', 'RIGHT, LEFT, A, Y, RB, B, B, B, LT', 'Xbox', 'weapons', 'Punches and kicks cause explosions'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Explosive Melee', 'RIGHT, LEFT, X, TRIANGLE, R1, CIRCLE, CIRCLE, CIRCLE, L2', 'PlayStation', 'weapons', 'Punches and kicks cause explosions'
FROM games g WHERE g.slug = 'gta';

-- Slow Motion Aim
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion Aim', 'DEADEYE', 'PC', 'stats', 'Slow motion when aiming – stacks up to 3x. Phone: 1-999-332-3393'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion Aim', '1-999-332-3393', 'Phone', 'stats', 'Slow motion when aiming – stacks up to 3x (DEADEYE)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion Aim', 'X, LT, RB, Y, LEFT, X, LT, RIGHT, A', 'Xbox', 'stats', 'Slow motion when aiming – stacks up to 3x'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion Aim', 'SQUARE, L2, R1, TRIANGLE, LEFT, SQUARE, L2, RIGHT, X', 'PlayStation', 'stats', 'Slow motion when aiming – stacks up to 3x'
FROM games g WHERE g.slug = 'gta';

-- Super Jump
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Super Jump', 'HOPTOIT', 'PC', 'fun', 'Jump extremely high – hold jump for higher leaps. Phone: 1-999-467-8648'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Super Jump', '1-999-467-8648', 'Phone', 'fun', 'Jump extremely high – hold jump for higher leaps (HOPTOIT)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Super Jump', 'LEFT, LEFT, Y, Y, RIGHT, RIGHT, LEFT, RIGHT, X, RB, RT', 'Xbox', 'fun', 'Jump extremely high – hold jump for higher leaps'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Super Jump', 'LEFT, LEFT, TRIANGLE, TRIANGLE, RIGHT, RIGHT, LEFT, RIGHT, SQUARE, R1, R2', 'PlayStation', 'fun', 'Jump extremely high – hold jump for higher leaps'
FROM games g WHERE g.slug = 'gta';

-- Fast Run
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Run', 'CATCHME', 'PC', 'fun', 'Run much faster than normal. Phone: 1-999-228-8463'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Run', '1-999-228-8463', 'Phone', 'fun', 'Run much faster than normal (CATCHME)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Run', 'Y, LEFT, RIGHT, RIGHT, LT, LB, X', 'Xbox', 'fun', 'Run much faster than normal'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Run', 'TRIANGLE, LEFT, RIGHT, RIGHT, L2, L1, SQUARE', 'PlayStation', 'fun', 'Run much faster than normal'
FROM games g WHERE g.slug = 'gta';

-- Fast Swim
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Swim', 'GOTGILLS', 'PC', 'fun', 'Swim much faster than normal. Phone: 1-999-468-44557'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Swim', '1-999-468-44557', 'Phone', 'fun', 'Swim much faster than normal (GOTGILLS)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Swim', 'LEFT, LEFT, LB, RIGHT, RIGHT, RT, LEFT, LT, RIGHT', 'Xbox', 'fun', 'Swim much faster than normal'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fast Swim', 'LEFT, LEFT, L1, RIGHT, RIGHT, R2, LEFT, L2, RIGHT', 'PlayStation', 'fun', 'Swim much faster than normal'
FROM games g WHERE g.slug = 'gta';

-- Skyfall
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Skyfall', 'SKYFALL', 'PC', 'fun', 'Drops you from the sky – use parachute or splat. Phone: 1-999-759-3255'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Skyfall', '1-999-759-3255', 'Phone', 'fun', 'Drops you from the sky – use parachute or splat (SKYFALL)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Skyfall', 'LB, LT, RB, RT, LEFT, RIGHT, LEFT, RIGHT, LB, LT, RB, RT, LEFT, RIGHT, LEFT, RIGHT', 'Xbox', 'fun', 'Drops you from the sky'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Skyfall', 'L1, L2, R1, R2, LEFT, RIGHT, LEFT, RIGHT, L1, L2, R1, R2, LEFT, RIGHT, LEFT, RIGHT', 'PlayStation', 'fun', 'Drops you from the sky'
FROM games g WHERE g.slug = 'gta';

-- Drunk Mode
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Drunk Mode', 'LIQUOR', 'PC', 'fun', 'Stumble around like you had too many. Phone: 1-999-547-861'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Drunk Mode', '1-999-547-861', 'Phone', 'fun', 'Stumble around like you had too many (LIQUOR)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Drunk Mode', 'Y, RIGHT, RIGHT, LEFT, RIGHT, X, B, LEFT', 'Xbox', 'fun', 'Stumble around like you had too many'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Drunk Mode', 'TRIANGLE, RIGHT, RIGHT, LEFT, RIGHT, SQUARE, CIRCLE, LEFT', 'PlayStation', 'fun', 'Stumble around like you had too many'
FROM games g WHERE g.slug = 'gta';

-- Slow Motion
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion', 'SLOWMO', 'PC', 'world', 'Everything goes into slow motion – stacks up to 3x. Phone: 1-999-756-966'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion', '1-999-756-966', 'Phone', 'world', 'Everything goes into slow motion – stacks up to 3x (SLOWMO)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion', 'Y, LEFT, RIGHT, RIGHT, X, RT, RB', 'Xbox', 'world', 'Everything goes into slow motion – stacks up to 3x'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slow Motion', 'TRIANGLE, LEFT, RIGHT, RIGHT, SQUARE, R2, R1', 'PlayStation', 'world', 'Everything goes into slow motion – stacks up to 3x'
FROM games g WHERE g.slug = 'gta';

-- Moon Gravity
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Moon Gravity', 'FLOATER', 'PC', 'world', 'Low gravity – vehicles float after jumps. Phone: 1-999-356-2837'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Moon Gravity', '1-999-356-2837', 'Phone', 'world', 'Low gravity – vehicles float after jumps (FLOATER)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Moon Gravity', 'LEFT, LEFT, LB, RB, LB, RIGHT, LEFT, LB, LEFT', 'Xbox', 'world', 'Low gravity – vehicles float after jumps'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Moon Gravity', 'LEFT, LEFT, L1, R1, L1, RIGHT, LEFT, L1, LEFT', 'PlayStation', 'world', 'Low gravity – vehicles float after jumps'
FROM games g WHERE g.slug = 'gta';

-- Change Weather
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Change Weather', 'MAKEITRAIN', 'PC', 'world', 'Cycles through weather types each use. Phone: 1-999-625-348-7246'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Change Weather', '1-999-625-348-7246', 'Phone', 'world', 'Cycles through weather types each use (MAKEITRAIN)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Change Weather', 'RT, A, LB, LB, LT, LT, LT, X', 'Xbox', 'world', 'Cycles through weather types each use'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Change Weather', 'R2, X, L1, L1, L2, L2, L2, SQUARE', 'PlayStation', 'world', 'Cycles through weather types each use'
FROM games g WHERE g.slug = 'gta';

-- Slippery Cars
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slippery Cars', 'SNOWDAY', 'PC', 'world', 'Cars lose traction and slide everywhere. Phone: 1-999-766-9329'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slippery Cars', '1-999-766-9329', 'Phone', 'world', 'Cars lose traction and slide everywhere (SNOWDAY)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slippery Cars', 'Y, RB, RB, LEFT, RB, LB, RT, LB', 'Xbox', 'world', 'Cars lose traction and slide everywhere'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slippery Cars', 'TRIANGLE, R1, R1, LEFT, R1, L1, R2, L1', 'PlayStation', 'world', 'Cars lose traction and slide everywhere'
FROM games g WHERE g.slug = 'gta';

-- Lower Wanted Level
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Lower Wanted Level', 'LAWYERUP', 'PC', 'stats', 'Removes one star from wanted level. Phone: 1-999-529-93787'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Lower Wanted Level', '1-999-529-93787', 'Phone', 'stats', 'Removes one star from wanted level (LAWYERUP)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Lower Wanted Level', 'RB, RB, B, RT, RIGHT, LEFT, RIGHT, LEFT, RIGHT, LEFT', 'Xbox', 'stats', 'Removes one star from wanted level'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Lower Wanted Level', 'R1, R1, CIRCLE, R2, RIGHT, LEFT, RIGHT, LEFT, RIGHT, LEFT', 'PlayStation', 'stats', 'Removes one star from wanted level'
FROM games g WHERE g.slug = 'gta';

-- Raise Wanted Level
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Raise Wanted Level', 'FUGITIVE', 'PC', 'stats', 'Adds one star to wanted level. Phone: 1-999-384-48483'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Raise Wanted Level', '1-999-384-48483', 'Phone', 'stats', 'Adds one star to wanted level (FUGITIVE)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Raise Wanted Level', 'RB, RB, B, RT, LEFT, RIGHT, LEFT, RIGHT, LEFT, RIGHT', 'Xbox', 'stats', 'Adds one star to wanted level'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Raise Wanted Level', 'R1, R1, CIRCLE, R2, LEFT, RIGHT, LEFT, RIGHT, LEFT, RIGHT', 'PlayStation', 'stats', 'Adds one star to wanted level'
FROM games g WHERE g.slug = 'gta';

-- Spawn Buzzard Helicopter
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Buzzard Helicopter', 'BUZZOFF', 'PC', 'vehicles', 'Spawns a Buzzard attack helicopter. Phone: 1-999-289-9633'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Buzzard Helicopter', '1-999-289-9633', 'Phone', 'vehicles', 'Spawns a Buzzard attack helicopter (BUZZOFF)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Buzzard Helicopter', 'B, B, LB, B, B, B, LB, LT, RB, Y, B, Y', 'Xbox', 'vehicles', 'Spawns a Buzzard attack helicopter'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Buzzard Helicopter', 'CIRCLE, CIRCLE, L1, CIRCLE, CIRCLE, CIRCLE, L1, L2, R1, TRIANGLE, CIRCLE, TRIANGLE', 'PlayStation', 'vehicles', 'Spawns a Buzzard attack helicopter'
FROM games g WHERE g.slug = 'gta';

-- Spawn Comet
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Comet', 'COMET', 'PC', 'vehicles', 'Spawns a Comet sports car. Phone: 1-999-266-38'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Comet', '1-999-266-38', 'Phone', 'vehicles', 'Spawns a Comet sports car (COMET)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Comet', 'RB, B, RT, RIGHT, LB, LT, A, A, X, RB', 'Xbox', 'vehicles', 'Spawns a Comet sports car'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Comet', 'R1, CIRCLE, R2, RIGHT, L1, L2, X, X, SQUARE, R1', 'PlayStation', 'vehicles', 'Spawns a Comet sports car'
FROM games g WHERE g.slug = 'gta';

-- Spawn Rapid GT
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Rapid GT', 'RAPIDGT', 'PC', 'vehicles', 'Spawns a Rapid GT sports car. Phone: 1-999-727-4348'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Rapid GT', '1-999-727-4348', 'Phone', 'vehicles', 'Spawns a Rapid GT sports car (RAPIDGT)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Rapid GT', 'RT, LB, B, RIGHT, LB, RB, RIGHT, LEFT, B, RT', 'Xbox', 'vehicles', 'Spawns a Rapid GT sports car'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Rapid GT', 'R2, L1, CIRCLE, RIGHT, L1, R1, RIGHT, LEFT, CIRCLE, R2', 'PlayStation', 'vehicles', 'Spawns a Rapid GT sports car'
FROM games g WHERE g.slug = 'gta';

-- Spawn Limo
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Limo', 'VINEWOOD', 'PC', 'vehicles', 'Spawns a stretch limousine. Phone: 1-999-846-39663'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Limo', '1-999-846-39663', 'Phone', 'vehicles', 'Spawns a stretch limousine (VINEWOOD)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Limo', 'RT, RIGHT, LT, LEFT, LEFT, RB, LB, B, RIGHT', 'Xbox', 'vehicles', 'Spawns a stretch limousine'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Limo', 'R2, RIGHT, L2, LEFT, LEFT, R1, L1, CIRCLE, RIGHT', 'PlayStation', 'vehicles', 'Spawns a stretch limousine'
FROM games g WHERE g.slug = 'gta';

-- Spawn Stunt Plane
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Stunt Plane', 'BARNSTORM', 'PC', 'vehicles', 'Spawns a Mallard stunt plane. Phone: 1-999-227-678-676'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Stunt Plane', '1-999-227-678-676', 'Phone', 'vehicles', 'Spawns a Mallard stunt plane (BARNSTORM)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Stunt Plane', 'B, RIGHT, LB, LT, LEFT, RB, LB, LB, LEFT, LEFT, A, Y', 'Xbox', 'vehicles', 'Spawns a Mallard stunt plane'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Stunt Plane', 'CIRCLE, RIGHT, L1, L2, LEFT, R1, L1, L1, LEFT, LEFT, X, TRIANGLE', 'PlayStation', 'vehicles', 'Spawns a Mallard stunt plane'
FROM games g WHERE g.slug = 'gta';

-- Spawn Duster Crop Plane
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Duster', 'FLYSPRAY', 'PC', 'vehicles', 'Spawns a Duster crop duster plane. Phone: 1-999-359-77729'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Duster', '1-999-359-77729', 'Phone', 'vehicles', 'Spawns a Duster crop duster plane (FLYSPRAY)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Duster', 'RIGHT, LEFT, RB, RB, RB, LEFT, Y, Y, A, B, LB, LB', 'Xbox', 'vehicles', 'Spawns a Duster crop duster plane'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Duster', 'RIGHT, LEFT, R1, R1, R1, LEFT, TRIANGLE, TRIANGLE, X, CIRCLE, L1, L1', 'PlayStation', 'vehicles', 'Spawns a Duster crop duster plane'
FROM games g WHERE g.slug = 'gta';

-- Spawn Caddy
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Caddy', 'HOLEIN1', 'PC', 'vehicles', 'Spawns a golf caddy. Phone: 1-999-4653-461'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Caddy', '1-999-4653-461', 'Phone', 'vehicles', 'Spawns a golf caddy (HOLEIN1)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Caddy', 'B, LB, LEFT, RB, LT, A, RB, LB, B, A', 'Xbox', 'vehicles', 'Spawns a golf caddy'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Caddy', 'CIRCLE, L1, LEFT, R1, L2, X, R1, L1, CIRCLE, X', 'PlayStation', 'vehicles', 'Spawns a golf caddy'
FROM games g WHERE g.slug = 'gta';

-- Spawn Trashmaster
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Trashmaster', 'TRASHED', 'PC', 'vehicles', 'Spawns a garbage truck. Phone: 1-999-872-433'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Trashmaster', '1-999-872-433', 'Phone', 'vehicles', 'Spawns a garbage truck (TRASHED)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Trashmaster', 'B, RB, B, RB, LEFT, LEFT, RB, LB, B, RIGHT', 'Xbox', 'vehicles', 'Spawns a garbage truck'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Trashmaster', 'CIRCLE, R1, CIRCLE, R1, LEFT, LEFT, R1, L1, CIRCLE, RIGHT', 'PlayStation', 'vehicles', 'Spawns a garbage truck'
FROM games g WHERE g.slug = 'gta';

-- Spawn BMX
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn BMX', 'BANDIT', 'PC', 'vehicles', 'Spawns a BMX bicycle. Phone: 1-999-226-348'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn BMX', '1-999-226-348', 'Phone', 'vehicles', 'Spawns a BMX bicycle (BANDIT)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn BMX', 'LEFT, LEFT, RIGHT, RIGHT, LEFT, RIGHT, X, B, Y, RB, RT', 'Xbox', 'vehicles', 'Spawns a BMX bicycle'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn BMX', 'LEFT, LEFT, RIGHT, RIGHT, LEFT, RIGHT, SQUARE, CIRCLE, TRIANGLE, R1, R2', 'PlayStation', 'vehicles', 'Spawns a BMX bicycle'
FROM games g WHERE g.slug = 'gta';

-- Spawn Sanchez Dirt Bike
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Sanchez', 'OFFROAD', 'PC', 'vehicles', 'Spawns a Sanchez dirt bike. Phone: 1-999-633-7623'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Sanchez', '1-999-633-7623', 'Phone', 'vehicles', 'Spawns a Sanchez dirt bike (OFFROAD)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Sanchez', 'B, A, LB, B, B, LB, B, RB, RT, LT, LB, LB', 'Xbox', 'vehicles', 'Spawns a Sanchez dirt bike'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Sanchez', 'CIRCLE, X, L1, CIRCLE, CIRCLE, L1, CIRCLE, R1, R2, L2, L1, L1', 'PlayStation', 'vehicles', 'Spawns a Sanchez dirt bike'
FROM games g WHERE g.slug = 'gta';

-- Spawn PCJ-600 Motorcycle
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn PCJ-600', 'ROCKET', 'PC', 'vehicles', 'Spawns a PCJ-600 motorcycle. Phone: 1-999-762-538'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn PCJ-600', '1-999-762-538', 'Phone', 'vehicles', 'Spawns a PCJ-600 motorcycle (ROCKET)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn PCJ-600', 'RB, RIGHT, LEFT, RIGHT, RT, LEFT, RIGHT, X, RIGHT, LT, LB, LB', 'Xbox', 'vehicles', 'Spawns a PCJ-600 motorcycle'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn PCJ-600', 'R1, RIGHT, LEFT, RIGHT, R2, LEFT, RIGHT, SQUARE, RIGHT, L2, L1, L1', 'PlayStation', 'vehicles', 'Spawns a PCJ-600 motorcycle'
FROM games g WHERE g.slug = 'gta';

-- Give Parachute
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Parachute', 'SKYDIVE', 'PC', 'spawn', 'Adds a parachute to your inventory. Phone: 1-999-759-3483'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Parachute', '1-999-759-3483', 'Phone', 'spawn', 'Adds a parachute to your inventory (SKYDIVE)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Parachute', 'LEFT, RIGHT, LB, LT, RB, RT, RT, LEFT, LEFT, RIGHT, LB', 'Xbox', 'spawn', 'Adds a parachute to your inventory'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Parachute', 'LEFT, RIGHT, L1, L2, R1, R2, R2, LEFT, LEFT, RIGHT, L1', 'PlayStation', 'spawn', 'Adds a parachute to your inventory'
FROM games g WHERE g.slug = 'gta';

-- Spawn Duke O'Death (next-gen only, requires "Duel" random event)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Duke O''Death', 'DEATHCAR', 'PC', 'vehicles', 'Spawns an armored Duke O''Death muscle car. Requires completing "Duel" random event. Next-gen/PC only. Phone: 1-999-332-84227 (DEATHCAR)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Duke O''Death', '1-999-332-84227', 'Phone', 'vehicles', 'Spawns an armored Duke O''Death. Requires "Duel" random event (DEATHCAR). PS4/PS5/Xbox One/Series/PC only.'
FROM games g WHERE g.slug = 'gta';

-- Spawn Dodo Seaplane (next-gen only, requires "Sea Plane" random event)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Dodo Seaplane', 'EXTINCT', 'PC', 'vehicles', 'Spawns a Dodo seaplane that lands on water. Requires "Sea Plane" random event. Next-gen/PC only. Phone: 1-999-398-4628 (EXTINCT)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Dodo Seaplane', '1-999-398-4628', 'Phone', 'vehicles', 'Spawns a Dodo seaplane. Requires "Sea Plane" random event (EXTINCT). PS4/PS5/Xbox One/Series/PC only.'
FROM games g WHERE g.slug = 'gta';

-- Spawn Kraken Submarine (next-gen only, requires Wildlife Photography Challenge)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Kraken Submarine', 'BUBBLES', 'PC', 'vehicles', 'Spawns a Kraken submarine for deep-sea exploration. Requires photographing all 20 animal species. Next-gen/PC only. Phone: 1-999-282-2537 (BUBBLES)'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Kraken Submarine', '1-999-282-2537', 'Phone', 'vehicles', 'Spawns a Kraken submarine. Requires Wildlife Photography Challenge (BUBBLES). PS4/PS5/Xbox One/Series/PC only.'
FROM games g WHERE g.slug = 'gta';

-- Director Mode (next-gen/PC only)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Director Mode', 'JRTALENT', 'PC', 'fun', 'Opens Director Mode – create custom scenes with any character model, set locations, time of day, and weather. Phone: 1-999-57-825368 (JRTALENT). Next-gen/PC only.'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Director Mode', '1-999-57-825368', 'Phone', 'fun', 'Opens Director Mode for creating custom scenes (JRTALENT). PS4/PS5/Xbox One/Series/PC only.'
FROM games g WHERE g.slug = 'gta';

-- Black Cellphones / EMP Drop (next-gen/PC only)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Black Cellphones (EMP Drop)', '1-999-367-3767', 'Phone', 'fun', 'Mysterious cheat – changes phone theme to black and triggers a small explosion above you. Phone: 1-999-367-3767 (EMPDROP). PS4/PS5/Xbox One/Series/PC only.'
FROM games g WHERE g.slug = 'gta';

-- Money Tip (no traditional money cheat exists in GTA V)
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Stock Market Money Exploit', 'Save before each Lester assassination mission. Invest in the target stock. Complete mission. Sell for huge profit.', 'All', 'money', 'Lester assassination missions: 1) Hotel Assassination – invest in BetaPharm (BAWSAQ). 2) Multi Target – invest in Debonaire (LCN) then sell and buy Redwood. 3) Vice Assassination – invest in Fruit (BAWSAQ). 4) Bus Assassination – invest in Vapid (BAWSAQ). 5) Construction – invest in GoldCoast (LCN). Can net over $2 billion per character.'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Hidden Package Money', 'Find the briefcase at the ocean floor near Paleto Bay – $12,000 every respawn. Also find the $25,000 case near the crashed plane off the coast.', 'All', 'money', 'Underwater money pickups respawn after switching characters. Use the submarine or scuba gear to farm them repeatedly.'
FROM games g WHERE g.slug = 'gta';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Armored Truck Robbery', 'Shoot the rear doors of Gruppe Sechs armored trucks to loot $3,000–$7,000 each. They spawn randomly around LS.', 'All', 'money', 'Armored trucks appear as blue dots on the minimap. Shoot the rear doors, grab the cash, and lose the cops.'
FROM games g WHERE g.slug = 'gta';

-- =============================================
-- Minecraft cheat codes (commands)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Creative Mode', '/gamemode creative', 'All', 'god-mode', 'Switch to creative mode – fly and unlimited blocks'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Survival Mode', '/gamemode survival', 'All', 'other', 'Switch back to survival mode'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spectator Mode', '/gamemode spectator', 'All', 'fun', 'Fly through blocks and observe – cannot interact with anything'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Diamonds', '/give @p diamond 64', 'All', 'spawn', 'Gives yourself a stack of 64 diamonds'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Netherite Ingots', '/give @p netherite_ingot 64', 'All', 'spawn', 'Gives yourself a stack of 64 netherite ingots'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Enchanted Golden Apple', '/give @p enchanted_golden_apple 64', 'All', 'spawn', 'Gives 64 enchanted golden apples (God Apples) – best food in the game'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Time Day', '/time set day', 'All', 'world', 'Sets the time to daytime (1000 ticks)'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Time Night', '/time set night', 'All', 'world', 'Sets the time to midnight (18000 ticks)'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Stop Weather', '/weather clear', 'All', 'world', 'Stops rain and thunderstorms immediately'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Teleport to Coordinates', '/tp @p X Y Z', 'All', 'other', 'Teleports you to specific coordinates – replace X Y Z with numbers'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Locate Structure', '/locate structure village', 'All', 'other', 'Finds the nearest village – also works with: monument, fortress, stronghold, mansion, bastion_remnant, trial_chambers'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Kill All Mobs', '/kill @e[type=!player]', 'All', 'fun', 'Kills all entities except players'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Enchant Held Item', '/enchant @p sharpness 5', 'All', 'weapons', 'Adds Sharpness V to your held weapon'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Keep Inventory on Death', '/gamerule keepInventory true', 'All', 'other', 'Keep your items when you die – essential for exploring'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Disable Mob Griefing', '/gamerule mobGriefing false', 'All', 'world', 'Prevents Creepers from destroying blocks and Endermen from picking up blocks'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Always Daylight', '/gamerule doDaylightCycle false', 'All', 'world', 'Stops the day/night cycle – combine with /time set day'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give XP Levels', '/xp add @p 100 levels', 'All', 'stats', 'Adds 100 XP levels for enchanting'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Summon Wither', '/summon wither', 'All', 'fun', 'Spawns the Wither boss at your location – CAUTION: very destructive!'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Difficulty Peaceful', '/difficulty peaceful', 'All', 'god-mode', 'Removes all hostile mobs and regenerates health rapidly'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Elytra', '/give @p elytra', 'All', 'spawn', 'Gives yourself an Elytra – use with fireworks to fly'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fill Command', '/fill X1 Y1 Z1 X2 Y2 Z2 diamond_block', 'All', 'fun', 'Fills an area with blocks – great for building. Replace coords and block type.'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Apply Effect', '/effect give @p speed 9999 5', 'All', 'stats', 'Gives permanent Speed V. Also try: strength, haste, jump_boost, night_vision, resistance'
FROM games g WHERE g.slug = 'minecraft';

-- =============================================
-- RDR2 cheat codes (enter in Settings > Cheats menu)
-- NOTE: Cheats disable saving and trophies. Some require newspaper purchases to unlock.
-- Newspapers: New Hanover Gazette (Valentine, Annesburg), Saint Denis Times (Rhodes, Saint Denis), Blackwater Ledger (Strawberry, Blackwater)
-- To find cheat phrases on newspapers: open satchel, grab paper, flip it over and zoom to the bottom tagline.
-- =============================================

-- HEALTH / STAMINA / DEAD EYE
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Refill Health, Stamina & Dead Eye', 'YOU FLOURISH BEFORE YOU DIE', 'All', 'god-mode', 'Instantly refills all three stat bars to maximum. No newspaper required. Found in a drawer at Snowfield Shack.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fortify All Bars (God Mode)', 'YOU SEEK MORE THAN THE WORLD OFFERS', 'All', 'god-mode', 'Fortifies Health, Stamina, and Dead Eye bars (gold cores) preventing drain temporarily. You can still die. Requires Saint Denis Times No. 52.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Stamina', 'THE LUCKY BE STRONG EVERMORE', 'All', 'stats', 'Infinite stamina for both player and horse. Requires Blackwater Ledger No. 68 (after Ch.5 mission "Dear Uncle Tacitus").'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Dead Eye', 'BE GREEDY ONLY FOR FORESIGHT', 'All', 'stats', 'Dead Eye core never drains. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Increase Max Stats', 'SEEK ALL THE BOUNTY OF THIS PLACE', 'All', 'stats', 'Increases your maximum Health, Stamina, and Dead Eye bars. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
-- DEAD EYE LEVELS
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Dead Eye Level 1', 'GUIDE ME BETTER', 'All', 'stats', 'Sets Dead Eye to Level 1 (basic slow-motion targeting). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Dead Eye Level 2', 'MAKE ME BETTER', 'All', 'stats', 'Sets Dead Eye to Level 2 (manually place shots). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Dead Eye Level 3', 'I SHALL BE BETTER', 'All', 'stats', 'Sets Dead Eye to Level 3 (remain in Dead Eye after firing). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Dead Eye Level 4', 'I STILL SEEK MORE', 'All', 'stats', 'Sets Dead Eye to Level 4 (highlights fatal areas while targeting). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Dead Eye Level 5', 'I SEEK AND I FIND', 'All', 'stats', 'Sets Dead Eye to Level 5 (highlights fatal AND critical hit areas). Requires New Hanover Gazette No. 36 (after Ch.6 "The King''s Son").'
FROM games g WHERE g.slug = 'rdr2';

-- WEAPONS
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Ammo', 'ABUNDANCE IS THE DULLEST DESIRE', 'All', 'weapons', 'Unlimited ammunition for all weapons. Requires New Hanover Gazette No. 27 (available from Chapter 1).'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Simple/Basic Weapons', 'A SIMPLE LIFE, A BEAUTIFUL DEATH', 'All', 'weapons', 'Gives basic weapons: Cattleman Revolver, Lancaster Repeater, Springfield Rifle, Double-Barreled Shotgun. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Heavy Weapons', 'GREED IS AMERICAN VIRTUE', 'All', 'weapons', 'Gives heavy weapons: Pump-Action Shotgun, Bolt Action Rifle, Mauser Pistol, Semi-Auto Pistol. Requires Saint Denis Times No. 46 (after Ch.3 "Advertising, the New American Art").'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Stealth Weapons', 'DEATH IS SILENCE', 'All', 'weapons', 'Gives stealth weapons: Bow, Throwing Knives, Tomahawk, Machete. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Gunslinger Weapons', 'HISTORY IS WRITTEN BY FOOLS', 'All', 'weapons', 'Gives weapons from the gunslinger side missions (Flaco''s Revolver, Midnight''s Pistol, etc.). No newspaper required. Found on ceiling of Van Horn Trading Post.'
FROM games g WHERE g.slug = 'rdr2';

-- HORSES & VEHICLES
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Race Horse', 'RUN! RUN! RUN!', 'All', 'vehicles', 'Spawns a fast race horse with high speed and acceleration. No newspaper required. Found on chalkboard at Fort Riggs.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn War Horse', 'YOU ARE A BEAST BUILT FOR WAR', 'All', 'vehicles', 'Spawns a powerful War Horse with high health and stamina. Requires Blackwater Ledger No. 72 (Epilogue Part I).'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Superior Horse (Arabian)', 'YOU WANT MORE THAN YOU HAVE', 'All', 'vehicles', 'Spawns a Rose Grey Bay Arabian, one of the best horses in the game. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Random Horse', 'YOU WANT SOMETHING NEW', 'All', 'vehicles', 'Spawns a random horse breed nearby. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Wagon', 'KEEP YOUR DREAMS SIMPLE', 'All', 'vehicles', 'Spawns a wagon nearby. No newspaper required. Found on the ice at Cairn Lake.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Buggy (Horse & Cart)', 'KEEP YOUR DREAMS LIGHT', 'All', 'vehicles', 'Spawns a horse-drawn buggy. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Stagecoach', 'THE BEST OF THE OLD WAYS', 'All', 'vehicles', 'Spawns a stagecoach nearby. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Circus Wagon', 'WOULD YOU BE HAPPIER AS A CLOWN?', 'All', 'vehicles', 'Spawns a circus wagon for a unique ride. Requires Blackwater Ledger No. 73 (after Epilogue Part I).'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Increase Horse Bonding', 'MY KINGDOM IS A HORSE', 'All', 'vehicles', 'Instantly increases bonding level with all owned horses. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Call Horse From Anywhere', 'BETTER THAN MY DOG', 'All', 'vehicles', 'Whistle for your horse from any distance, no matter how far away. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';

-- MONEY & RESOURCES
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Get $500', 'GREED IS NOW A VIRTUE', 'All', 'money', 'Adds $500 to your wallet. Can be used repeatedly. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'All Crafting Recipes', 'EAT OF KNOWLEDGE', 'All', 'other', 'Unlocks every crafting recipe in the game (tonics, ammo, food). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'All Camp Upgrades', 'SHARE', 'All', 'other', 'Unlocks all camp upgrades and max supply levels (fast travel, leather working tools, chicken coop, etc.). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';

-- HONOR
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Max Honor', 'VIRTUE UNEARNED IS NOT VIRTUE', 'All', 'stats', 'Sets honor to maximum (good). Requires Blackwater Ledger No. 67 (after Ch.4 mission "Urban Pleasures").'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Minimum Honor', 'YOU REVEL IN YOUR DISGRACE, I SEE', 'All', 'stats', 'Sets honor to minimum (evil). No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Neutral Honor', 'BALANCE. ALL IS BALANCE', 'All', 'stats', 'Resets honor to the neutral midpoint. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';

-- WANTED LEVEL
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Increase Wanted Level', 'YOU WANT PUNISHMENT', 'All', 'fun', 'Raises your wanted level. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Decrease Wanted Level', 'YOU WANT FREEDOM', 'All', 'fun', 'Lowers your wanted level. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Clear All Bounties', 'YOU WANT EVERYONE TO GO AWAY', 'All', 'fun', 'Clears all bounties and makes locked-down towns friendly again. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';

-- WORLD / MAP / OUTFITS
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Reveal Full Map', 'YOU LONG FOR SIGHT AND SEE NOTHING', 'All', 'world', 'Removes fog of war, revealing the entire map. Requires New Hanover Gazette No. 31 (after Ch.3 "Blood Feuds, Ancient and Modern").'
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Unlock All Outfits', 'VANITY. ALL IS VANITY', 'All', 'spawn', 'Unlocks every outfit in Arthur''s wardrobe. Requires New Hanover Gazette No. 31 (after Ch.3 "Blood Feuds, Ancient and Modern").'
FROM games g WHERE g.slug = 'rdr2';

-- FUN / MISC
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Drunk Mode', 'A FOOL ON COMMAND', 'All', 'fun', 'Arthur becomes permanently drunk until deactivated. Found inside the mine at Millesani Claim. No newspaper required.'
FROM games g WHERE g.slug = 'rdr2';

-- =============================================
-- Elder Scrolls (Skyrim) cheat codes (PC console commands – press ~ to open)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'God Mode', 'tgm', 'PC', 'god-mode', 'Toggle god mode – infinite health, stamina, magicka, and carry weight'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Immortal Mode', 'tim', 'PC', 'god-mode', 'Toggle immortal mode – can take damage but health won''t reach zero'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Toggle No Clip', 'tcl', 'PC', 'fun', 'Walk through walls and fly – toggle collision off'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Add Gold', 'player.additem 0000000f 10000', 'PC', 'money', 'Adds 10,000 gold to your inventory. Change number for more/less.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Add Lockpicks', 'player.additem 0000000a 100', 'PC', 'spawn', 'Adds 100 lockpicks to your inventory'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Player Level', 'player.setlevel 50', 'PC', 'stats', 'Sets your character to level 50 (change number as desired)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Add Perk Points', 'player.addperk <perkID>', 'PC', 'stats', 'Adds a specific perk. Use help "perk name" to find IDs.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Advance Skill', 'advskill <skill> 1000000', 'PC', 'stats', 'Advances a skill by XP amount (e.g., advskill smithing 1000000). Earns perk points too!'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Unlock All Shouts', 'psb', 'PC', 'weapons', 'Unlocks every spell, shout, and power in the game (Player Spell Book)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Kill Target', 'kill', 'PC', 'fun', 'Click on any NPC or enemy and type kill to instantly defeat them'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Resurrect Target', 'resurrect', 'PC', 'fun', 'Click on a dead NPC and type resurrect to bring them back to life'
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
SELECT g.id, 'Toggle Combat AI', 'tcai', 'PC', 'fun', 'NPCs won''t fight – great for exploring dungeons peacefully'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Skill Level', 'player.setav <skill> 100', 'PC', 'stats', 'Sets any skill to 100 (e.g., player.setav destruction 100, smithing, enchanting)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Daedric Sword', 'player.additem 000139B9 1', 'PC', 'weapons', 'Adds a Daedric Sword to your inventory – one of the best weapons'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Daedric Armor Set', 'player.additem 000139B4 1', 'PC', 'spawn', 'Adds Daedric Armor (body). Also: 000139B6 (boots), 000139B5 (gauntlets), 000139B7 (helmet)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Dragonbone Weapons', 'player.additem XX014FCE 1', 'PC', 'weapons', 'Dragonbone Sword. Replace XX with Dawnguard load order (usually 02). Also: 014FCC (bow), 014FCB (battleaxe)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Teleport to NPC', 'player.moveto <refID>', 'PC', 'other', 'Teleports you to any NPC. Click on NPC first to see their RefID, or use help command.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Complete Current Quest', 'completequest <questID>', 'PC', 'other', 'Instantly completes a quest. Use sqt to see active quest IDs. Use with caution – may break quest chains.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Toggle Map Markers', 'tmm 1', 'PC', 'other', 'Reveals all map markers. Use tmm 0 to hide them. tmm 1,0,1 shows markers without fast travel.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Change Player Scale', 'player.setscale 2', 'PC', 'fun', 'Makes your character twice as big. Use 0.5 for half size. Default is 1.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Free Camera Mode', 'tfc', 'PC', 'fun', 'Detaches camera for cinematic shots. Add 1 (tfc 1) to also freeze time.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Timescale', 'set timescale to 1', 'PC', 'world', 'Sets real-time speed. Default is 20 (1 real second = 20 game minutes). Set to 1 for real-time.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Add Dragon Souls', 'player.modav dragonsouls 10', 'PC', 'stats', 'Adds 10 dragon souls for unlocking shouts'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Relationship', 'setrelationshiprank player 4', 'PC', 'other', 'Click on NPC first. Sets them as a lover (4), ally (3), friend (2), etc.'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Restore All Health', 'player.restoreav health 1000', 'PC', 'god-mode', 'Instantly heals you to full health'
FROM games g WHERE g.slug = 'elder-scrolls';

-- =============================================
-- Seed Elden Ring cheats (exploits and hidden mechanics – no console commands)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Rune Farm: Mohgwyn Palace', 'Reach Mohgwyn Palace via Varre questline or teleporter in Consecrated Snowfield. Farm the Albinaurics near the Dynasty Mausoleum for 40,000+ runes per run.', 'All', 'money', 'Best rune farming spot in the game. Use AoE weapon arts like Sacred Relic Sword for maximum efficiency. Over 2 million runes per hour.'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Rune Farm: Boulder Trick', 'Rest at Lenne''s Rise grace in Dragonbarrow. Ride Torrent up the road until the giant ball spawns and rolls off the cliff. 1,952 runes per death.', 'All', 'money', 'Easy early-game rune farm. Takes about 10 seconds per cycle. No combat required.'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite FP: Cerulean Hidden Tear', 'Mix the Cerulean Hidden Tear in the Flask of Wondrous Physick for zero FP consumption for 15 seconds.', 'All', 'stats', 'Found at the Minor Erdtree in Mt. Gelmir. Cast Comet Azur during this window for massive boss damage.'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Comet Azur Boss Melt', 'Use Terra Magica + Cerulean Hidden Tear + Comet Azur to channel a continuous beam for massive damage.', 'All', 'weapons', 'One of the most powerful combos. Requires 60 INT. Terra Magica from Raya Lucaria, Comet Azur from Primeval Sorcerer Azur in Mt. Gelmir.'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Mimic Tear Spirit Ash', 'Equip your best gear, summon Mimic Tear, then swap to your preferred loadout. The mimic keeps the summoning gear.', 'All', 'other', 'Found in Nokron, Eternal City after defeating Radahn. Best spirit ash in the game – essentially a second player.'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Deathbird Cheese: Holy Damage', 'Deathbirds and Death Rite Birds are extremely weak to Holy damage. Use Sacred Blade or other Holy weapon arts for massive damage.', 'All', 'weapons', 'Holy Pots also work extremely well. These birds appear only at night in specific locations.'
FROM games g WHERE g.slug = 'elden-ring';

-- =============================================
-- Seed quests
-- =============================================

-- GTA V quests (Strangers & Freaks, Secrets, Collectibles)
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Epsilon Program', 'Complete the Epsilon Program questline as Michael to join the cult. Donate money, wear robes, run in the desert, and eventually steal $2.1 million from Cris Formage.', 'secret', 'Los Santos', 'hard', false, 1
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Mount Chiliad Mystery', 'Decipher the mural on Mount Chiliad. Visit the summit at 3am in foggy weather to see the UFO. Also find UFOs at Fort Zancudo and over Sandy Shores after 100% completion.', 'easter_egg', 'Blaine County', 'hard', false, 2
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Spaceship Parts Collection', 'Collect all 50 spaceship parts scattered across San Andreas to unlock the Space Docker vehicle at Omega''s garage.', 'secret', 'San Andreas', 'medium', false, 3
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Letter Scraps Collection', 'Find all 50 letter scraps to piece together a confession letter revealing the identity of a murderer. Leads to a confrontation.', 'secret', 'San Andreas', 'medium', false, 4
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Submarine Pieces (Nuclear Waste)', 'Collect all 30 nuclear waste barrels from the ocean floor using the submarine. Rewards $690,000 total.', 'secret', 'Pacific Ocean', 'hard', false, 5
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Strangers: Maude Bounty Hunting', 'Complete 4 bounty hunting missions for Maude (Trevor). Capture targets alive for $10,000 each or kill them for $5,000.', 'npc_encounter', 'Blaine County', 'medium', false, 6
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Strangers: Hao Street Races', 'Win all 5 of Hao''s street races with Franklin to unlock vehicle mods and boost Los Santos Customs rep.', 'npc_encounter', 'Los Santos', 'medium', false, 7
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Strangers: Paparazzo', 'Help Beverly the paparazzo get celebrity photos and videos in a multi-part quest chain.', 'npc_encounter', 'Los Santos', 'easy', false, 8
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Bigfoot / The Last One', 'After 100% completion, play as Franklin to find the golden peyote plant and hunt Bigfoot (Teen Wolf) in the wilderness.', 'easter_egg', 'Blaine County', 'hard', false, 9
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Peyote Plant Experiences', 'Find 27 peyote plants across the map to play as various animals including dogs, cats, hawks, sharks, and even Sasquatch.', 'easter_egg', 'San Andreas', 'medium', false, 10
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Stunt Jumps', 'Complete all 50 unique stunt jumps across San Andreas for 100% completion.', 'mini_event', 'San Andreas', 'medium', false, 11
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Under the Bridge Challenges', 'Fly under all 50 bridges in San Andreas using planes or helicopters.', 'mini_event', 'San Andreas', 'hard', false, 12
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Random Events: Hitchhiker', 'Pick up hitchhikers, stop robberies, and intervene in other random events for cash rewards and special encounters.', 'mini_event', 'San Andreas', 'easy', true, 13
FROM games g WHERE g.slug = 'gta';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Infinite 8 Killer Mystery', 'Find 8 bodies in the waters near Paleto Bay and piece together the story of the Infinity 8 serial killer. Related to the Infinity Killer diary entries.', 'easter_egg', 'Blaine County', 'medium', false, 14
FROM games g WHERE g.slug = 'gta';

-- Elden Ring quests (NPC questlines, secrets, missable content)
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Ranni''s Questline', 'Follow Ranni through Nokron, Lake of Rot, and Moonlight Altar for the Age of Stars ending. Involves Blaidd, Iji, and Seluvis.', 'npc_encounter', 'Liurnia', 'hard', true, 1
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Fia''s Deathbed Companion', 'Follow Fia to Deeproot Depths. Fight Lichdragon Fortissax for the Mending Rune of the Death-Prince ending.', 'npc_encounter', 'Roundtable Hold', 'hard', true, 2
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Goldmask''s Age of Order', 'Help Corhyn and Goldmask solve the Erdtree regression puzzle for the Age of Order ending.', 'npc_encounter', 'Altus Plateau', 'hard', true, 3
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Dung Eater''s Curse', 'Feed the Dung Eater Seedbed Curses for the Mending Rune of the Fell Curse – the darkest ending.', 'npc_encounter', 'Roundtable Hold', 'hard', true, 4
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Millicent''s Journey', 'Help Millicent from Church of the Plague through the Haligtree. Choose help or betray for Rotten Winged Sword Insignia or Prosthesis.', 'npc_encounter', 'Caelid', 'hard', true, 5
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Alexander Iron Fist', 'Help Alexander the Jar from Stormhill to Farum Azula. Final duel rewards Shard of Alexander – best weapon art talisman.', 'npc_encounter', 'Stormhill', 'medium', true, 6
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Blaidd the Half-Wolf', 'Follow Blaidd from Mistwood to Radahn''s festival. Tied to Ranni''s quest – find him mad at Ranni''s Rise.', 'npc_encounter', 'Limgrave', 'medium', true, 7
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Nepheli Loux''s Path', 'Help Nepheli from Stormveil to Village of Albinaurics. Give Stormhawk King ash to make her ruler of Limgrave.', 'npc_encounter', 'Stormveil Castle', 'medium', true, 8
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Sellen''s Sorcery Quest', 'Help Sellen gather primal glintstone bodies. Choose Sellen or Jerren at Raya Lucaria for different rewards.', 'npc_encounter', 'Limgrave', 'hard', true, 9
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Patches the Untethered', 'Spare Patches in Murkwater Cave for a merchant. He appears at Volcano Manor and Shaded Castle too.', 'npc_encounter', 'Murkwater Cave', 'medium', true, 10
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Volcano Manor Contracts', 'Complete 3 Tarnished assassination contracts for Tanith to access Rykard without navigating the dungeon.', 'secret', 'Mt. Gelmir', 'hard', true, 11
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Varre (Mohgwyn Access)', 'Complete Varre''s quest at Rose Church for Pureblood Knight''s Medal – teleports to Mohgwyn Palace rune farm.', 'secret', 'Liurnia', 'medium', true, 12
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hyetta & Three Fingers', 'Give Hyetta Shabriri Grapes to reach the Three Fingers for the Frenzied Flame ending.', 'secret', 'Various', 'hard', true, 13
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Boc the Seamster', 'Find Boc as a tree in Limgrave. Becomes your tailor. Tell him he''s beautiful – don''t give him a Larval Tear.', 'npc_encounter', 'Limgrave', 'easy', true, 14
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Nokron Eternal City', 'Explore underground after defeating Radahn. Contains Mimic Tear, Fingerslayer Blade, and Ranni quest items.', 'secret', 'Underground', 'hard', false, 15
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hidden Wall in Volcano Manor', 'Hit the illusory wall in Volcano Manor hallway for a secret path with unique loot.', 'secret', 'Mt. Gelmir', 'medium', false, 16
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Finger Reader Crone Messages', 'Find all finger reader crones for cryptic lore hints.', 'easter_egg', 'Various', 'easy', false, 17
FROM games g WHERE g.slug = 'elden-ring';

-- Zelda: Tears of the Kingdom quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Dragon Tear Memories', 'Find all 12 Dragon Tear geoglyphs to piece together Zelda''s full journey to the past.', 'secret', 'Hyrule', 'medium', false, 1
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Yiga Clan Infiltration', 'Infiltrate the Yiga Clan hideout. Find Master Kohga encounters in the Depths throughout the game.', 'mini_event', 'Gerudo Desert', 'hard', false, 2
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hestu''s Maracas', 'Return Hestu''s maracas and trade Korok seeds for inventory slot upgrades at Lookout Landing.', 'npc_encounter', 'Various', 'easy', false, 3
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Tarrey Town Construction', 'Help Hudson build a town by recruiting NPCs whose names end in "-son". Unlocks the wedding ceremony.', 'npc_encounter', 'Akkala', 'medium', false, 4
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Lord of the Mountain', 'Ride the mythical Lord of the Mountain at Satori Mountain when the green glow appears. Cannot be stabled.', 'easter_egg', 'Satori Mountain', 'medium', false, 5
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Eventide Island Trial', 'Survive Eventide Island stripped of all equipment. Complete 3 shrines to clear the trial.', 'mini_event', 'Necluda Sea', 'hard', false, 6
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'All 152 Shrines', 'Discover and complete all 152 shrines across Surface, Sky Islands, and Depths for Light Blessings.', 'secret', 'Hyrule', 'hard', false, 7
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Korok Seed Collection', 'Find all 1000 Korok seeds hidden across Hyrule. Many require Ultrahand or Ascend.', 'secret', 'Hyrule', 'hard', false, 8
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Depths Exploration', 'Fully explore the Depths by activating all Lightroots. Find Poe and Bargainer Statues.', 'secret', 'The Depths', 'hard', false, 9
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Master Sword Recovery', 'Track the Light Dragon across the sky. Need 2 full stamina wheels to pull the Master Sword out.', 'secret', 'Sky', 'hard', false, 10
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Great Fairy Fountains', 'Restore all 4 Great Fairies by bringing the traveling musician troupe to each. Upgrades armor to max.', 'npc_encounter', 'Various', 'medium', false, 11
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Robbie''s Research', 'Help Robbie at Hateno lab for Purah Pad upgrades: Travel Medallion, Hero''s Path, Sensor+.', 'npc_encounter', 'Hateno', 'medium', false, 12
FROM games g WHERE g.slug = 'zelda';

-- Minecraft quests (objectives and challenges)
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Beat the Ender Dragon', 'Find a Stronghold with Eyes of Ender, enter The End, and defeat the Ender Dragon boss.', 'mini_event', 'The End', 'hard', false, 1
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Defeat the Wither', 'Gather 3 Wither Skeleton skulls and soul sand to summon the Wither. Rewards a Nether Star for a Beacon.', 'mini_event', 'Nether', 'hard', false, 2
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Raid an Ocean Monument', 'Find an Ocean Monument and defeat 3 Elder Guardians. Obtain sponges and prismarine. Bring milk for Mining Fatigue.', 'mini_event', 'Ocean', 'hard', false, 3
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Find a Woodland Mansion', 'Locate a Woodland Mansion for Totems of Undying. Buy a map from a Cartographer villager.', 'secret', 'Dark Forest', 'hard', false, 4
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Discover an Ancient City', 'Find an Ancient City at Y=-52 in Deep Dark. Avoid the Warden. Loot Swift Sneak and Echo Shards.', 'secret', 'Deep Dark', 'hard', false, 5
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Trial Chambers', 'Find and clear Trial Chambers underground. Defeat Trial Spawners for the Mace weapon and Wind Charge.', 'mini_event', 'Underground', 'hard', false, 6
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Conquer a Bastion Remnant', 'Raid a Bastion in the Nether for Pigstep disc, Netherite scraps, and Snout Banner Pattern.', 'secret', 'Nether', 'hard', false, 7
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Music Disc Collection', 'Collect all discs including Pigstep and 5. Some from Creeper-killed-by-Skeleton drops, others from chests.', 'easter_egg', 'Various', 'medium', false, 8
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Villager Trading Hall', 'Create a trading hall with Librarians for enchanted books and Fletchers for emerald farming.', 'npc_encounter', 'Any Village', 'medium', false, 9
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Full Netherite Armor', 'Mine ancient debris at Y=15 in the Nether (bed/TNT mining) and upgrade diamond armor.', 'secret', 'Nether', 'hard', false, 10
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Explore End Cities', 'After the Ender Dragon, use gateway portals to reach End Cities. Find Elytra wings and Shulker Boxes.', 'secret', 'The End', 'hard', false, 11
FROM games g WHERE g.slug = 'minecraft';

-- RDR2 quests (Stranger missions, Easter eggs, collectibles, missable content)
-- Stranger Missions
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Veteran (Hamish)', 'Help Civil War veteran Hamish with 4 hunting/fishing challenges at O''Creagh''s Run. Poignant final encounter. Missable after Ch6.', 'npc_encounter', 'O''Creagh''s Run', 'medium', true, 1
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Widow Charlotte', 'Teach Charlotte Balfour to hunt, shoot, and survive in 3 encounters. Revisit as John in the epilogue.', 'npc_encounter', 'Roanoke Ridge', 'easy', true, 2
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Robot (Marko Dragic)', 'Help inventor Marko Dragic with experiments: remote boat and bringing his automaton to life in a thunderstorm. Find the robot wandering later.', 'npc_encounter', 'Saint Denis', 'medium', true, 3
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Artist (Charles Chatenay)', 'Help the French artist escape angry husbands and the law across 4 hilarious encounters in Saint Denis.', 'npc_encounter', 'Saint Denis', 'easy', true, 4
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Mayor (Henri Lemieux)', 'Get involved in political corruption with the Saint Denis mayor across 3 encounters. Blackmail and moral choices.', 'npc_encounter', 'Saint Denis', 'medium', true, 5
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Brother Dorkins', 'Help a monk raise money for the church through 3 encounters involving a donation con and a blind man.', 'npc_encounter', 'Saint Denis', 'easy', true, 6
FROM games g WHERE g.slug = 'rdr2';
-- Easter Eggs & Supernatural
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Strange Man''s Cabin', 'Find the cabin near Bayall Edge where a painting completes itself over the story. Mirrors show the Strange Man watching.', 'easter_egg', 'Bayall Edge', 'easy', false, 7
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Ghost Train of Lemoyne', 'At 3am near Bluewater Marsh railroad, witness a ghost train pass through. One-time event.', 'easter_egg', 'Lemoyne', 'easy', true, 8
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Ghost of Agnes Dowd', 'Visit Bluewater Marsh between 9pm-3am to see the ghost of Agnes Dowd tell her tragic story.', 'easter_egg', 'Bluewater Marsh', 'easy', false, 9
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'UFO Sightings', 'Find 2 UFOs: 1) Inside cabin near Hani''s Bethel at 2am, 2) Atop Mount Shann at 2am after finding the cabin.', 'easter_egg', 'Mount Shann', 'medium', false, 10
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Devil Man Cave', 'Find the hidden cave near Elysian Pool with satanic drawings and a mysterious altar.', 'easter_egg', 'Roanoke', 'medium', false, 11
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Giant Skeleton', 'Discover a massive skeleton hidden inside a cave in Mount Shann.', 'easter_egg', 'Mount Shann', 'medium', false, 12
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Meteor House', 'Find the house near Roanoke destroyed by a meteor strike. The crater and rock remain.', 'easter_egg', 'Roanoke', 'easy', false, 13
FROM games g WHERE g.slug = 'rdr2';
-- Hunts & Collectibles
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Animals Hunt', 'Track and hunt all 16 legendary animals. Sell pelts to the Trapper for unique clothing and trinkets from the Fence.', 'secret', 'Various', 'hard', false, 14
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Fish', 'Catch all 13 legendary fish and mail them to Jeremy Gill. Requires the Special Lure.', 'secret', 'Various', 'hard', false, 15
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Jack Hall Gang Treasure', 'Follow the 3-part treasure map chain for 2 gold bars ($1,000). First map from a stranger at Flatneck Station.', 'secret', 'Various', 'medium', false, 16
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'High Stakes Treasure', 'Follow the 3-part treasure map for 3 gold bars ($1,500). First map on a cliff near Cumberland Falls.', 'secret', 'Various', 'medium', false, 17
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Poisonous Trail Treasure', 'Follow the 4-part treasure map for 4 gold bars ($2,000). First map on a hill near Cairn Lake.', 'secret', 'Various', 'hard', false, 18
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Dinosaur Bones (30)', 'Find all 30 dinosaur bones for paleontologist Deborah MacGuiness. Rewards a special knife.', 'secret', 'Various', 'hard', false, 19
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Dreamcatchers (20)', 'Find all 20 dreamcatchers in trees. Rewards a unique item at the ancient burial site.', 'secret', 'Various', 'medium', false, 20
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Rock Carvings (10)', 'Find all 10 rock carvings for Francis Sinclair. Return to his cabin for a time-travel revelation.', 'secret', 'Various', 'medium', false, 21
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Cigarette Cards (144)', 'Collect all 144 cigarette cards across 12 sets. Mail complete sets for rewards.', 'secret', 'Various', 'medium', false, 22
FROM games g WHERE g.slug = 'rdr2';
-- Ambient Events
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Night Folk Encounters', 'Survive Night Folk ambushes in Bluewater Marsh at night. They lure with hanging bodies and crying sounds.', 'mini_event', 'Bluewater Marsh', 'hard', false, 23
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout Clearings', 'Clear all 6 gang hideouts: Shady Belle, Hanging Dog Ranch, Six Point Cabin, Beaver Hollow, Fort Mercer, Twin Rocks.', 'mini_event', 'Various', 'medium', false, 24
FROM games g WHERE g.slug = 'rdr2';
-- Missable Content
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Camp Activities', 'Play poker, dominoes, five finger fillet, and do companion item requests. ALL missable after Chapter 6.', 'missable', 'Camp', 'easy', true, 25
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Companion Item Requests', 'Camp members ask for items: Molly wants a pocket mirror, Jack a book, Pearson a rabbit, etc. Missable after Ch6.', 'missable', 'Camp', 'medium', true, 26
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hunting Challenges (9 Sets)', 'Complete 9 challenge categories: Bandit, Explorer, Gambler, Herbalist, Horseman, Hunter, Sharpshooter, Survivalist, Weapons Expert. 90 total challenges. Gambler 8 is pure RNG. Horseman 9 best in Epilogue. Completing all unlocks Legend of the East Outfit.', 'secret', 'Various', 'hard', false, 27
FROM games g WHERE g.slug = 'rdr2';

-- Additional RDR2 Stranger Missions
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Arcadia for Amateurs (Albert Mason)', 'A 4-part mission with wildlife photographer. Help photograph coyotes, horses, alligators, wolves. Albert gets into danger. Available from Chapter 2.', 'npc_encounter', 'Various', 'easy', false, 28
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Noblest of Men, and a Woman', 'Track 4 gunslingers: Granger, Flaco, Midnight, Black Belle. Each drops unique weapon. Ends with Calloway duel. MISSABLE WEAPONS. Chapter 2+.', 'npc_encounter', 'Various', 'medium', false, 29
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'A Fisher of Fish (Jeremy Gill)', 'Catch all 13 legendary fish with Special Lures. Mail from post office. Tragic ending after all 13. Chapter 4+.', 'npc_encounter', 'Various', 'hard', false, 30
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'American Dreams (Serial Killer)', 'Find 3 murder scenes with map pieces. Combine to find killer Edmund Lowry Jr. Reward: Ornate Dagger. Chapter 2+.', 'secret', 'Heartlands / Valentine', 'medium', false, 31
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'He''s British, Of Course (Penelope & Beau)', 'Romeo & Juliet between feuding Braithwaites and Grays. MISSABLE: Parts IV-V before Ch.4 ends.', 'npc_encounter', 'Rhodes', 'easy', true, 32
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Geology for Beginners (Francis Sinclair)', 'Find 10 rock carvings for possible time traveler. Return for mind-bending conclusion. Reward: $10, Bourbon, Rock Statue.', 'npc_encounter', 'Strawberry / Various', 'medium', false, 33
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Brothers and Sisters (Sister Calderon)', 'Honor mission at Saint Denis church. Faith and redemption. MISSABLE: Before "Our Best Selves."', 'npc_encounter', 'Saint Denis', 'easy', true, 34
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Do Not Seek Absolution (Edith Downes)', 'Ch.6 honor mission with Thomas Downes'' wife. MISSABLE: Chapter 6 only.', 'npc_encounter', 'Annesburg / Saint Denis', 'easy', true, 35
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Wisdom of the Elders (Rains Fall)', 'Honor mission at Wapiti Reservation. Help resist oppression. From Chapter 5.', 'npc_encounter', 'Wapiti Reservation', 'medium', true, 36
FROM games g WHERE g.slug = 'rdr2';

-- Additional RDR2 Easter Eggs
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Vampire of Saint Denis', 'Find 5 wall writings in Saint Denis. Visit marked alley after midnight. Defeat vampire for Ornate Dagger.', 'easter_egg', 'Saint Denis', 'medium', false, 37
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Devil Cave / Cave Hermit', 'Hidden Tunnel NW of Pronghorn Ranch. Cave hermit claims to be the Devil. Strange paintings on walls.', 'easter_egg', 'Big Valley, West Elizabeth', 'easy', false, 38
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Bigfoot Skeleton & Voice', 'Giant skeleton in Mount Shann cave. Near Wapiti: after studying 30+ animals, talk to invisible being in boulder cave.', 'easter_egg', 'Mount Shann / Wapiti', 'hard', false, 39
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Wolfman', 'Feral man with wolves in Roanoke Valley. Doesn''t know he''s human.', 'easter_egg', 'Roanoke Valley', 'easy', false, 40
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Manbearpig', 'Man-bear-pig hybrid in shack near Van Horn. South Park reference.', 'easter_egg', 'Van Horn, New Hanover', 'easy', false, 41
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Seven Statues Puzzle', 'Cave east of Donner Falls. Press buttons on statues with prime fingers. Reward: 3 gold bars.', 'secret', 'Donner Falls, Ambarino', 'medium', false, 42
FROM games g WHERE g.slug = 'rdr2';

-- All 16 Legendary Animals (individual entries)
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Grizzly Bear', 'Grizzlies East, north of O''Creagh''s Run. Early Hosea mission encounter. High-powered rifles.', 'secret', 'Grizzlies East, Ambarino', 'hard', false, 43
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary White Bison', 'NW Ambarino, west of Barrow Lagoon near Lake Isabella. Extreme cold area.', 'secret', 'Lake Isabella, Ambarino', 'hard', false, 44
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Buck (HUNT FIRST!)', 'Big Valley, west of Mount Shann. Buck Antler Trinket from Fence permanently improves ALL pelt quality.', 'secret', 'Big Valley, West Elizabeth', 'medium', false, 45
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Beaver', 'West of Van Horn, pond south of Elysian Pool.', 'secret', 'Van Horn, New Hanover', 'medium', false, 46
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Boar', 'Bluewater Marsh, east of Kamassa River. Aggressive charger.', 'secret', 'Bluewater Marsh, Lemoyne', 'medium', false, 47
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Fox', 'Mattock Pond, north of Rhodes. Small and fast.', 'secret', 'Mattock Pond, Lemoyne', 'medium', false, 48
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Ram', 'NW of Valentine, east of Cattail Pond.', 'secret', 'NW Valentine, New Hanover', 'medium', false, 49
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Elk', 'East of Fort Wallace, south of Bacchus Bridge.', 'secret', 'Fort Wallace, Ambarino', 'medium', false, 50
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Moose', 'Roanoke Ridge wooded lake. Hardest to find. Very rare spawn.', 'secret', 'Roanoke Ridge, New Hanover', 'hard', false, 51
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Coyote', 'West Lemoyne, south of Dewberry Creek.', 'secret', 'West Lemoyne', 'medium', false, 52
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Wolf', 'Cotorra Springs, north of Dakota River. Travels with pack.', 'secret', 'Cotorra Springs, Ambarino', 'hard', false, 53
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Alligator', 'Lagras Lake, SE Lemoyne. Requires Ch.4 "Country Pursuits." Massive and dangerous.', 'secret', 'Lagras, Lemoyne', 'hard', false, 54
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Tatanka Bison', 'South West Elizabeth, near Thieves Landing. Epilogue only.', 'secret', 'Thieves Landing', 'medium', false, 55
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Cougar', 'Gaptooth Ridge, west of Tumbleweed. Extremely aggressive. Epilogue only.', 'secret', 'Gaptooth Ridge, New Austin', 'hard', false, 56
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Pronghorn', 'Rio Bravo, west of Rio del Lobo Rock. Epilogue only.', 'secret', 'Rio Bravo, New Austin', 'medium', false, 57
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Legendary Panther (Most Elusive)', 'West of Shady Belle. ONLY after Master Hunter Rank 9. Can one-shot you. Bring shotgun and Dead Eye.', 'secret', 'Shady Belle, Lemoyne', 'hard', false, 58
FROM games g WHERE g.slug = 'rdr2';

-- Gang Hideouts (6+1)
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout: Six Point Cabin', 'O''Driscolls in Cumberland Forest. Ch.2 story encounter.', 'mini_event', 'Cumberland Forest', 'medium', false, 59
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout: Shady Belle', 'Lemoyne Raiders SW of Saint Denis. Ch.3 story.', 'mini_event', 'SW Saint Denis', 'medium', false, 60
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout: Beaver Hollow', 'Murfree Brood cave west of Annesburg. Tight corridors.', 'mini_event', 'Roanoke Ridge', 'hard', false, 61
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout: Hanging Dog Ranch', 'O''Driscolls north of Little Creek River. Becomes Laramie in Epilogue.', 'mini_event', 'West Elizabeth', 'hard', false, 62
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout: Thieves'' Landing', 'Del Lobos south of Blackwater. Epilogue only.', 'mini_event', 'New Austin', 'medium', false, 63
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Gang Hideout: Fort Mercer', 'Del Lobos SW of Armadillo. Most guarded. Epilogue only.', 'mini_event', 'Rio Bravo, New Austin', 'hard', false, 64
FROM games g WHERE g.slug = 'rdr2';

-- Missable Content
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Missable Weapons', 'Flaco''s Revolver, Granger''s Revolver, Midnight''s Pistol (Noblest of Men), Rare Rolling Block Rifle (Magicians for Sport), Calloway''s Revolver.', 'missable', 'Various', 'medium', true, 65
FROM games g WHERE g.slug = 'rdr2';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Guarma Animals (Chapter 5 Only)', 'Study in Guarma: Scarlet/Blue-Yellow/Great Green Macaws, Red-Footed Booby, snake species. Cannot return.', 'missable', 'Guarma', 'medium', true, 66
FROM games g WHERE g.slug = 'rdr2';

-- Elder Scrolls (Skyrim) quests
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Black Star', 'Choose Azura''s Star (white souls) or The Black Star (any soul, arguably better) in this Daedric quest.', 'npc_encounter', 'Azura''s Shrine', 'medium', false, 1
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'A Night to Remember', 'Accept Sanguine''s drinking contest at any inn for a wild quest across Skyrim. Rewards Sanguine Rose staff.', 'easter_egg', 'Any Inn', 'easy', false, 2
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Mind of Madness', 'Enter Pelagius'' mind in Solitude''s Blue Palace for the Sheogorath quest. Rewards the Wabbajack staff.', 'easter_egg', 'Solitude', 'medium', false, 3
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Destroy the Dark Brotherhood', 'Kill Astrid instead of a hostage to destroy the entire Brotherhood. Mutually exclusive with joining them.', 'secret', 'Abandoned Shack', 'hard', true, 4
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Notched Pickaxe', 'Climb to the very top of Throat of the World for this Minecraft/Notch reference pickaxe with unique enchantments.', 'easter_egg', 'Throat of the World', 'medium', false, 5
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Headless Horseman', 'Spot the Headless Horseman at night and follow him to Hamvir''s Rest for a master-level chest.', 'mini_event', 'Various Roads', 'easy', false, 6
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Paarthurnax Dilemma', 'Kill or spare Paarthurnax after the main quest. Killing pleases the Blades; sparing keeps the Greybeards.', 'missable', 'Throat of the World', 'hard', true, 7
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Blackreach Dragon (Vulthuryol)', 'Use Unrelenting Force on the giant orange orb in Blackreach to summon the hidden dragon Vulthuryol.', 'secret', 'Blackreach', 'hard', false, 8
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'M''aiq the Liar', 'Find M''aiq randomly wandering. He breaks the fourth wall with developer jokes and past game references.', 'npc_encounter', 'Random', 'easy', false, 9
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Forgotten Vale Paragons', 'Collect all 5 Paragons in the Forgotten Vale (Dawnguard DLC) to unlock secret treasure rooms.', 'secret', 'Forgotten Vale', 'hard', false, 10
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'All 15 Daedric Artifacts', 'Complete all 15 Daedric quests for every artifact: Mehrunes'' Razor, Volendrung, Mace of Molag Bal, etc. Unlocks Oblivion Walker.', 'secret', 'Various', 'hard', false, 11
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Ebony Warrior', 'At level 80, the Ebony Warrior challenges you to a duel at Last Vigil. One of the hardest fights in the game.', 'npc_encounter', 'Throat of the World', 'hard', false, 12
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Cicero & the Night Mother', 'Follow the jester Cicero through the Dark Brotherhood questline. Choose to kill or spare him.', 'npc_encounter', 'Various', 'medium', true, 13
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Forbidden Legend (Gauldur Amulet)', 'Reunite 3 fragments of the Gauldur Amulet from 3 dungeons. One of the best combined amulets.', 'secret', 'Various', 'hard', false, 14
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Dragon Priest Masks (8+1)', 'Collect all 8 Dragon Priest masks and place them at Labyrinthian''s altar to receive Konahrik.', 'secret', 'Various', 'hard', false, 15
FROM games g WHERE g.slug = 'elder-scrolls';

-- =============================================
-- Additional seed data – Batch 3 (new games & expanded content)
-- =============================================

-- =============================================
-- Fortnite cheats (Creative mode settings & pro tips)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Materials (Creative)', 'Island Settings > Infinite Resources: ON', 'All', 'god-mode', 'Enable unlimited building materials in Creative mode islands'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Instant Respawn (Creative)', 'Island Settings > Respawn Time: Instant', 'All', 'other', 'Set respawn timer to zero in Creative for uninterrupted practice'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Grant Weapons on Spawn', 'My Island > Starting Inventory > Add weapons', 'All', 'weapons', 'Pre-load any weapon loadout when players spawn in Creative islands'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Enable Flight (Creative)', 'Island Settings > Player Flight: ON', 'All', 'fun', 'Allow all players to fly freely in your Creative island'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Gravity Control (Creative)', 'Island Settings > Gravity: Low / Normal / High', 'All', 'fun', 'Change gravity level on your Creative island for moon-jump gameplay'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'No Fall Damage (Creative)', 'Island Settings > Fall Damage: OFF', 'All', 'god-mode', 'Disable fall damage on your Creative island for build practice'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Right-Hand Peek Trick', 'Always approach fights from the left so your camera peeks right', 'All', 'other', 'Fortnite is third-person with left-offset camera – right-hand peeks expose less of your body'
FROM games g WHERE g.slug = 'fortnite';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Scroll Wheel Edit Reset', 'Bind Edit Reset to Mouse Scroll Wheel', 'PC', 'other', 'Bind edit reset to scroll wheel for frame-perfect instant edit resets'
FROM games g WHERE g.slug = 'fortnite';

-- =============================================
-- Call of Duty (Warzone / MW3) cheats & Easter egg codes
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Bunker 11 Easter Egg', 'Find red phone > decode 3 Russian numbers > activate 3 blue phones > open Bunker 11', 'All', 'other', 'Warzone Verdansk multi-step Easter egg that unlocks a secret bunker with top-tier loot and a nuke blueprint'
FROM games g WHERE g.slug = 'cod';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Bunker Code Doors (1, 3, 10)', 'Bunker 1: 97264138 | Bunker 3: 87624851 | Bunker 10: 60274513', 'All', 'other', 'Permanent door codes for Verdansk bunkers – codes are the same every match'
FROM games g WHERE g.slug = 'cod';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Bunker 0 Binary Code', '01011000', 'All', 'other', 'Binary code for the letter X – opens the final secret Bunker 0 in Verdansk'
FROM games g WHERE g.slug = 'cod';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Winter Rebirth Gulag Easter Egg', 'Melt Outpost bunker with Thermite > grab SSD > melt Turbine door > read binary > enter code at Prison tunnel', 'All', 'other', 'Multi-step Easter egg on Winter Rebirth Island that opens the old Gulag for a free weapon blueprint'
FROM games g WHERE g.slug = 'cod';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Haven''s Hollow Secret Cave', 'Look behind the waterfall in the northern portion of Haven''s Hollow', 'All', 'other', 'Hidden cave entrance behind the waterfall on the Haven''s Hollow map with bonus loot'
FROM games g WHERE g.slug = 'cod';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Slide Cancel Movement', 'Sprint > Slide > Jump > Sprint (repeat)', 'All', 'other', 'Slide cancelling for faster movement – essential advanced movement tech in Warzone'
FROM games g WHERE g.slug = 'cod';

-- =============================================
-- Additional Minecraft cheats (commands not already seeded)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Teleport to Player', '/tp @p <playername>', 'All', 'other', 'Teleport yourself to another player''s location instantly'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Clone Structure', '/clone <x1> <y1> <z1> <x2> <y2> <z2> <dest_x> <dest_y> <dest_z>', 'All', 'world', 'Copy-paste a region of blocks from one location to another – great for duplicating builds'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Locate Biome', '/locate biome minecraft:cherry_grove', 'All', 'other', 'Find the nearest biome of a specific type – works with any biome name'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set World Spawn', '/setworldspawn', 'All', 'world', 'Set the world spawn point to your current position'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Give Enchanted Sword (NBT)', '/give @p diamond_sword{Enchantments:[{id:sharpness,lvl:5},{id:unbreaking,lvl:3},{id:fire_aspect,lvl:2}]} 1', 'Java', 'weapons', 'Give yourself a fully enchanted diamond sword with Sharpness V, Unbreaking III, and Fire Aspect II'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Clear All Effects', '/effect clear @p', 'All', 'stats', 'Remove all active status effects from yourself instantly'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Summon Any Entity', '/summon minecraft:ender_dragon', 'All', 'spawn', 'Summon any entity at your location – replace ender_dragon with any mob name'
FROM games g WHERE g.slug = 'minecraft';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Difficulty Hard', '/difficulty hard', 'All', 'world', 'Change difficulty to hard – mobs deal more damage and zombies can break doors'
FROM games g WHERE g.slug = 'minecraft';

-- =============================================
-- Additional Elden Ring cheats (exploits & hidden mechanics)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Sleeping Dragon Rune Farm', 'Travel to Fort Faroth in Caelid > find the giant sleeping dragon behind the fort > attack with a bleed weapon', 'All', 'money', 'Kill the sleeping Elder Dragon for ~75,000 runes in the first hour of the game using any bleed weapon'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Sacred Relic Sword Endgame Farm', 'Equip Sacred Relic Sword at Palace Approach > use Wave of Gold weapon art on the Albinauric crowd', 'All', 'money', 'Endgame rune farm yielding ~810,000 runes per minute by wiping the crowd with one skill use'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Gold Scarab + Fowl Foot Boost', 'Equip Gold Scarab talisman + use Gold-Pickled Fowl Foot consumable', 'All', 'stats', 'Stack both rune-boosting effects for roughly 50% more runes from every kill'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Illusory Wall Detection', 'Hit or roll into suspicious walls – many dungeons have hidden passages', 'All', 'other', 'Dozens of illusory walls hide secret areas, items, and shortcuts throughout the Lands Between'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Stonesword Key Imp Statues', 'Use Stonesword Keys on fog-sealed Imp Statues to unlock hidden areas', 'All', 'other', 'Many of the game''s best talismans and weapons are locked behind Imp Statue fog gates'
FROM games g WHERE g.slug = 'elden-ring';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Respec with Larval Tears', 'Defeat Rennala > select Rebirth > spend one Larval Tear to reallocate all stats', 'All', 'stats', 'Respec your character at Rennala in Raya Lucaria – there are 18 Larval Tears in a single playthrough'
FROM games g WHERE g.slug = 'elden-ring';

-- =============================================
-- Zelda: Tears of the Kingdom cheats (glitches & tricks)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Item Duplication (SID Method)', 'Have 3+ of target item > equip bow > sort consumable left of target > quick-menu swap', 'Switch', 'money', 'Split Item Duplication – duplicate any material for infinite rupees or upgrades (works on v1.4.2)'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Fuse Entanglement Glitch', 'Interrupt the fuse process mid-animation to keep both the fused copy and original item', 'Switch', 'other', 'Exploit that lets you keep equipment while also having a fused version – effectively doubles gear'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Diamond Duplication for Rupees', 'Duplicate diamonds using SID method > sell to any merchant for 500 rupees each', 'Switch', 'money', 'Fastest way to earn unlimited rupees – duplicate stacks of diamonds and sell them'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Zonaite Duplication', 'Duplicate Zonaite using any dupe method > spend at Crystal Refineries for Energy Cells', 'Switch', 'other', 'Max out your Energy Cell battery without grinding by duplicating Zonaite'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Infinite Arrows (Fuse Trick)', 'Fuse valuable materials to arrows > pick up missed arrows to recover both arrow and material', 'Switch', 'weapons', 'Missed fused arrows can be picked up, giving back both the arrow and the fuse material'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Recall on Thrown Objects', 'Use Recall on boulders, rocks, or objects enemies throw at you to send them flying back', 'Switch', 'fun', 'Use Recall on Talus rocks, thrown objects, or even Stone Talus boulders for massive damage'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Shield Surf Speed Boost', 'Fuse a Minecart or Zonai Sled to your shield > shield surf for massive speed', 'Switch', 'fun', 'Fusing certain objects to shields creates extremely fast traversal across Hyrule'
FROM games g WHERE g.slug = 'zelda';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Blood Moon Farming', 'Wait for or trigger a Blood Moon > all overworld enemies respawn with their drops', 'Switch', 'other', 'Blood Moons reset all enemies – farm valuable monster parts by revisiting camps after each moon'
FROM games g WHERE g.slug = 'zelda';

-- =============================================
-- Additional Elder Scrolls (Skyrim) cheats
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set Player Speed', 'player.setav speedmult 200', 'PC', 'stats', 'Double your movement speed – change 200 to any percentage (100 is default)'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Remove Bounty', 'player.paycrimegold 0 0 <factionID>', 'PC', 'money', 'Clear your bounty in any hold without paying gold or going to jail'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Change Weather', 'sw <weatherID>', 'PC', 'world', 'Force a specific weather type – e.g., sw 10e1f2 for clear skies, sw 10a235 for heavy rain'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Set NPC as Essential', 'setessential <baseID> 1', 'PC', 'other', 'Click on NPC and make them unkillable – useful for protecting important quest givers'
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Spawn Arrows', 'player.additem 000139C0 500', 'PC', 'weapons', 'Adds 500 Daedric Arrows. Also: 000139BE (Ebony), 00034182 (Dwarven), 000139BF (Glass)'
FROM games g WHERE g.slug = 'elder-scrolls';

-- =============================================
-- Apex Legends cheats (Easter eggs & tips)
-- =============================================
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Nessie Easter Eggs', 'Search every map for hidden Nessie plush toys in corners, under desks, and inside buildings', 'All', 'other', 'Respawn hides dozens of Nessie plush toys across every map – a tradition carried over from Titanfall'
FROM games g WHERE g.slug = 'apex';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Firing Range 3rd Person Mode', 'In Firing Range > go to the far-left cave > face the wall > look down > crouch > switch Legend', 'All', 'fun', 'Hidden Easter egg that toggles third-person camera in the Firing Range'
FROM games g WHERE g.slug = 'apex';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Firing Range Dummy AI', 'In Firing Range > far-right platform > look up at ceiling > switch Legend > Dummies come alive', 'All', 'fun', 'Hidden Easter egg that makes the training dummies fight back – great for warm-up practice'
FROM games g WHERE g.slug = 'apex';
INSERT INTO cheat_codes (game_id, title, code, platform, category, description)
SELECT g.id, 'Win Streak Nessie Growth', 'Win consecutive matches to see increasingly large Nessie statues on the Champion screen', 'All', 'other', 'After each consecutive win, an increasingly large Nessie appears in front of your Legend'
FROM games g WHERE g.slug = 'apex';

-- =============================================
-- Additional Zelda: TotK quests (side adventures)
-- =============================================
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Potential Princess Sightings', 'Investigate rumors of Princess Zelda across Hyrule – complete all leads to earn the full Froggy Armor set', 'npc_encounter', 'Various', 'medium', false, 13
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Hunt for Bubbul Gems', 'Collect Bubbul Gems from cave Bubbulfrogs and trade them to Koltin for monster-themed armor and the Mystic set', 'npc_encounter', 'Various', 'medium', false, 14
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Hateno Village Election', 'Help resolve the mayoral election between incumbent Reede and fashion designer Cece in Hateno Village', 'npc_encounter', 'Hateno Village', 'easy', false, 15
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Zelda''s Golden Horse', 'Track down Zelda''s missing golden horse near Snowfield Stable in the Tabantha region', 'npc_encounter', 'Tabantha', 'medium', false, 16
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Swordsman in the Sand', 'Follow the pointing statues through the Gerudo Desert to uncover secret underground ruins and treasure', 'secret', 'Gerudo Desert', 'hard', false, 17
FROM games g WHERE g.slug = 'zelda';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Uma''s Garden', 'Unlock gardening in Hateno Village – tell Uma what to grow and return later to harvest crops', 'npc_encounter', 'Hateno Village', 'easy', false, 18
FROM games g WHERE g.slug = 'zelda';

-- =============================================
-- Additional Elder Scrolls (Skyrim) quests (Daedric & hidden)
-- =============================================
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Boethiah''s Calling', 'Reach level 30, find Boethiah''s shrine east of Windhelm, and sacrifice a follower to earn the Ebony Mail armor', 'npc_encounter', 'Eastmarch', 'hard', false, 16
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Whispering Door', 'Hear rumors about the Jarl''s son in Whiterun to start Mephala''s quest for the Ebony Blade', 'secret', 'Whiterun', 'medium', false, 17
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Ill Met by Moonlight', 'Meet Sinding in Falkreath Jail and hunt him in Bloated Man''s Grotto – choose Hircine''s Ring or Savior''s Hide (or both)', 'npc_encounter', 'Falkreath', 'medium', true, 18
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Pieces of the Past', 'Visit Silus Vesuius'' museum in Dawnstar at level 20+ to reassemble Mehrunes'' Razor – a dagger with a 3% instant-kill chance', 'npc_encounter', 'Dawnstar', 'medium', false, 19
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The House of Horrors', 'Enter the abandoned house in Markarth and encounter Molag Bal to earn his Mace – one of the strongest weapons in the game', 'easter_egg', 'Markarth', 'medium', false, 20
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Waking Nightmare', 'Help the priest in Dawnstar end the town''s nightmares – choose to betray him for Vaermina''s Skull of Corruption', 'npc_encounter', 'Dawnstar', 'medium', true, 21
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Cursed Tribe', 'Help the Orc chief at Largashbur appease Malacath and earn the Volendrung warhammer', 'npc_encounter', 'The Rift', 'medium', false, 22
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Discerning the Transmundane', 'Help Septimus Signus open a Dwemer lockbox for Hermaeus Mora – collect blood from every elf race to earn the Oghma Infinium', 'secret', 'Winterhold', 'hard', false, 23
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'The Break of Dawn', 'Find Meridia''s Beacon (random loot at level 12+) and clear her temple of undead for the Dawnbreaker sword', 'npc_encounter', 'Haafingar', 'medium', false, 24
FROM games g WHERE g.slug = 'elder-scrolls';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'A Daedra''s Best Friend', 'Follow Barbas the talking dog to Clavicus Vile''s shrine – choose the Masque (not the Rueful Axe) for Oblivion Walker', 'npc_encounter', 'Falkreath', 'easy', false, 25
FROM games g WHERE g.slug = 'elder-scrolls';

-- =============================================
-- Call of Duty quests (Warzone Easter egg hunts)
-- =============================================
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Verdansk Bunker 11 Hunt', 'Decode Russian phone numbers across Verdansk to unlock the legendary Bunker 11 and its secret MP7 blueprint', 'easter_egg', 'Verdansk', 'hard', false, 1
FROM games g WHERE g.slug = 'cod';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Haven''s Hollow Super Easter Egg', 'Complete all 6 hidden Easter eggs on Haven''s Hollow including the Blood Moon Ritual to unlock the Now You See Me camo', 'easter_egg', 'Haven''s Hollow', 'hard', false, 2
FROM games g WHERE g.slug = 'cod';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Overlook Safe Room Puzzle', 'Find 3 pool balls in the Overlook building, place them on the pool table, and decode the numbers to open the hidden safe room', 'secret', 'Verdansk', 'medium', false, 3
FROM games g WHERE g.slug = 'cod';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Winter Rebirth Gulag Opening', 'Use Thermite to melt frozen bunker doors, recover an SSD, decode binary, and open the old Gulag beneath Prison for epic loot', 'easter_egg', 'Rebirth Island', 'hard', false, 4
FROM games g WHERE g.slug = 'cod';

-- =============================================
-- Apex Legends quests (Easter eggs & lore discoveries)
-- =============================================
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Nessie Plush Collection', 'Find all hidden Nessie plush toys scattered across every map – a tradition from Titanfall that ties into Wattson''s lore', 'easter_egg', 'All Maps', 'easy', false, 1
FROM games g WHERE g.slug = 'apex';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Firing Range Secrets', 'Discover hidden Easter eggs in the Firing Range including third-person mode and the living dummy fight', 'secret', 'Firing Range', 'medium', false, 2
FROM games g WHERE g.slug = 'apex';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Olympus Titanfall References', 'Find the hidden Titanfall photo frame in the Gardens on Olympus featuring Macallan, Barker, and Graves', 'easter_egg', 'Olympus', 'easy', false, 3
FROM games g WHERE g.slug = 'apex';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Wattson''s Pylon Lore Room', 'Explore Wattson''s office inside the Pylon POI on Storm Point for Easter eggs about her relationships with other Legends', 'easter_egg', 'Storm Point', 'easy', false, 4
FROM games g WHERE g.slug = 'apex';
INSERT INTO quests (game_id, name, description, category, region, difficulty, is_missable, sort_order)
SELECT g.id, 'Loba and Revenant''s Restaurant', 'Land at the Bonsai Tower restaurant on Olympus with Loba and Revenant on the same squad for unique dialogue about her parents', 'easter_egg', 'Olympus', 'easy', false, 5
FROM games g WHERE g.slug = 'apex';
