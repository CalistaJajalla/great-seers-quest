// =====================================================
// SEER SQL GAME - App Logic
// =====================================================

window.db = null;
let currentStage    = 'hero';
let currentQuest    = null;
let hintLevel       = 0;
let hintsUsed       = 0;     // total hints clicked across all stages
let hintsByStage    = {};    // { hero: N, armor: N, weapon: N, calamity: N }
let revealCount     = 0;
const MAX_REVEALS   = 1;
const correctAnswers = { hero_id: null, hero_name: null, armor_id: null, weapon_id: null, calamity_id: null, calamity_name: null };
const previousAnswers = [];
let selectedDifficulty = 2; // default: Apprentice

// Debug passcode: type into query box to skip the current stage only
const DEBUG_PASSCODE = 'veilsight_master_override';

// Dataset browser state
let datasetTable   = 'person'; // which table is active in the bottom browser
let datasetCache   = {};       // { tableName: { columns, rows } }
const BROWSE_TABLES = ['person', 'armor', 'weapon', 'calamity', 'location'];

// ===== DATABASE =====
async function initDatabase(schemaSQL, locationsSQL) {
    const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` });
    window.db = new SQL.Database();
    window.db.run(schemaSQL);
    window.db.run(locationsSQL);
    return window.db;
}
function executeQueryRaw(sql) {
    if (!window.db) throw new Error('Database not initialized');
    return window.db.exec(sql);
}

// Auto case-insensitive
function normaliseQueryCasing(sql) {
    return sql.replace(
        /([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*(=|!=|<>)\s*'([^']*)'/g,
        (match, col, op, val, offset, str) => {
            const before = str.slice(0, offset);
            if (/LOWER\s*\(\s*$/.test(before)) return match;
            return `LOWER(${col}) ${op} LOWER('${val}')`;
        }
    );
}

// ===== SCREENS =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); el.classList.add('fade-in'); setTimeout(() => el.classList.remove('fade-in'), 600); }
}

// ===== BACKSTORY =====
function showBackstory() {
    showScreen('backstory-screen');
    document.getElementById('story-text').innerHTML = `
        <div style="max-width:750px; margin:0 auto; text-align:center;">
            <h2 style="color:#d4af37; font-size:2.3em; margin-bottom:28px; text-shadow:2px 2px 8px rgba(0,0,0,0.8);">The Great Seer's Quest</h2>
            <div style="background:rgba(212,175,55,0.10); border:2px solid #d4af37; border-radius:12px; padding:32px; text-align:left;">
                <p style="font-size:1.1em; line-height:1.9; margin-bottom:16px;">A hundred years have passed since the Crimson Convergence... that terrible night when three blood moons aligned and something ancient stirred awake in the depths of the world. No one speaks its name aloud. They only call it the Calamity.</p>
                <p style="font-size:1.1em; line-height:1.9; margin-bottom:16px;">You are the last of the Great Seers. Your gift is rare and painful... you can reach into the threads of fate and pull truths from the dark. Your power has a name in the old tongue: <strong style="color:#d4af37;">Veilsight</strong>.</p>
                <p style="font-size:1.1em; line-height:1.9; margin-bottom:16px;">Last night a vision came. A hero walks among the living, marked by destiny. Around them: armor that can withstand the Calamity's power, a weapon that can wound it, and the creature itself lurking in the dark.</p>
                <p style="font-size:1.1em; line-height:1.9; color:#ff9999;">But visions are riddles, not maps. Use your Veilsight to find each piece before the darkness grows.</p>
                <p style="font-size:0.88em; color:#666; margin-top:18px; font-style:italic;">Note: the clarity of your sight matters. Leaning too heavily on hints or revealed answers may cloud the final outcome.</p>
            </div>
            <div style="margin-top:28px; display:flex; flex-direction:column; gap:12px; align-items:center;">
                <button onclick="showTutorial()" style="padding:17px 48px; font-size:18px; background:linear-gradient(135deg,#d4af37 0%,#b8860b 100%); color:#1e1e2e; border:none; border-radius:12px; cursor:pointer; font-weight:bold; width:310px; font-family:Georgia,serif;">Learn the Veilsight</button>
                <button onclick="showDifficultySelect()" style="padding:13px 38px; font-size:17px; background:transparent; color:#87ceeb; border:2px solid #87ceeb; border-radius:10px; cursor:pointer; font-weight:bold; width:310px;">Begin Quest</button>
                <p style="color:#666; font-size:0.85em;">(First time? Try the tutorial)</p>
            </div>
        </div>`;
}

function showDifficultySelect() { showScreen('difficulty-screen'); }

// ===== TUTORIAL =====
function showTutorial() {
    showScreen('tutorial-screen');
    document.getElementById('tutorial-content').innerHTML = `
        <div style="max-width:700px; margin:0 auto;">
            <h3 style="color:#d4af37; font-size:1.8em; margin-bottom:20px; text-align:center;">Using the Veilsight</h3>
            <p style="line-height:1.8; margin-bottom:16px;">Your magic works through SQL... the Structured Query Language. Speak precisely to reveal what you seek.</p>
            <div style="background:rgba(135,206,235,0.08); border:1px solid #87ceeb; border-radius:8px; padding:18px; margin:18px 0;">
                <h4 style="color:#87ceeb; margin-bottom:10px;">Tables of the Realm:</h4>
                <ul style="line-height:2.2; padding-left:18px; color:#ddd; font-size:0.95em;">
                    <li><strong>person</strong> : person_id, name, race, job, alignment, hair_color, skin_tone, eye_color, height, body_type, background, gender, current_location_id...</li>
                    <li><strong>armor</strong> : armor_id, armor_name, armor_type, material, blessing, weight_class, defense_rating, magic_resistance, artifact_level, primary_enchantment, crafted_by, found_location_id...</li>
                    <li><strong>weapon</strong> : weapon_id, weapon_name, weapon_type, material, elemental_property, handedness, damage_type, attack_rating, artifact_level, blessing, calamity_weakness_match, stored_location_id...</li>
                    <li><strong>calamity</strong> : calamity_id, entity_name, calamity_type, true_form, vulnerable_element, weak_body_part, primary_power, origin_realm, environmental_effect, psychological_effect, defeat_condition...</li>
                    <li><strong>location</strong> : location_id, location_name, region, danger_level...</li>
                </ul>
                <button onclick="window.open('schema_diagram.png','_blank')" style="margin-top:10px; padding:9px 20px; background:rgba(212,175,55,0.2); border:1px solid #d4af37; color:#d4af37; border-radius:6px; cursor:pointer; font-family:Georgia,serif;">View Schema Diagram</button>
            </div>
            <div style="background:rgba(212,175,55,0.08); border:1px solid #d4af37; border-radius:8px; padding:18px; margin:18px 0;">
                <h4 style="color:#d4af37; margin-bottom:10px;">Example Vision:</h4>
                <code style="display:block; background:rgba(0,0,0,0.3); padding:12px; border-radius:6px; color:#90ee90; font-size:0.95em; line-height:1.6;">SELECT * FROM person<br>WHERE race = 'Elf'<br>AND job = 'Ranger';</code>
                <p style="margin-top:10px; color:#ccc; font-size:0.9em;">Must return <strong>exactly 1 row</strong>. Comparisons are <strong>case-insensitive</strong> automatically. You may select specific columns instead of * as long as the row uniquely identifies the target.</p>
            </div>
            <div style="background:rgba(255,99,99,0.06); border:1px solid #ff6363; border-radius:8px; padding:16px; margin:18px 0;">
                <h4 style="color:#ff9999; margin-bottom:8px;">Difficulty per chapter:</h4>
                <ul style="line-height:2.1; padding-left:18px; color:#ccc; font-size:0.95em;">
                    <li><strong style="color:#90ee90;">I : The Hero</strong> ... WHERE filters on the person table</li>
                    <li><strong style="color:#ffd700;">II : The Armor</strong> ... JOIN armor with location</li>
                    <li><strong style="color:#ff8c00;">III : The Weapon</strong> ... Multiple JOINs and properties</li>
                    <li><strong style="color:#ff4444;">IV : The Calamity</strong> ... Multi-table, find weakness</li>
                </ul>
            </div>
            <div style="background:rgba(255,215,0,0.05); border:1px solid #555; border-radius:8px; padding:14px; margin:18px 0;">
                <p style="color:#888; font-size:0.88em; margin:0;"><strong style="color:#d4af37;">Seer Rating:</strong> Your final rating depends on how many hints you used and whether you revealed answers. The fewer you needed, the stronger your sight. The ending story changes with your score.</p>
            </div>
            <div style="text-align:center; margin-top:26px;">
                <button onclick="showDifficultySelect()" style="padding:17px 48px; font-size:18px; background:linear-gradient(135deg,#d4af37 0%,#b8860b 100%); color:#1e1e2e; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-family:Georgia,serif;">Begin Quest</button>
            </div>
        </div>`;
}

// ===== QUEST START =====
async function startQuest() {
    showScreen('loading-screen');
    document.getElementById('loading-message').textContent = 'The Veilsight awakens...';
    try {
        const [sr, lr] = await Promise.all([fetch('data/schema.sql'), fetch('data/locations.sql')]);
        if (!sr.ok) throw new Error(`data/schema.sql not found (${sr.status})`);
        if (!lr.ok) throw new Error(`data/locations.sql not found (${lr.status})`);
        const schemaSQL    = await sr.text();
        const locationsSQL = await lr.text();
        document.getElementById('loading-message').textContent = 'Weaving the threads of fate...';
        await initDatabase(schemaSQL, locationsSQL);
        document.getElementById('loading-message').textContent = 'Populating the realm...';
        await populateWorld();
        document.getElementById('loading-message').textContent = 'Vision ready.';
        setTimeout(() => {
            currentStage = 'hero';
            hintLevel    = 0;
            hintsUsed    = 0;
            hintsByStage = { hero: 0, armor: 0, weapon: 0, calamity: 0 };
            revealCount  = 0;
            datasetCache = {};
            initDatasetBrowser();
            showStage('hero');
        }, 800);
    } catch (err) {
        showScreen('error-screen');
        document.getElementById('error-detail').textContent = err.message;
        console.error('Quest generation failed:', err);
    }
}

// ===== POPULATE WORLD =====
async function populateWorld() {
    const generator = new QuestGenerator();
    const locRows   = executeQueryRaw('SELECT location_id, location_name, region, danger_level FROM location;');
    const locations = locRows[0]
        ? locRows[0].values.map(r => ({ location_id: r[0], location_name: r[1], region: r[2], danger_level: r[3] }))
        : [{ location_id: 1, location_name: 'Silverhelm', region: 'Northern Reaches', danger_level: 3 }];

    const quest  = generator.generateFullQuest(locations, selectedDifficulty);
    currentQuest = quest;

    const run = sql => { try { window.db.run(sql); } catch(e) { console.warn('Insert error:', e.message, '\n', sql.substring(0,120)); } };

    run(generator.insertPersonSQL(quest.hero));
    for (const p of generator.generateDecoyPersons(100, quest.hero.person_id, quest.hero.job, locations)) run(generator.insertPersonSQL(p));
    run(generator.insertArmorSQL(quest.armor));
    for (const a of generator.generateDecoyArmors(50, quest.armor.armor_id, locations)) run(generator.insertArmorSQL(a));
    run(generator.insertWeaponSQL(quest.weapon));
    for (const w of generator.generateDecoyWeapons(50, quest.weapon.weapon_id, quest.hero.job, locations)) run(generator.insertWeaponSQL(w));
    run(generator.insertCalamitySQL(quest.calamity));
    for (const c of generator.generateDecoyCalamities(20, quest.calamity.calamity_id, locations)) run(generator.insertCalamitySQL(c));

    correctAnswers.hero_id       = quest.hero.person_id;
    correctAnswers.hero_name     = quest.hero.name;
    correctAnswers.armor_id      = quest.armor.armor_id;
    correctAnswers.weapon_id     = quest.weapon.weapon_id;
    correctAnswers.calamity_id   = quest.calamity.calamity_id;
    correctAnswers.calamity_name = quest.calamity.entity_name;
}

// ===== STAGE META =====
const STAGE_ORDER = ['hero', 'armor', 'weapon', 'calamity'];
const STAGE_META  = {
    hero:     { chapter: 'Chapter I',   title: 'The Chosen One',        color: '#90ee90', label: 'Novice',       description: 'Use SELECT and WHERE to narrow down to exactly one person. Filter by race, job, hair, alignment, and other traits.' },
    armor:    { chapter: 'Chapter II',  title: 'The Sacred Protection',  color: '#ffd700', label: 'Intermediate', description: 'JOIN the armor table with location using found_location_id = location_id. You may select only the columns asked for.' },
    weapon:   { chapter: 'Chapter III', title: 'The Destined Blade',     color: '#ff8c00', label: 'Advanced',     description: 'JOIN weapon with location using stored_location_id. Consider elemental_property and calamity_weakness_match.' },
    calamity: { chapter: 'Chapter IV',  title: 'The Great Darkness',     color: '#ff4444', label: 'Expert',       description: 'JOIN calamity with location using stronghold_location_id. Find the weakness, true form, and defeat condition.' }
};

// ===== AUTOCOMPLETE =====
const SQL_COLUMNS = [
    'person_id','name','gender','race','hair_color','skin_tone','eye_color','height','body_type',
    'job','background','alignment','birthplace_id','current_location_id','destiny_score',
    'armor_id','armor_name','armor_type','material','primary_enchantment','secondary_enchantment',
    'blessing','defense_rating','magic_resistance','weight_class','artifact_level',
    'found_location_id','required_strength','special_property','crafted_by',
    'weapon_id','weapon_name','weapon_type','elemental_property','damage_type','range_type',
    'handedness','attack_rating','critical_modifier','legendary_property','bound_to_bloodline',
    'forged_location_id','stored_location_id','calamity_weakness_match','required_level',
    'calamity_id','entity_name','calamity_type','true_form','current_form','origin_realm',
    'primary_power','secondary_power','tertiary_power','environmental_effect','psychological_effect',
    'corruption_radius','primary_weakness','secondary_weakness','weak_body_part','vulnerable_time',
    'vulnerable_element','minion_types','stronghold_location_id','awakening_date',
    'prophecy_identifier','defeat_condition','threat_level',
    'location_id','location_name','region','danger_level',
    'SELECT','FROM','WHERE','JOIN','ON','AND','OR','NOT','IN','LIKE','LOWER',
    'ORDER BY','GROUP BY','HAVING','LIMIT','AS','DISTINCT','COUNT','SUM','AVG',
    'person','armor','weapon','calamity','location'
];

function setupAutocomplete() {
    const ta       = document.getElementById('query-input');
    const dropdown = document.getElementById('autocomplete-dropdown');
    if (!ta || !dropdown) return;

    ta.addEventListener('input', () => {
        const val    = ta.value;
        const cursor = ta.selectionStart;
        const before = val.slice(0, cursor);
        const wm     = before.match(/[\w_]+$/);
        const word   = wm ? wm[0] : '';
        if (word.length < 2) { dropdown.style.display = 'none'; return; }

        const matches = [...new Set(SQL_COLUMNS)].filter(c =>
            c.toLowerCase().startsWith(word.toLowerCase()) && c.toLowerCase() !== word.toLowerCase()
        ).slice(0, 8);

        if (!matches.length) { dropdown.style.display = 'none'; return; }

        dropdown.innerHTML = matches.map(m =>
            `<div class="ac-item" onmousedown="insertCompletion('${m}')">${m}</div>`
        ).join('');
        dropdown.style.display = 'block';
        dropdown.style.top   = (ta.offsetTop + ta.offsetHeight) + 'px';
        dropdown.style.left  = ta.offsetLeft + 'px';
        dropdown.style.width = ta.offsetWidth + 'px';
    });

    ta.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));

    ta.addEventListener('keydown', e => {
        if (dropdown.style.display === 'none') return;
        const items  = dropdown.querySelectorAll('.ac-item');
        const active = dropdown.querySelector('.ac-item.ac-active');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = active ? active.nextElementSibling : items[0];
            if (active) active.classList.remove('ac-active');
            if (next) next.classList.add('ac-active');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = active ? active.previousElementSibling : items[items.length - 1];
            if (active) active.classList.remove('ac-active');
            if (prev) prev.classList.add('ac-active');
        } else if (e.key === 'Tab') {
            const sel = dropdown.querySelector('.ac-item.ac-active') || items[0];
            if (sel) { e.preventDefault(); insertCompletion(sel.textContent); }
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });
}

function insertCompletion(word) {
    const ta       = document.getElementById('query-input');
    const dropdown = document.getElementById('autocomplete-dropdown');
    const cursor   = ta.selectionStart;
    const val      = ta.value;
    const before   = val.slice(0, cursor);
    const wm       = before.match(/[\w_]+$/);
    if (!wm) return;
    const start = cursor - wm[0].length;
    ta.value = val.slice(0, start) + word + val.slice(cursor);
    ta.selectionStart = ta.selectionEnd = start + word.length;
    ta.focus();
    if (dropdown) dropdown.style.display = 'none';
}

// ===== KEYWORD HIGHLIGHTING in clue text =====
function highlightClueText(text) {
    if (!currentQuest) return text;
    const q = currentQuest;
    const kws = [
        q.hero.race, q.hero.job, q.hero.alignment, q.hero.hair_color, q.hero.eye_color,
        q.hero.skin_tone, q.hero.body_type, q.hero.background, q.hero.gender,
        q.armor.armor_type, q.armor.material, q.armor.blessing, q.armor.artifact_level, q.armor.primary_enchantment, q.armor.weight_class,
        q.weapon.weapon_type, q.weapon.material, q.weapon.elemental_property, q.weapon.legendary_property, q.weapon.artifact_level, q.weapon.handedness, q.weapon.damage_type,
        q.calamity.calamity_type, q.calamity.origin_realm, q.calamity.primary_power, q.calamity.vulnerable_element, q.calamity.true_form, q.calamity.environmental_effect, q.calamity.psychological_effect, q.calamity.weak_body_part
    ].filter(v => v && v !== 'None' && v.length > 2);
    kws.sort((a, b) => b.length - a.length);
    let out = text;
    for (const kw of kws) {
        const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(`(?<![\\w-])(${esc})(?![\\w-])`, 'g'), `<em class="clue-kw">$1</em>`);
    }
    out = out.replace(/\b(\d+)(cm)?\b/g, '<em class="clue-num">$1$2</em>');
    return out;
}

// ===== SHOW STAGE =====
function showStage(stage) {
    currentStage = stage;
    hintLevel    = 0;
    showScreen('game-screen');

    const meta = STAGE_META[stage];
    const clue = currentQuest[`${stage}Clue`];

    document.title = `${meta.chapter} ... ${meta.title} | The Great Seer's Quest`;

    document.getElementById('stage-header').innerHTML = `
        <span style="color:${meta.color}; font-size:0.8em; letter-spacing:2px; text-transform:uppercase;">${meta.chapter}</span>
        <h2 style="color:#d4af37; margin:6px 0 4px;">${meta.title}</h2>
        <span style="background:rgba(255,255,255,0.07); border-radius:12px; padding:3px 12px; font-size:0.8em; color:${meta.color};">${meta.label}</span>
    `;

    updateChapterMarkers();

    document.getElementById('quest-description').innerHTML = highlightClueText(clue.text);
    document.getElementById('hint-area').innerHTML         = '';
    document.getElementById('query-input').value           = '';
    document.getElementById('query-result').innerHTML      = '';
    document.getElementById('difficulty-label').innerHTML  = `<span style="color:#666; font-size:0.84em;">${meta.description}</span>`;

    const revealLabel    = revealCount >= MAX_REVEALS ? 'Reveal Used' : 'Reveal Answer (1 use)';
    const revealDisabled = revealCount >= MAX_REVEALS ? 'disabled' : '';
    const revealStyle    = revealCount >= MAX_REVEALS ? 'style="opacity:0.4;cursor:not-allowed;"' : '';
    // Hint/reveal penalty notice 
    const ratingWarning = `<div style="width:100%; margin-top:8px; padding:7px 12px; background:rgba(255,150,0,0.10); border:1px solid rgba(255,150,0,0.35); border-radius:6px; font-size:0.78em; color:#cc8800; line-height:1.5;">
        &#9888; Using <strong>Seek Guidance</strong> or <strong>Reveal Answer</strong> affects your final Seer Rating and changes the ending story.
    </div>`;
    document.getElementById('action-bar').innerHTML = `
        <button onclick="getHint()" class="btn-blue">Seek Guidance</button>
        <button onclick="revealSolution()" class="btn-red" id="reveal-btn" ${revealDisabled} ${revealStyle}>${revealLabel}</button>
        <button onclick="window.open('schema_diagram.png','_blank')" class="btn-gold">Schema Diagram</button>
        <button onclick="showPreviousAnswers()" class="btn-green">My Progress</button>
        ${ratingWarning}
    `;

    // Sync dataset browser to the current stage's table
    const stageTable = { hero: 'person', armor: 'armor', weapon: 'weapon', calamity: 'calamity' }[stage] || 'person';
    switchDatasetTab(stageTable);

    setupAutocomplete();
}

