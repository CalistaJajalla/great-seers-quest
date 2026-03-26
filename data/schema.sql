-- SQL Fantasy Quest Database Schema
-- The Great Seer's Quest

-- =====================================================
-- DIMENSION TABLES
-- =====================================================

-- Location dimension
CREATE TABLE location (
    location_id INTEGER PRIMARY KEY,
    location_name TEXT NOT NULL,
    location_type TEXT CHECK(location_type IN ('City', 'Village', 'Forest', 'Mountain', 'Dungeon', 'Temple', 'Cave', 'Ruins', 'Swamp', 'Desert')),
    region TEXT,
    terrain TEXT,
    climate TEXT,
    population INTEGER,
    danger_level INTEGER CHECK(danger_level BETWEEN 1 AND 10),
    magical_affinity TEXT CHECK(magical_affinity IN ('Fire', 'Water', 'Earth', 'Air', 'Light', 'Dark', 'Neutral', 'Shadow', 'Arcane', 'Necrotic')),
    ruled_by TEXT,
    accessibility TEXT CHECK(accessibility IN ('Easy', 'Moderate', 'Difficult', 'Nearly Impossible'))
);

-- =====================================================
-- FACT TABLE - PERSON (EASY LEVEL)
-- =====================================================

CREATE TABLE person (
    person_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Non-binary')),
    race TEXT CHECK(race IN ('Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc')),
    hair_color TEXT,
    skin_tone TEXT,
    eye_color TEXT,
    height INTEGER CHECK(height BETWEEN 100 AND 250), -- in cm
    body_type TEXT CHECK(body_type IN ('Slender', 'Athletic', 'Muscular', 'Stocky', 'Heavyset', 'Lean', 'Petite')),
    job TEXT CHECK(job IN ('Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Bard', 'Monk', 'Druid', 'Warlock', 'Sorcerer', 'Barbarian')),
    background TEXT CHECK(background IN ('Noble', 'Commoner', 'Sage', 'Criminal', 'Soldier', 'Acolyte', 'Outlander', 'Folk Hero', 'Merchant', 'Artisan')),
    alignment TEXT CHECK(alignment IN ('Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil')),
    birthplace_id INTEGER,
    current_location_id INTEGER,
    armor_id INTEGER,
    weapon_id INTEGER,
    destiny_score INTEGER CHECK(destiny_score BETWEEN 1 AND 100), -- Hidden attribute, hero has 100
    FOREIGN KEY (birthplace_id) REFERENCES location(location_id),
    FOREIGN KEY (current_location_id) REFERENCES location(location_id),
    FOREIGN KEY (armor_id) REFERENCES armor(armor_id),
    FOREIGN KEY (weapon_id) REFERENCES weapon(weapon_id)
);

-- =====================================================
-- ARMOR TABLE (MEDIUM LEVEL)
-- =====================================================

