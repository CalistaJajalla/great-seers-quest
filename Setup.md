# Setup Guide -- The Great Seer's Quest

This game runs entirely in the browser with no server-side dependencies. Setup is minimal.

---

## Project Structure

```
seer_sql/
├── index.html                   # Game entry point
├── schema_diagram.png           # Schema reference image
├── README.md
├── SETUP.md
├── js/
│   ├── app.js                   # Core game logic
│   ├── client_side_generator.js # Procedural world generator
│   └── database.js              # DB utility (reserved)
└── data/
    ├── schema.sql               # Table definitions
    └── locations.sql            # Seed location data
```

---


## Schema Reference

The game uses five tables. These are defined in `data/schema.sql` and seeded with location data from `data/locations.sql`. The quest data (heroes, armors, weapons, calamities, and 100+ decoys) is generated fresh in the browser each run by `js/client_side_generator.js`.

```sql
-- Core tables (simplified)

CREATE TABLE location (
    location_id        INTEGER PRIMARY KEY,
    location_name      TEXT NOT NULL,
    region             TEXT,
    danger_level       INTEGER
);

CREATE TABLE person (
    person_id          INTEGER PRIMARY KEY,
    name               TEXT NOT NULL,
    gender             TEXT,
    race               TEXT,
    hair_color         TEXT,
    skin_tone          TEXT,
    eye_color          TEXT,
    height             INTEGER,
    body_type          TEXT,
    job                TEXT,
    background         TEXT,
    alignment          TEXT,
    birthplace_id      INTEGER REFERENCES location(location_id),
    current_location_id INTEGER REFERENCES location(location_id),
    armor_id           INTEGER,
    weapon_id          INTEGER,
    destiny_score      INTEGER
);

CREATE TABLE armor (
    armor_id           INTEGER PRIMARY KEY,
    armor_name         TEXT NOT NULL,
    armor_type         TEXT,
    material           TEXT,
    primary_enchantment TEXT,
    secondary_enchantment TEXT,
    blessing           TEXT,
    defense_rating     INTEGER,
    magic_resistance   INTEGER,
    weight_class       TEXT,
    artifact_level     TEXT,
    found_location_id  INTEGER REFERENCES location(location_id),
    required_strength  INTEGER,
    special_property   TEXT,
    crafted_by         TEXT
);

CREATE TABLE weapon (
    weapon_id          INTEGER PRIMARY KEY,
    weapon_name        TEXT NOT NULL,
    weapon_type        TEXT,
    material           TEXT,
    primary_enchantment TEXT,
    secondary_enchantment TEXT,
    tertiary_enchantment TEXT,
    blessing           TEXT,
    elemental_property TEXT,
    damage_type        TEXT,
    range_type         TEXT,
    handedness         TEXT,
    attack_rating      INTEGER,
    critical_modifier  REAL,
    legendary_property TEXT,
    bound_to_bloodline TEXT,
    crafted_by         TEXT,
    forged_location_id INTEGER REFERENCES location(location_id),
    stored_location_id INTEGER REFERENCES location(location_id),
    calamity_weakness_match INTEGER DEFAULT 0,
    required_level     INTEGER
);

CREATE TABLE calamity (
    calamity_id        INTEGER PRIMARY KEY,
    entity_name        TEXT NOT NULL,
    calamity_type      TEXT,
    true_form          TEXT,
    current_form       TEXT,
    origin_realm       TEXT,
    primary_power      TEXT,
    secondary_power    TEXT,
    tertiary_power     TEXT,
    environmental_effect TEXT,
    psychological_effect TEXT,
    corruption_radius  INTEGER,
    primary_weakness   TEXT,
    secondary_weakness TEXT,
    weak_body_part     TEXT,
    vulnerable_time    TEXT,
    vulnerable_element TEXT,
    minion_types       TEXT,
    stronghold_location_id INTEGER REFERENCES location(location_id),
    awakening_date     TEXT,
    prophecy_identifier TEXT,
    defeat_condition   TEXT,
    threat_level       INTEGER
);
```

---

## Query Tips

### String comparisons are case-insensitive automatically

You do not need to write `LOWER()`. The engine normalises your query before execution.

```sql
-- Both of these work the same:
SELECT * FROM person WHERE race = 'elf' AND job = 'ranger';
SELECT * FROM person WHERE race = 'Elf' AND job = 'Ranger';
```

### You don't need SELECT *

As long as your query returns exactly one row and includes either the ID column or the name column of the target entity, the answer is accepted.

```sql
-- This is valid for the armor chapter:
SELECT a.armor_name, l.location_name
FROM armor a
JOIN location l ON a.found_location_id = l.location_id
WHERE a.material = 'Mithril' AND a.armor_type = 'Plate';
```

### Autocomplete

In the query editor, start typing any column name or keyword and press **Tab** to autocomplete. Arrow keys navigate the dropdown.

### Keyboard shortcut

**Ctrl + Enter** (or Cmd + Enter on Mac) runs the current query.

---

## Debug Mode (For testers!!!)

For testing, type the following into the query box and press Run:

```
veilsight_master_override
```

This skips the **current stage only** and advances to the next chapter's transition screen. No rating penalty is applied. Run it again on the next stage to skip that one too.

---

## Modifying the Game

### Adding new clue difficulty tiers

Edit `generateHeroClue`, `generateArmorClue`, `generateWeaponClue`, or `generateCalamityClue` in `js/client_side_generator.js`. Each function receives a `diff` parameter (1-4) and returns `{ text, hint1, solution }`.

### Changing the passcode

Edit this line in `js/app.js`:

```js
const DEBUG_PASSCODE = 'veilsight_master_override';
```

### Changing Seer Rating thresholds

Edit `getSeerTier()` in `js/app.js`:

```js
function getSeerTier() {
    if (revealCount > 0)   return 1; // Blinded
    if (hintsUsed === 0)   return 5; // All-Seeing
    if (hintsUsed === 1)   return 4; // Master
    if (hintsUsed === 2)   return 3; // Seer
    return 2;                        // Apprentice (3-4 hints)
}
```

### Adding new ending stories

Edit the `ENDING_DATA` object in `js/app.js`. Each tier has `rating`, `color`, `badge`, `desc`, and a `story(hero, calamity)` function that returns an HTML string.