function updateChapterMarkers() {
    STAGE_ORDER.forEach(s => {
        const el = document.getElementById(`prog-${s}`);
        if (!el) return;
        el.className = 'progress-step' +
            (previousAnswers.some(a => a.stage === s) ? ' done' : s === currentStage ? ' active' : '');
    });
}

// ===== DATASET BROWSER (bottom panel) =====
function initDatasetBrowser() {
    const tabs = document.getElementById('table-tabs');
    if (!tabs) return;
    tabs.innerHTML = BROWSE_TABLES.map(t =>
        `<button class="table-tab-btn${t === datasetTable ? ' active' : ''}" onclick="switchDatasetTab('${t}')">${t}</button>`
    ).join('');
    loadDatasetTable(datasetTable);
}

function switchDatasetTab(tbl) {
    datasetTable = tbl;
    // Update tab button styles
    document.querySelectorAll('.table-tab-btn').forEach(b => {
        b.classList.toggle('active', b.textContent === tbl);
    });
    // Clear search
    const srch = document.getElementById('table-search');
    if (srch) srch.value = '';
    loadDatasetTable(tbl);
}

function loadDatasetTable(tbl) {
    if (!window.db) return;
    // Use cache if available, else query
    if (!datasetCache[tbl]) {
        try {
            const res = executeQueryRaw(`SELECT * FROM ${tbl} LIMIT 300;`);
            if (res && res[0]) {
                datasetCache[tbl] = { columns: res[0].columns, rows: res[0].values };
            } else {
                datasetCache[tbl] = { columns: [], rows: [] };
            }
        } catch(e) {
            document.getElementById('dataset-content').innerHTML = `<p style="color:#ff6363; padding:8px;">Error: ${e.message}</p>`;
            return;
        }
    }
    renderDatasetTable(datasetCache[tbl].columns, datasetCache[tbl].rows, '');
}

