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