CREATE TABLE armor (
    armor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    armor_name TEXT NOT NULL,
    armor_type TEXT CHECK(armor_type IN ('Plate', 'Chain', 'Scale', 'Leather', 'Studded Leather', 'Cloth', 'Mage Robes', 'Hide')),
    material TEXT,
    primary_enchantment TEXT,
    secondary_enchantment TEXT,
    blessing TEXT,
    defense_rating INTEGER CHECK(defense_rating BETWEEN 1 AND 100),
    magic_resistance INTEGER CHECK(magic_resistance BETWEEN 0 AND 100),
    weight_class TEXT CHECK(weight_class IN ('Light', 'Medium', 'Heavy')),
    artifact_level TEXT CHECK(artifact_level IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic')),
    found_location_id INTEGER,
    required_strength INTEGER,
    special_property TEXT,
    crafted_by TEXT,
    FOREIGN KEY (found_location_id) REFERENCES location(location_id)
);

-- =====================================================
-- WEAPON TABLE (HARD LEVEL)
-- =====================================================

CREATE TABLE weapon (
    weapon_id INTEGER PRIMARY KEY AUTOINCREMENT,
    weapon_name TEXT NOT NULL,
    weapon_type TEXT CHECK(weapon_type IN ('Sword', 'Axe', 'Mace', 'Spear', 'Bow', 'Crossbow', 'Dagger', 'Staff', 'Warhammer', 'Greatsword', 'Rapier', 'Scimitar', 'Wand')),
    material TEXT,
    primary_enchantment TEXT,
    secondary_enchantment TEXT,
    tertiary_enchantment TEXT,
    blessing TEXT,
    elemental_property TEXT CHECK(elemental_property IN ('Fire', 'Ice', 'Lightning', 'Holy', 'Shadow', 'Poison', 'Radiant', 'Necrotic', 'Force', 'Psychic')),
    damage_type TEXT CHECK(damage_type IN ('Slashing', 'Piercing', 'Bludgeoning', 'Magic')),
    range_type TEXT CHECK(range_type IN ('Melee', 'Ranged (Close)', 'Ranged (Medium)', 'Ranged (Long)')),
    handedness TEXT CHECK(handedness IN ('One-handed', 'Two-handed', 'Versatile')),
    attack_rating INTEGER CHECK(attack_rating BETWEEN 1 AND 100),
    critical_modifier REAL,
    legendary_property TEXT,
    bound_to_bloodline TEXT,
    crafted_by TEXT,
    forged_location_id INTEGER,
    stored_location_id INTEGER,
    calamity_weakness_match INTEGER CHECK(calamity_weakness_match IN (0, 1)), -- Boolean
    required_level INTEGER,
    FOREIGN KEY (forged_location_id) REFERENCES location(location_id),
    FOREIGN KEY (stored_location_id) REFERENCES location(location_id)
);

-- =====================================================
-- CALAMITY TABLE (IMPOSSIBLE LEVEL)
-- =====================================================

CREATE TABLE calamity (
    calamity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_name TEXT NOT NULL,
    calamity_type TEXT CHECK(calamity_type IN ('Dragon', 'Demon Lord', 'Ancient Evil', 'Corrupted God', 'Lich King', 'Undead Horde', 'Void Entity', 'Elemental Titan', 'Fallen Angel', 'Chaos Beast', 'Shadow Wraith')),
    true_form TEXT,
    current_form TEXT,
    origin_realm TEXT,
    primary_power TEXT,
    secondary_power TEXT,
    tertiary_power TEXT,
    environmental_effect TEXT,
    psychological_effect TEXT,
    corruption_radius INTEGER, -- in miles
    primary_weakness TEXT,
    secondary_weakness TEXT,
    weak_body_part TEXT,
    vulnerable_time TEXT,
    vulnerable_element TEXT CHECK(vulnerable_element IN ('Fire', 'Ice', 'Lightning', 'Holy', 'Shadow', 'Poison', 'Radiant', 'Necrotic', 'Force', 'Psychic')),
    minion_types TEXT,
    stronghold_location_id INTEGER,
    awakening_date TEXT,
    prophecy_identifier TEXT,
    defeat_condition TEXT,
    threat_level INTEGER CHECK(threat_level BETWEEN 1 AND 10),
    FOREIGN KEY (stronghold_location_id) REFERENCES location(location_id)
);

-- =====================================================
-- PROPHECY CLUES TABLE (GAME MECHANICS)
-- =====================================================

CREATE TABLE prophecy_clues (
    clue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage TEXT CHECK(stage IN ('hero', 'armor', 'weapon', 'calamity')),
    clue_text TEXT NOT NULL,
    clue_difficulty TEXT CHECK(clue_difficulty IN ('obvious', 'moderate', 'cryptic')),
    sql_hint TEXT,
    related_entity_id INTEGER
);

-- =====================================================
-- GAME STATE TABLE (OPTIONAL - FOR SAVE SYSTEM)
-- =====================================================

CREATE TABLE game_state (
    save_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT,
    current_stage TEXT,
    hero_id INTEGER,
    armor_id INTEGER,
    weapon_id INTEGER,
    calamity_id INTEGER,
    hints_used INTEGER,
    queries_executed INTEGER,
    start_time DATETIME,
    last_played DATETIME,
    FOREIGN KEY (hero_id) REFERENCES person(person_id),
    FOREIGN KEY (armor_id) REFERENCES armor(armor_id),
    FOREIGN KEY (weapon_id) REFERENCES weapon(weapon_id),
    FOREIGN KEY (calamity_id) REFERENCES calamity(calamity_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_person_job ON person(job);
CREATE INDEX idx_person_race ON person(race);
CREATE INDEX idx_person_location ON person(current_location_id);
CREATE INDEX idx_armor_type ON armor(armor_type);
CREATE INDEX idx_armor_location ON armor(found_location_id);
CREATE INDEX idx_weapon_type ON weapon(weapon_type);
CREATE INDEX idx_weapon_element ON weapon(elemental_property);
CREATE INDEX idx_calamity_weakness ON calamity(vulnerable_element);

-- =====================================================
-- INITIAL VIEWS (OPTIONAL HELPERS)
-- =====================================================

-- View to see complete person info with locations
CREATE VIEW person_complete AS
SELECT 
    p.*,
    bl.location_name as birthplace,
    cl.location_name as current_location,
    a.armor_name,
    w.weapon_name
FROM person p
LEFT JOIN location bl ON p.birthplace_id = bl.location_id
LEFT JOIN location cl ON p.current_location_id = cl.location_id
LEFT JOIN armor a ON p.armor_id = a.armor_id
LEFT JOIN weapon w ON p.weapon_id = w.weapon_id;

-- View for hero candidate screening (Easy Mode Helper)
CREATE VIEW hero_candidates AS
SELECT 
    person_id,
    name,
    job,
    race,
    hair_color,
    eye_color,
    height,
    body_type,
    alignment
FROM person
WHERE destiny_score >= 50;