// Highlight-only search: does NOT filter rows.
// Matching cells get <mark>, matching column headers get a CSS class.
function renderDatasetTable(columns, rows, search) {
    const container = document.getElementById('dataset-content');
    if (!container) return;
    if (!columns.length) { container.innerHTML = '<p style="color:#888; padding:8px;">No data.</p>'; return; }

    const q    = (search || '').trim().toLowerCase();
    const escQ = q ? q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

    const headerHtml = columns.map(c =>
        `<th class="${q && c.toLowerCase().includes(q) ? 'col-hl' : ''}">${c}</th>`
    ).join('');

    // All rows shown; cells with matches get highlighted via <mark>
    const bodyHtml = rows.map(r =>
        `<tr>${r.map(cell => {
            const str = String(cell ?? 'NULL');
            const hl  = (q && escQ && str.toLowerCase().includes(q))
                ? str.replace(new RegExp(`(${escQ})`, 'gi'), '<mark>$1</mark>')
                : str;
            return `<td>${hl}</td>`;
        }).join('')}</tr>`
    ).join('');

    const matchCount = q
        ? rows.reduce((acc, r) => acc + r.filter(cell => String(cell ?? '').toLowerCase().includes(q)).length, 0)
          + columns.filter(c => c.toLowerCase().includes(q)).length
        : 0;

    matchIndex = 0;
    container.innerHTML = `
        <p style="color:#555; font-size:0.74em; margin:0 0 6px;">
            ${rows.length} rows &nbsp;|&nbsp; table: <strong style="color:#d4af37;">${datasetTable}</strong>
            ${q ? `&nbsp;|&nbsp; <span style="color:#ffd700;">${matchCount} match${matchCount !== 1 ? 'es' : ''} highlighted for "<em>${q}</em>"</span>` : ''}
        </p>
        <div class="result-wrap" style="max-height:300px;">
            <table>
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        </div>`;
}

function onTableSearch(val) {
    matchIndex = 0; // reset position on new search
    if (!datasetCache[datasetTable]) { loadDatasetTable(datasetTable); return; }
    renderDatasetTable(datasetCache[datasetTable].columns, datasetCache[datasetTable].rows, val);
    // after render, scroll to first match
    setTimeout(() => scrollToMatch(0), 50);
}

// Match navigation state
let matchIndex = 0;

function navigateMatch(dir) {
    const marks = document.querySelectorAll('#dataset-content mark');
    if (!marks.length) return;
    // Remove current active mark highlight
    marks.forEach(m => m.classList.remove('mark-active'));
    matchIndex = ((matchIndex + dir) % marks.length + marks.length) % marks.length;
    scrollToMatch(matchIndex);
    updateMatchCounter(marks.length);
}

function scrollToMatch(idx) {
    const marks = document.querySelectorAll('#dataset-content mark');
    if (!marks.length) { updateMatchCounter(0); return; }
    marks.forEach(m => m.classList.remove('mark-active'));
    const target = marks[idx];
    if (target) {
        target.classList.add('mark-active');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateMatchCounter(marks.length);
}

function updateMatchCounter(total) {
    const el = document.getElementById('match-counter');
    if (!el) return;
    el.textContent = total ? `${matchIndex + 1} / ${total}` : '';
}

// ===== HINTS =====
function getHint() {
    const clue = currentQuest[`${currentStage}Clue`];
    hintsUsed++;
    hintsByStage[currentStage] = (hintsByStage[currentStage] || 0) + 1;
    hintLevel = 1;
    document.getElementById('hint-area').innerHTML = `<div class="hint-box"><strong style="color:#87ceeb;">Hint:</strong><p style="margin:8px 0 0; color:#ddd; line-height:1.7;">${clue.hint1}</p></div>`;
}

function revealSolution() {
    if (revealCount >= MAX_REVEALS) { alert('You have already used your one reveal.'); return; }
    if (!confirm('Show the answer SQL? This uses your only reveal and will affect your final Seer Rating. Continue?')) return;
    revealCount++;
    hintsUsed += 3; // heavier penalty: reveal is more costly than a hint
    const clue = currentQuest[`${currentStage}Clue`];
    document.getElementById('hint-area').innerHTML = `
        <div style="background:rgba(255,99,99,0.1); border:1px solid #ff6363; border-radius:8px; padding:14px; margin-top:10px;">
            <strong style="color:#ff9999;">Answer Revealed (1 of 1 used):</strong>
            <code style="display:block; background:rgba(0,0,0,0.4); padding:12px; border-radius:6px; color:#90ee90; margin-top:10px; white-space:pre-wrap; font-size:0.88em;">${clue.solution}</code>
        </div>`;
    const btn = document.getElementById('reveal-btn');
    if (btn) { btn.textContent = 'Reveal Used'; btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; }
}

function showPreviousAnswers() {
    if (!previousAnswers.length) {
        document.getElementById('hint-area').innerHTML = `<div style="padding:12px; color:#888; font-style:italic;">No completed visions yet.</div>`;
        return;
    }
    const rows = previousAnswers.map(a => `
        <div style="padding:9px; border-bottom:1px solid rgba(255,255,255,0.08);">
            <strong style="color:${STAGE_META[a.stage].color};">${STAGE_META[a.stage].chapter}:</strong>
            <span style="color:#ddd; margin-left:8px;">${a.summary}</span>
        </div>`).join('');
    document.getElementById('hint-area').innerHTML = `
        <div style="background:rgba(144,238,144,0.07); border:1px solid #90ee90; border-radius:8px; padding:14px; margin-top:10px;">
            <strong style="color:#90ee90;">Completed Visions:</strong>
            <div style="margin-top:8px;">${rows}</div>
        </div>`;
}

// ===== QUERY =====
function runQuery() {
    const raw = document.getElementById('query-input').value.trim();
    if (!raw) return;

    // Master debug: skip the CURRENT stage only, not all stages at once
    if (raw.toLowerCase() === DEBUG_PASSCODE.toLowerCase()) {
        debugSkipStage();
        return;
    }

    // Apply automatic case-insensitivity for string comparisons
    const sql = normaliseQueryCasing(raw);

    try {
        const results = executeQueryRaw(sql);
        displayResults(results);
        checkAnswer(results);
    } catch (err) {
        document.getElementById('query-result').innerHTML = `
            <div style="color:#ff6363; background:rgba(255,99,99,0.1); border:1px solid #ff6363; border-radius:8px; padding:12px; margin-top:10px;">
                <strong>Query Error:</strong> ${err.message}
            </div>`;
    }
}

// ===== DEBUG: SKIP CURRENT STAGE =====
// Typing the passcode skips only the stage currently active, no rating penalty.
function debugSkipStage() {
    const s = currentStage;
    const summaries = {
        hero:     `${correctAnswers.hero_name} ... the chosen hero`,
        armor:    `Armor #${correctAnswers.armor_id} ... the sacred protection`,
        weapon:   `Weapon #${correctAnswers.weapon_id} ... the destined blade`,
        calamity: `${correctAnswers.calamity_name} ... the great darkness`
    };
    if (!previousAnswers.some(a => a.stage === s)) {
        previousAnswers.push({ stage: s, summary: summaries[s] });
    }

    document.getElementById('query-result').innerHTML = `
        <div style="background:rgba(212,175,55,0.12); border:1px solid #d4af37; border-radius:8px; padding:14px; margin-top:10px; text-align:center;">
            <strong style="color:#d4af37;">&#9889; Stage Override: ${STAGE_META[s].chapter}</strong>
            <p style="color:#aaa; margin:6px 0 0; font-size:0.88em;">Stage skipped. Proceeding...</p>
        </div>`;

    const idx = STAGE_ORDER.indexOf(s);
    setTimeout(() => showStageTransition(s, idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null), 1000);
}

// ===== DISPLAY RESULTS =====
function displayResults(results) {
    const container = document.getElementById('query-result');
    if (!results || !results.length || !results[0]) {
        container.innerHTML = `<div style="color:#888; padding:12px;">No results returned.</div>`;
        return;
    }
    const { columns, values: rows } = results[0];
    container.innerHTML = `
        <p style="color:#888; font-size:0.8em; margin:8px 0 5px;">${rows.length} row(s) returned</p>
        <div class="result-wrap">
            <table>
                <thead><tr>${columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${cell ?? 'NULL'}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
        </div>`;
}

// ===== CHECK ANSWER =====
// Accepts any column set as long as exactly 1 row is returned and at least one
// identifying signal is present: the ID column OR the name column for that entity.
// This means SELECT armor_name, location_name is valid if it returns exactly the correct armor row.
function checkAnswer(results) {
    if (!results || !results[0] || !results[0].values.length) return;
    const { columns, values: rows } = results[0];
    if (rows.length !== 1) return;

    const cols = columns.map(c => c.toLowerCase());
    const row  = rows[0];
    const col  = name => cols.indexOf(name.toLowerCase());
    let found  = false;

    if (currentStage === 'hero') {
        const pid = col('person_id'), nm = col('name');
        if (pid >= 0 && Number(row[pid]) === correctAnswers.hero_id) found = true;
        if (!found && nm >= 0 && String(row[nm] ?? '').trim().toLowerCase() === correctAnswers.hero_name.toLowerCase()) found = true;
    }

    if (currentStage === 'armor') {
        const aid = col('armor_id'), anm = col('armor_name');
        if (aid >= 0 && Number(row[aid]) === correctAnswers.armor_id) found = true;
        // Also accept by armor_name so SELECT armor_name, location_name is valid
        if (!found && anm >= 0 && String(row[anm] ?? '').trim().toLowerCase() === currentQuest.armor.armor_name.toLowerCase()) found = true;
    }

    if (currentStage === 'weapon') {
        const wid = col('weapon_id'), wnm = col('weapon_name');
        if (wid >= 0 && Number(row[wid]) === correctAnswers.weapon_id) found = true;
        // Also accept by weapon_name so SELECT weapon_name, location_name is valid
        if (!found && wnm >= 0 && String(row[wnm] ?? '').trim().toLowerCase() === currentQuest.weapon.weapon_name.toLowerCase()) found = true;
    }

    if (currentStage === 'calamity') {
        const cid = col('calamity_id'), nm = col('entity_name');
        if (cid >= 0 && Number(row[cid]) === correctAnswers.calamity_id) found = true;
        if (!found && nm >= 0 && String(row[nm] ?? '').trim().toLowerCase() === correctAnswers.calamity_name.toLowerCase()) found = true;
    }

    if (found) onCorrectAnswer();
}

function onCorrectAnswer() {
    const summaries = {
        hero:     `${correctAnswers.hero_name} ... the chosen hero`,
        armor:    `Armor #${correctAnswers.armor_id} ... the sacred protection`,
        weapon:   `Weapon #${correctAnswers.weapon_id} ... the destined blade`,
        calamity: `${correctAnswers.calamity_name} ... the great darkness`
    };
    previousAnswers.push({ stage: currentStage, summary: summaries[currentStage] });

    document.getElementById('query-result').innerHTML += `
        <div style="background:rgba(144,238,144,0.13); border:1px solid #90ee90; border-radius:8px; padding:14px; margin-top:12px; text-align:center;">
            <p style="color:#90ee90; font-size:1.15em; font-weight:bold; margin-bottom:5px;">Vision confirmed.</p>
            <p style="color:#ccc;">${summaries[currentStage]}</p>
        </div>`;

    const idx       = STAGE_ORDER.indexOf(currentStage);
    const nextStage = idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
    setTimeout(() => showStageTransition(currentStage, nextStage), 1400);
}

// ===== STAGE TRANSITIONS =====
const TRANSITION_STORIES = {
    hero: () => `
        <div style="max-width:660px; margin:0 auto; padding:30px 20px;">
            <div style="font-size:2em; margin-bottom:14px; color:#90ee90; text-align:center;">&#10003;</div>
            <h2 style="color:#90ee90; font-size:1.8em; margin-bottom:16px; text-align:center;">Chapter I Complete ... The Hero Found</h2>
            <div style="background:rgba(144,238,144,0.07); border:1px solid #90ee90; border-radius:10px; padding:26px; line-height:1.9; margin-bottom:20px;">
                <p style="margin-bottom:14px; color:#ddd;">The vision sharpens. <strong style="color:#d4af37;">${correctAnswers.hero_name}</strong>... you see them clearly now. They do not yet know what they are destined to do, but the mark of fate is already on them like a shadow before the dawn.</p>
                <p style="margin-bottom:14px; color:#ddd;">You feel the threads pull elsewhere. The hero will need protection. Somewhere in the realm, a piece of armor has been waiting for this exact moment.</p>
                <p style="color:#ffd700; font-weight:bold;">Your next vision: the armor that will shield the hero.</p>
            </div>
            <div style="text-align:center;"><button onclick="showStage('armor')" style="padding:14px 44px; font-size:17px; background:linear-gradient(135deg,#d4af37 0%,#b8860b 100%); color:#1e1e2e; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-family:Georgia,serif;">Continue to Chapter II</button></div>
        </div>`,
    armor: () => `
        <div style="max-width:660px; margin:0 auto; padding:30px 20px;">
            <div style="font-size:2em; margin-bottom:14px; color:#ffd700; text-align:center;">&#10003;</div>
            <h2 style="color:#ffd700; font-size:1.8em; margin-bottom:16px; text-align:center;">Chapter II Complete ... The Armor Located</h2>
            <div style="background:rgba(255,215,0,0.06); border:1px solid #ffd700; border-radius:10px; padding:26px; line-height:1.9; margin-bottom:20px;">
                <p style="margin-bottom:14px; color:#ddd;">Good. The armor is found. It will hold against what is coming. You can feel it... the metal remembers old battles, older promises.</p>
                <p style="margin-bottom:14px; color:#ddd;"><strong style="color:#d4af37;">${correctAnswers.hero_name}</strong> will wear it. But protection alone is not enough. A hero without a weapon is just someone standing very firmly in place.</p>
                <p style="color:#ff8c00; font-weight:bold;">Your next vision: the weapon destined to wound the darkness.</p>
            </div>
            <div style="text-align:center;"><button onclick="showStage('weapon')" style="padding:14px 44px; font-size:17px; background:linear-gradient(135deg,#d4af37 0%,#b8860b 100%); color:#1e1e2e; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-family:Georgia,serif;">Continue to Chapter III</button></div>
        </div>`,
    weapon: () => `
        <div style="max-width:660px; margin:0 auto; padding:30px 20px;">
            <div style="font-size:2em; margin-bottom:14px; color:#ff8c00; text-align:center;">&#10003;</div>
            <h2 style="color:#ff8c00; font-size:1.8em; margin-bottom:16px; text-align:center;">Chapter III Complete ... The Weapon Claimed</h2>
            <div style="background:rgba(255,140,0,0.06); border:1px solid #ff8c00; border-radius:10px; padding:26px; line-height:1.9; margin-bottom:20px;">
                <p style="margin-bottom:14px; color:#ddd;">The party is armed. <strong style="color:#d4af37;">${correctAnswers.hero_name}</strong> now has what they need to fight. But there is one question still unanswered.</p>
                <p style="margin-bottom:14px; color:#ddd;">What exactly are they fighting? You have felt its shadow in every vision... something vast, patient, older than the realm itself. It is time to look directly at the Calamity.</p>
                <p style="color:#ff4444; font-weight:bold;">Your final vision: the nature of the Great Darkness.</p>
            </div>
            <div style="text-align:center;"><button onclick="showStage('calamity')" style="padding:14px 44px; font-size:17px; background:linear-gradient(135deg,#d4af37 0%,#b8860b 100%); color:#1e1e2e; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-family:Georgia,serif;">Continue to Chapter IV</button></div>
        </div>`
};

function showStageTransition(completedStage, nextStage) {
    showScreen('transition-screen');
    const storyFn = TRANSITION_STORIES[completedStage];
    document.getElementById('transition-content').innerHTML = storyFn
        ? storyFn()
        : `<div style="text-align:center; padding:60px;"><button onclick="showEnding()" style="padding:14px 44px; font-size:17px; background:linear-gradient(135deg,#d4af37,#b8860b); color:#1e1e2e; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-family:Georgia,serif;">See the Ending</button></div>`;
}

// ===== ENDINGS =====
// Five ending stories tied to Seer Rating tier.
// Tier is determined by total hints used and whether a reveal was used.
// The story itself changes, not just the title and label.

// Max possible hints = 4 (one per stage). Reveal adds +3 to hintsUsed as penalty.
// Tiers based on hints used (excluding reveal penalty for display):
//   5 = 0 hints, 0 reveals  (perfect)
//   4 = 1 hint,  0 reveals  (strong)
//   3 = 2 hints, 0 reveals  (decent)
//   2 = 3-4 hints, 0 reveals (weak)
//   1 = any reveal used  (blinded)
function getSeerTier() {
    if (revealCount > 0)                      return 1; // blinded, hehess always lowest if reveal used
    if (hintsUsed === 0)                      return 5; // perfect
    if (hintsUsed === 1)                      return 4; // strong
    if (hintsUsed === 2)                      return 3; // decent
    return 2;                                           // 3-4 hints, weak
}

const ENDING_DATA = {
    5: {
        rating: 'The All-Seeing Seer',
        color:  '#d4af37',
        badge:  '&#9733;&#9733;&#9733;&#9733;&#9733;',
        desc:   'No hint was needed. No answer was begged for. Your sight was absolute.',
        story: (hero, calamity) => `
            <p style="font-size:1.05em; margin-bottom:16px;">The party moved through the night without hesitation. You had given them everything they needed, and every thread you pulled had come clean from the weave of fate... unprompted, unforced, and true.</p>
            <p style="font-size:1.05em; margin-bottom:16px;"><strong style="color:#d4af37;">${hero}</strong> led the way. The armor held without a crack. The weapon sang the moment it was drawn. When <strong style="color:#ff9999;">${calamity}</strong> finally rose, it found a party that had been perfectly prepared.</p>
            <p style="font-size:1.05em; margin-bottom:16px;">The battle was fierce, but it was never uncertain. You had seen too clearly for doubt to take root. The Calamity crumbled as though it had always known this moment would come.</p>
            <p style="font-size:1.05em; color:#d4af37;">They lit candles for the Great Seer in every temple in the realm. Not for what you survived, but for what you <em>knew</em>. Your name will pass into legend beside the hero's.</p>
            <p style="font-size:1em; font-style:italic; color:#888; text-align:center; margin-top:20px;">"There are no riddles left for a Seer like you. The threads of fate bow to your sight."</p>`
    },
    4: {
        rating: 'Master Seer',
        color:  '#90ee90',
        badge:  '&#9733;&#9733;&#9733;&#9733;&#9734;',
        desc:   'A few threads required pulling, but your vision held firm throughout.',
        story: (hero, calamity) => `
            <p style="font-size:1.05em; margin-bottom:16px;">The party moved with confidence through the dark. You had seen what mattered and delivered it cleanly. A thread or two had resisted, but you had not flinched.</p>
            <p style="font-size:1.05em; margin-bottom:16px;"><strong style="color:#d4af37;">${hero}</strong> fought with everything you had foreseen. The armor absorbed what it was meant to absorb. The weapon found <strong style="color:#ff9999;">${calamity}</strong>'s weakness as though guided by memory rather than luck.</p>
            <p style="font-size:1.05em; margin-bottom:16px;">The Calamity fell. Not quickly, but inevitably. By the end, there was no question of how it would go.</p>
            <p style="font-size:1.05em; color:#90ee90;">The realm celebrated. You were named among the great Seers of the age... the ones who look into the dark and do not look away.</p>
            <p style="font-size:1em; font-style:italic; color:#888; text-align:center; margin-top:20px;">"A Master Seer sees what others cannot. The realm owes you a debt it cannot repay."</p>`
    },
    3: {
        rating: 'Seer',
        color:  '#87ceeb',
        badge:  '&#9733;&#9733;&#9733;&#9734;&#9734;',
        desc:   'You leaned on guidance at times, but your sight carried you through in the end.',
        story: (hero, calamity) => `
            <p style="font-size:1.05em; margin-bottom:16px;">The party made it through the night. The preparations were not without their uncertain moments, and the visions had required coaxing from deeper in the weave than you might have liked. But the key truths had come.</p>
            <p style="font-size:1.05em; margin-bottom:16px;"><strong style="color:#d4af37;">${hero}</strong> stood at the front when <strong style="color:#ff9999;">${calamity}</strong> appeared. The armor held. The weapon found its mark. The fight was harder than it might have been, longer than it needed to be.</p>
            <p style="font-size:1.05em; margin-bottom:16px;">But it ended. The darkness crumbled, and the realm breathed again.</p>
            <p style="font-size:1.05em; color:#87ceeb;">They lit a candle for you in the quieter temples. Your name is remembered, though not yet carved in stone. There is more sight still to develop.</p>
            <p style="font-size:1em; font-style:italic; color:#888; text-align:center; margin-top:20px;">"You found the path. The next time, perhaps, you will find it faster."</p>`
    },
    2: {
        rating: 'Apprentice Seer',
        color:  '#ffd700',
        badge:  '&#9733;&#9733;&#9734;&#9734;&#9734;',
        desc:   'The visions were cloudy. You relied heavily on guidance to see the truth.',
        story: (hero, calamity) => `
            <p style="font-size:1.05em; margin-bottom:16px;">The party departed with what you had gathered... eventually. The visions had not come easily. The weave had resisted, and you had needed to reach for help more often than a seasoned Seer would.</p>
            <p style="font-size:1.05em; margin-bottom:16px;">Still, <strong style="color:#d4af37;">${hero}</strong> received the intelligence they needed. The armor held. The weapon wounded <strong style="color:#ff9999;">${calamity}</strong> where it was weakest. The battle was long and costly, and there were moments where the outcome felt uncertain.</p>
            <p style="font-size:1.05em; margin-bottom:16px;">But the Calamity fell. Barely. And the realm survived.</p>
            <p style="font-size:1.05em; color:#ffd700;">No candles were lit for you in the temples this time. But you were not forgotten. The next apprentice who sits where you sat will be told: <em>the sight can be trained</em>. You are proof of that.</p>
            <p style="font-size:1em; font-style:italic; color:#888; text-align:center; margin-top:20px;">"You arrived. That is what matters. The sight will sharpen with practice."</p>`
    },
    1: {
        rating: 'Blinded Seer',
        color:  '#ff9999',
        badge:  '&#9733;&#9734;&#9734;&#9734;&#9734;',
        desc:   'The answers were revealed to you. The sight did not come from within.',
        story: (hero, calamity) => `
            <p style="font-size:1.05em; margin-bottom:16px;">The visions did not come. Or rather, they came only when forced open... when the answers were pulled from the weave by someone else's hand, not yours. You passed the intelligence on to the party regardless.</p>
            <p style="font-size:1.05em; margin-bottom:16px;"><strong style="color:#d4af37;">${hero}</strong> departed with the information. The armor. The weapon. The name of <strong style="color:#ff9999;">${calamity}</strong> and how to end it. The party did what parties do: they fought.</p>
            <p style="font-size:1.05em; margin-bottom:16px;">And the Calamity fell. But the victory felt hollow in a way you could not explain. You had watched the threads of fate and let someone else do the reading.</p>
            <p style="font-size:1.05em; color:#ff9999;">No candles. No carved names. Only a quiet hope that, next time, you will trust what lies behind your own eyes before you reach for the light of another.</p>
            <p style="font-size:1em; font-style:italic; color:#888; text-align:center; margin-top:20px;">"The Veilsight is yours to use... but it must be used, not borrowed."</p>`
    }
};

function showEnding() {
    showScreen('ending-screen');

    const tier = getSeerTier();
    const end  = ENDING_DATA[tier];
    const hero     = correctAnswers.hero_name;
    const calamity = correctAnswers.calamity_name;

    const hintRows = STAGE_ORDER.map(s => {
        const n = hintsByStage[s] || 0;
        const m = STAGE_META[s];
        return `<div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:${m.color};">${m.chapter}</span>
            <span style="color:#888;">${n} hint${n !== 1 ? 's' : ''}</span>
        </div>`;
    }).join('');

    document.getElementById('ending-content').innerHTML = `
        <div style="max-width:800px; margin:0 auto; text-align:center;">
            <div style="font-size:1.5em; color:${end.color}; margin-bottom:8px; letter-spacing:3px;">${end.badge}</div>
            <h2 style="color:${end.color}; font-size:2.1em; margin-bottom:6px; text-shadow:0 0 20px ${end.color}55;">${end.rating}</h2>
            <p style="color:#888; font-style:italic; margin-bottom:26px;">${end.desc}</p>

            <div style="background:rgba(212,175,55,0.07); border:2px solid #2a2a4a; border-radius:12px; padding:32px; text-align:left; line-height:1.9; margin-bottom:20px;">
                ${end.story(hero, calamity)}
            </div>

            <div style="margin-top:20px; padding:20px; background:rgba(0,0,0,0.3); border-radius:10px; display:inline-block; min-width:300px; text-align:left;">
                <p style="color:#666; font-size:0.78em; margin:0 0 10px; text-transform:uppercase; letter-spacing:1px;">Quest Summary</p>
                ${hintRows}
                <div style="display:flex; justify-content:space-between; padding:5px 0; margin-top:4px;">
                    <span style="color:#ff9999;">Answer Revealed</span>
                    <span style="color:#888;">${revealCount} used</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:5px 0;">
                    <span style="color:#aaa;">Total hints</span>
                    <span style="color:#888;">${Object.values(hintsByStage).reduce((a,b)=>a+b,0)}</span>
                </div>
            </div>

            <div style="margin-top:24px;">
                <button onclick="location.reload()" style="padding:15px 48px; font-size:17px; background:linear-gradient(135deg,#d4af37 0%,#b8860b 100%); color:#1e1e2e; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-family:Georgia,serif;">Seek a New Vision</button>
            </div>
        </div>`;
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => { showBackstory(); });