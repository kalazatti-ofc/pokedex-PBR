let pokemonData = [];
let activeTypeFilter = 'all';
let activeGenFilter = 'all';
let activeCatchFilter = 'all';
let activeCategory = 'normal'; // Controla a aba atual

let caughtPokemon = JSON.parse(localStorage.getItem('pokedex-caught')) || [];

const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

const typeModifiers = {
    Normal: { Fighting: 2, Ghost: 0 }, Fire: { Fire: 0.5, Water: 2, Grass: 0.5, Ice: 0.5, Ground: 2, Bug: 0.5, Rock: 2, Steel: 0.5, Fairy: 0.5 },
    Water: { Fire: 0.5, Water: 0.5, Electric: 2, Grass: 2, Ice: 0.5, Steel: 0.5 }, Electric: { Electric: 0.5, Ground: 2, Flying: 0.5, Steel: 0.5 },
    Grass: { Fire: 2, Water: 0.5, Electric: 0.5, Grass: 0.5, Ice: 2, Poison: 2, Ground: 0.5, Flying: 2, Bug: 2 }, Ice: { Fire: 2, Ice: 0.5, Fighting: 2, Rock: 2, Steel: 2 },
    Fighting: { Flying: 2, Psychic: 2, Bug: 0.5, Rock: 0.5, Dark: 0.5, Fairy: 2 }, Poison: { Grass: 0.5, Fighting: 0.5, Poison: 0.5, Ground: 2, Psychic: 2, Bug: 0.5, Fairy: 0.5 },
    Ground: { Water: 2, Electric: 0, Grass: 2, Ice: 2, Poison: 0.5, Rock: 0.5 }, Flying: { Electric: 2, Grass: 0.5, Ice: 2, Fighting: 0.5, Ground: 0, Bug: 0.5 },
    Psychic: { Fighting: 0.5, Psychic: 0.5, Bug: 2, Ghost: 2, Dark: 2 }, Bug: { Fire: 2, Grass: 0.5, Fighting: 0.5, Ground: 0.5, Flying: 2, Rock: 2 },
    Rock: { Normal: 0.5, Fire: 0.5, Water: 2, Grass: 2, Fighting: 2, Poison: 0.5, Ground: 2, Flying: 0.5, Steel: 2 }, Ghost: { Normal: 0, Fighting: 0, Poison: 0.5, Bug: 0.5, Ghost: 2, Dark: 2 },
    Dragon: { Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 0.5, Ice: 2, Dragon: 2, Fairy: 2 }, Dark: { Fighting: 2, Psychic: 0, Bug: 2, Ghost: 0.5, Dark: 0.5, Fairy: 2 },
    Steel: { Normal: 0.5, Fire: 2, Grass: 0.5, Ice: 0.5, Fighting: 2, Poison: 0, Ground: 2, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 0.5, Dragon: 0.5, Steel: 0.5, Fairy: 0.5 },
    Fairy: { Fighting: 0.5, Poison: 2, Bug: 0.5, Dragon: 0, Dark: 0.5, Steel: 2 }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    renderTypeButtons();
    setupToggles();
    initOakModal();
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (localStorage.getItem('pokedex-dark-mode') === 'true') {
            document.body.classList.add('dark-mode');
        }
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('pokedex-dark-mode', document.body.classList.contains('dark-mode'));
        });
    }
    
    document.querySelector('.close-btn').onclick = () => document.getElementById('pokemon-modal').classList.add('hidden');
    window.onclick = e => { if(e.target.classList.contains('modal-overlay')) document.getElementById('pokemon-modal').classList.add('hidden'); };
    
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') this.blur(); 
    });
    document.getElementById('search-btn').addEventListener('click', () => {
        applyFilters();
        document.getElementById('search-input').blur(); 
    });

    document.querySelectorAll('#catch-filters .filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#catch-filters .filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCatchFilter = pill.dataset.catch;
            applyFilters();
        });
    });

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            applyFilters();
        });
    });
});

async function fetchData() {
    try {
        // Puxa os três arquivos JSON ao mesmo tempo para não perder velocidade
        const [normalRes, darkRes, bossRes] = await Promise.all([
            fetch('data_normal.json?v=' + new Date().getTime()),
            fetch('data_dark.json?v=' + new Date().getTime()),
            fetch('data_boss.json?v=' + new Date().getTime())
        ]);

        // Converte as respostas para JSON
        const normalData = await normalRes.json();
        const darkData = await darkRes.json();
        const bossData = await bossRes.json();

        // Une todos os dados em uma única lista para a Pokédex
        pokemonData = [...normalData, ...darkData, ...bossData];
        renderPokemon(pokemonData);
    } catch (e) { 
        console.error("Erro ao carregar os bancos de dados. Verifique se os nomes dos 3 arquivos JSON estão corretos.", e); 
    }
}

function renderTypeButtons() {
    const container = document.getElementById('type-filters');
    container.innerHTML = '<button class="filter-pill active" data-type="all">TODOS</button>';
    types.forEach(t => {
        container.innerHTML += `<button class="filter-pill" data-type="${t}" style="--chip-color: var(--type-${t.toLowerCase()})">${t.toUpperCase()}</button>`;
    });

    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const group = pill.closest('.pills-container').id;
            document.getElementById(group).querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            if(group === 'gen-filters') activeGenFilter = pill.dataset.gen;
            if(group === 'type-filters') activeTypeFilter = pill.dataset.type;
            applyFilters();
        });
    });
}

function setupToggles() {
    document.getElementById('toggle-gen').onclick = function() {
        const group = document.getElementById('group-gen');
        group.classList.toggle('hidden-filter');
        this.innerText = group.classList.contains('hidden-filter') ? '▼ FILTRAR POR REGIÃO' : '▲ ESCONDER REGIÕES';
    };
    document.getElementById('toggle-type').onclick = function() {
        const group = document.getElementById('group-type');
        group.classList.toggle('hidden-filter');
        this.innerText = group.classList.contains('hidden-filter') ? '▼ FILTRAR POR TIPO' : '▲ ESCONDER TIPOS';
    };
    document.getElementById('toggle-catch').onclick = function() {
        const group = document.getElementById('group-catch');
        group.classList.toggle('hidden-filter');
        this.innerText = group.classList.contains('hidden-filter') ? '▼ STATUS DE CAPTURA' : '▲ ESCONDER STATUS';
    };
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = pokemonData.filter(p => {
        const pCat = p.category || 'normal';
        if (pCat !== activeCategory) return false;

        const mName = p.name.toLowerCase().includes(search) || p.id.toString() === search;
        const mGen = activeGenFilter === 'all' || (p.generation && p.generation.toString() === activeGenFilter);
        const mType = activeTypeFilter === 'all' || p.types.includes(activeTypeFilter);
        
        const isCaught = caughtPokemon.includes(p.id);
        let mCatch = true;
        if (activeCatchFilter === 'caught') mCatch = isCaught;
        if (activeCatchFilter === 'uncaught') mCatch = !isCaught;

        return mName && mGen && mType && mCatch;
    });
    renderPokemon(filtered);
}

window.toggleCatch = (event, id) => {
    event.stopPropagation();
    const idx = caughtPokemon.indexOf(id);
    
    if(idx > -1) {
        caughtPokemon.splice(idx, 1);
        event.target.classList.remove('caught');
    } else {
        caughtPokemon.push(id);
        event.target.classList.add('caught');
    }
    
    localStorage.setItem('pokedex-caught', JSON.stringify(caughtPokemon));

    if (activeCatchFilter !== 'all') {
        applyFilters();
    }
};

function renderPokemon(list) {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = list.map(p => {
        const isCaught = caughtPokemon.includes(p.id);
        const pCategory = p.category || 'normal';
        
        return `
            <div class="pk-card" onclick="openModal('${p.id}')">
                <div class="pk-card-inner">
                    <span class="pk-id">#${p.id.toString().padStart(3, '0')}</span>
                    <div class="catch-btn ${isCaught ? 'caught' : ''}" onclick="toggleCatch(event, '${p.id}')" title="Marcar como Capturado"></div>
                    <img src="${p.image}" loading="lazy">
                    <h3 class="pk-name">${p.name}</h3>
                    
                    <div class="pk-gen-bar">${pCategory === 'boss' ? 'BOSS 24H' : (pCategory === 'dark' ? 'DARK' : 'GEN ' + p.generation)}</div>
                    
                    <div class="pk-types-mini">
                        ${p.types.map(t => `<span class="type-dot" style="background:var(--type-${t.toLowerCase()})"></span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.toggleAccordion = (arrowEl, event) => {
    if(event) event.stopPropagation();
    const container = arrowEl.closest('.loc-accordion').querySelector('.loc-steps-container');
    container.classList.toggle('hidden-steps');
    arrowEl.innerText = container.classList.contains('hidden-steps') ? '▼' : '▲';
};

window.copyLoc = (text, el, event) => {
    if(event) event.stopPropagation(); 
    const msg = text;
    navigator.clipboard.writeText(msg).then(() => {
        const originalIcon = el.innerText;
        el.innerText = '✅';
        el.style.color = '#32cd32';
        el.style.opacity = '1';
        el.style.transform = 'scale(1.2)';
        setTimeout(() => { 
            el.innerText = originalIcon; 
            el.style.color = '';
            el.style.opacity = '';
            el.style.transform = '';
        }, 1200);
    }).catch(err => console.error('Erro ao copiar: ', err));
};

window.openModal = (id) => {
    const p = pokemonData.find(x => x.id.toString() === id.toString());
    if(!p) return;
    
    const matchups = calculateMatchups(p.types);
    const pCategory = p.category || 'normal';
    
    const locationsHTML = (p.locations || []).map(loc => {
        if (typeof loc === 'string') {
            return `
                <div class="loc-button" onclick="updateRadar('${loc}', this)">
                    <span class="loc-text">${loc}</span>
                    <div class="loc-actions">
                        <span class="loc-icon copy-icon" title="Copiar Coordenada" onclick="copyLoc('${loc}', this, event)">📋</span>
                        <span class="loc-icon">🗺️</span>
                    </div>
                </div>
            `;
        } 
        else if (typeof loc === 'object') {
            const isRoute = loc.passos && loc.passos.length > 0;
            const locName = loc.rota || loc.local || 'Local Desconhecido';
            const noteHTML = loc.nota ? `<span class="info-tooltip loc-icon" data-tooltip="${loc.nota}">💬</span>` : '';

            if (isRoute) {
                const stepsHTML = loc.passos.map(passo => `
                    <div class="loc-step" onclick="updateRadar('${passo}', this, event)">
                        <span class="loc-text">${passo}</span>
                        <div class="loc-actions">
                            <span class="loc-icon copy-icon" title="Copiar Passo" onclick="copyLoc('${passo}', this, event)">📋</span>
                            <span class="loc-icon">📍</span>
                        </div>
                    </div>
                `).join('');

                return `
                    <div class="loc-accordion">
                        <div class="loc-button accordion-toggle" onclick="updateRadar('${loc.passos[0]}', this, event)">
                            <span class="loc-text">${locName}</span>
                            <div class="loc-actions">
                                ${noteHTML}
                                <span class="loc-icon copy-icon" title="Copiar Local" onclick="copyLoc('${locName}', this, event)">📋</span>
                                <span class="loc-icon expand-arrow" title="Ver Coordenadas" onclick="toggleAccordion(this, event)">▼</span>
                            </div>
                        </div>
                        <div class="loc-steps-container hidden-steps">
                            ${stepsHTML}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="loc-button" onclick="updateRadar('${locName}', this)">
                        <span class="loc-text">${locName}</span>
                        <div class="loc-actions">
                            ${noteHTML}
                            <span class="loc-icon copy-icon" title="Copiar Coordenada" onclick="copyLoc('${locName}', this, event)">📋</span>
                        </div>
                    </div>
                `;
            }
        }
    }).join('');

    let rightWingHTML = '';

    if (pCategory === 'boss') {
        rightWingHTML = `
            <div class="radar-module">
                <div class="radar-display" id="radar-screen">
                    <div class="radar-grid"></div><div class="radar-beam"></div>
                    <p id="radar-label">RASTREANDO...</p>
                </div>
            </div>

            <div class="boss-guide-module">
                <h4 class="label-tech">MANUAL DE COMBATE</h4>
                <p class="boss-guide-text">${p.guide || 'Nenhuma informação avançada detectada sobre este Boss.'}</p>
            </div>

            <div class="boss-loot-module">
                <h4 class="label-tech">RECOMPENSA DIÁRIA</h4>
                <div class="loot-box">${p.loot || '???'}</div>
            </div>

            <div class="eff-module">
                <h4 class="label-tech">EFETIVIDADE DE TIPO</h4>
                <div class="eff-group">
                    <label>FRAQUEZAS (Leva 2x Dano)</label>
                    <div class="eff-icons">${matchups.weak.length > 0 ? matchups.weak.map(t => `<div class="eff-dot" title="${t}" style="background:var(--type-${t.toLowerCase()})"></div>`).join('') : '<span style="color:#aaa; font-size:0.7rem;">Nenhuma</span>'}</div>
                </div>
                <div class="eff-group">
                    <label>RESISTÊNCIAS (Leva 0.5x Dano)</label>
                    <div class="eff-icons">${matchups.resist.length > 0 ? matchups.resist.map(t => `<div class="eff-dot" title="${t}" style="background:var(--type-${t.toLowerCase()})"></div>`).join('') : '<span style="color:#aaa; font-size:0.7rem;">Nenhuma</span>'}</div>
                </div>
            </div>
        `;
    } else if (pCategory === 'dark') {
        const statsHTML = Object.entries(p.stats || {}).map(([name, val]) => `
            <div class="stat-row">
                <label>${name.toUpperCase()}</label>
                <div class="bar-container"><div class="bar-fill" style="width:${(val/255)*100}%"></div></div>
                <span class="stat-num">${val}</span>
            </div>
        `).join('');

        let soulsHTML = '';
        if (p.souls) {
            const soulsNormal = p.souls.normal ? p.souls.normal : '???';
            const soulsEternizado = p.souls.eternizado ? p.souls.eternizado : '???';
            soulsHTML = `
                <div class="souls-module">
                    <h4 class="label-tech">CUSTO DE CONVERSÃO (SOULS)</h4>
                    <div class="souls-container">
                        <div class="soul-box">
                            <span class="soul-label">NORMAL</span>
                            <span class="soul-value">${soulsNormal}</span>
                        </div>
                        <div class="soul-box eternizado">
                            <span class="soul-label">ETERNIZADO</span>
                            <span class="soul-value">${soulsEternizado}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const textoExclusivo = p.exclusive ? p.exclusive : 'CAPTURA EXCLUSIVA / EVENTO';
            soulsHTML = `
                <div class="souls-module">
                    <h4 class="label-tech">MÉTODO DE OBTENÇÃO</h4>
                    <span class="exclusive-badge">${textoExclusivo.toUpperCase()}</span>
                </div>
            `;
        }

        rightWingHTML = `
            <div class="radar-module">
                <div class="radar-display" id="radar-screen">
                    <div class="radar-grid"></div><div class="radar-beam"></div>
                    <p id="radar-label">RASTREANDO...</p>
                </div>
            </div>

            <div class="data-module">
                <h4 class="label-tech">STATUS BASE</h4>
                <div class="stats-list">${statsHTML}</div>
            </div>

            ${soulsHTML}

            <div class="eff-module">
                <h4 class="label-tech">EFETIVIDADE DE TIPO</h4>
                <div class="eff-group">
                    <label>FRAQUEZAS (Leva 2x Dano)</label>
                    <div class="eff-icons">${matchups.weak.length > 0 ? matchups.weak.map(t => `<div class="eff-dot" title="${t}" style="background:var(--type-${t.toLowerCase()})"></div>`).join('') : '<span style="color:#aaa; font-size:0.7rem;">Nenhuma</span>'}</div>
                </div>
                <div class="eff-group">
                    <label>RESISTÊNCIAS (Leva 0.5x Dano)</label>
                    <div class="eff-icons">${matchups.resist.length > 0 ? matchups.resist.map(t => `<div class="eff-dot" title="${t}" style="background:var(--type-${t.toLowerCase()})"></div>`).join('') : '<span style="color:#aaa; font-size:0.7rem;">Nenhuma</span>'}</div>
                </div>
            </div>
        `;
    } else {
        const statsHTML = Object.entries(p.stats || {}).map(([name, val]) => `
            <div class="stat-row">
                <label>${name.toUpperCase()}</label>
                <div class="bar-container"><div class="bar-fill" style="width:${(val/255)*100}%"></div></div>
                <span class="stat-num">${val}</span>
            </div>
        `).join('');

        rightWingHTML = `
            <div class="radar-module">
                <div class="radar-display" id="radar-screen">
                    <div class="radar-grid"></div><div class="radar-beam"></div>
                    <p id="radar-label">RASTREANDO...</p>
                </div>
            </div>

            <div class="data-module">
                <h4 class="label-tech">STATUS BASE</h4>
                <div class="stats-list">${statsHTML}</div>
            </div>

            <div class="eff-module">
                <h4 class="label-tech">EFETIVIDADE DE TIPO</h4>
                <div class="eff-group">
                    <label>FRAQUEZAS (Leva 2x Dano)</label>
                    <div class="eff-icons">${matchups.weak.length > 0 ? matchups.weak.map(t => `<div class="eff-dot" title="${t}" style="background:var(--type-${t.toLowerCase()})"></div>`).join('') : '<span style="color:#aaa; font-size:0.7rem;">Nenhuma</span>'}</div>
                </div>
                <div class="eff-group">
                    <label>RESISTÊNCIAS (Leva 0.5x Dano)</label>
                    <div class="eff-icons">${matchups.resist.length > 0 ? matchups.resist.map(t => `<div class="eff-dot" title="${t}" style="background:var(--type-${t.toLowerCase()})"></div>`).join('') : '<span style="color:#aaa; font-size:0.7rem;">Nenhuma</span>'}</div>
                </div>
            </div>

            <div class="evo-module">
                <h4 class="label-tech">CADEIA EVOLUTIVA</h4>
                <div class="evo-icons" id="evo-container">
                    <span class="blink" style="color: #ffcb05;">Sincronizando...</span>
                </div>
            </div>
        `;
    }

    document.getElementById('modal-body').innerHTML = `
        <div class="modal-pokedex-view">
            <div class="modal-left-wing">
                <div class="screen-border">
                    <div class="main-screen ${pCategory !== 'normal' ? 'main-screen-stacked' : ''}">
                        ${pCategory !== 'normal' ? `
                            <div class="stacked-container">
                                <img src="${p.image}" class="poke-img-stacked">
                                <h2 class="poke-name-stacked">${p.name}</h2>
                                <div class="modal-gen-bar stacked-gen-bar">${pCategory === 'boss' ? 'ALERTA DE BOSS' : 'CLASSE DARK'}</div>
                                <div class="type-tags stacked-type-tags">
                                    ${p.types.map(t => `<span class="tag" style="background:var(--type-${t.toLowerCase()})">${t}</span>`).join('')}
                                </div>
                            </div>
                        ` : `
                            <img src="${p.image}" class="poke-img-large">
                            <div class="screen-info">
                                <h2>${p.name}</h2>
                                <div class="modal-gen-bar">GERAÇÃO ${p.generation}</div>
                                <div class="type-tags">
                                    ${p.types.map(t => `<span class="tag" style="background:var(--type-${t.toLowerCase()})">${t}</span>`).join('')}
                                </div>
                            </div>
                        `}
                    </div>
                </div>
                
                <div class="location-module">
                    <h4 class="label-tech">${pCategory === 'boss' ? 'COORDENADA DO COVIL' : 'LOCALIZAÇÕES DETECTADAS'}</h4>
                    <div class="loc-list-scroll">${locationsHTML || '<p style="color:#aaa; font-family:monospace;">Nenhum registro encontrado.</p>'}</div>
                </div>
            </div>

            <div class="modal-right-wing">
                ${rightWingHTML}
            </div>
        </div>
    `;
    
    document.getElementById('pokemon-modal').classList.remove('hidden');
    
    setTimeout(() => {
        const firstLoc = document.querySelector('.loc-button');
        if(firstLoc) firstLoc.click();
    }, 100);

    if (pCategory === 'normal') {
        loadEvolutions(p.name);
    }
};

async function loadEvolutions(pokemonName) {
    const container = document.getElementById('evo-container');
    if (!container) return; 
    try {
        let apiName = pokemonName.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-');
        if(apiName === 'mrmime') apiName = 'mr-mime'; 

        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${apiName}`);
        if(!speciesRes.ok) throw new Error();
        const speciesData = await speciesRes.json();
        
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        
        let allEvos = [];
        function extractEvo(node) {
            const idMatch = node.species.url.match(/\/(\d+)\/$/);
            if(idMatch) allEvos.push({ name: node.species.name, id: parseInt(idMatch[1]) });
            node.evolves_to.forEach(child => extractEvo(child));
        }
        extractEvo(evoData.chain);
        
        container.innerHTML = allEvos.map(e => {
            const inOurDex = pokemonData.find(p => p.id.toString() === e.id.toString() && (!p.category || p.category === 'normal'));
            if(inOurDex) {
                return `<img src="${inOurDex.image}" class="evo-sprite" title="${inOurDex.name}" onclick="openModal('${inOurDex.id}')">`;
            } else {
                return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.id}.png" class="evo-sprite missing" title="${e.name} (Fora do DB)">`;
            }
        }).join('<span class="evo-arrow">❯</span>'); 

    } catch(err) {
        container.innerHTML = '<span style="color:#ff6b6b; font-size:0.7rem; font-family: monospace;">Sincronização Indisponível.</span>';
    }
}

function calculateMatchups(pTypes) {
    let multipliers = {}; 
    types.forEach(t => multipliers[t] = 1);
    pTypes.forEach(pt => {
        const mods = typeModifiers[pt] || {};
        types.forEach(atk => { if(mods[atk] !== undefined) multipliers[atk] *= mods[atk]; });
    });
    let weak = [], resist = [];
    for(const [t, m] of Object.entries(multipliers)) { 
        if(m > 1) weak.push(t); 
        if(m < 1) resist.push(t); 
    }
    return { weak, resist };
}

window.updateRadar = (name, el, event) => {
    if(event) event.stopPropagation();

    document.querySelectorAll('.loc-button, .loc-step').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    
    const screen = document.getElementById('radar-screen');
    const nomeSeguro = name.replace(/\//g, '-');
    const imagePath = `mapas/${nomeSeguro}.png`;
    
    let locName = name.toUpperCase();
    let coords = "SINAL GPS ESTABELECIDO";
    
    const match = name.match(/^(.*?)\s*\((.*?)\)$/);
    if(match) {
        locName = match[1].toUpperCase();
        coords = match[2].toUpperCase();
    }
    
    screen.innerHTML = `
        <img src="${imagePath}" class="map-img" onerror="this.style.display='none'; showRadarFallback('${name}')">
        <div class="radar-grid"></div>
        <div class="radar-beam"></div>
        <div class="map-overlay"></div>
        
        <div class="sat-hud">
            <div class="sat-hud-line rec">● REC</div>
            <div class="sat-hud-line">LOC: ${locName}</div>
            <div class="sat-hud-line" style="color:#ffd700;">${coords}</div>
        </div>
    `;
};

window.showRadarFallback = (name) => {
    const screen = document.getElementById('radar-screen');
    let locName = name.toUpperCase();
    let coords = "BUSCANDO DADOS...";
    const match = name.match(/^(.*?)\s*\((.*?)\)$/);
    if(match) {
        locName = match[1].toUpperCase();
        coords = match[2].toUpperCase();
    }

    screen.innerHTML = `
        <div class="radar-grid"></div>
        <div class="radar-beam"></div>
        <div class="map-overlay"></div>
        
        <div class="sat-hud">
            <div class="sat-hud-line" style="color:#ff4b2b;">⚠ SEM VISUAL</div>
            <div class="sat-hud-line">LOC: ${locName}</div>
            <div class="sat-hud-line blink" style="color:#ffd700;">${coords}</div>
        </div>
    `;
};

const oakDialogues = [
    "Olá! Bem-vindo ao mundo de PokemonR - PBR!",
    "Esta Pokedex e uma pagina criada de fãs para fãs e NAO é um produto oficial do Servidor",
    "Um agradecimento super especial a comunidade pelo apoio continuo!",
    "Apoiadores: Jurubinha, Upzin, Paleguazv, Marlin, Leander Hastings",
    "Desenvolvida por: Kalazatti.",
    "Use a barra de pesquisa ou os filtros para rastrear os POKeMON. Boa caca!"
];

let currentDialogIndex = 0;
let currentCharIndex = 0;
let isTyping = false;
let typingSpeed = 40;
let typeInterval;

function initOakModal() {
    const oakModal = document.getElementById('oak-modal');
    const closeBtn = document.getElementById('close-oak');
    const dialogBox = document.getElementById('oak-dialog-box');
    
    oakModal.classList.remove('hidden');
    startTyping();

    closeBtn.addEventListener('click', () => { oakModal.classList.add('hidden'); });

    dialogBox.addEventListener('click', () => {
        const textContainer = document.getElementById('oak-text');
        const arrow = document.getElementById('oak-arrow');

        if (isTyping) {
            clearInterval(typeInterval);
            textContainer.innerHTML = oakDialogues[currentDialogIndex];
            isTyping = false;
            arrow.style.display = 'block';
        } else {
            currentDialogIndex++;
            if (currentDialogIndex < oakDialogues.length) {
                startTyping();
            } else {
                oakModal.classList.add('hidden');
            }
        }
    });
}

function startTyping() {
    const textContainer = document.getElementById('oak-text');
    const arrow = document.getElementById('oak-arrow');
    textContainer.innerHTML = '';
    currentCharIndex = 0;
    isTyping = true;
    arrow.style.display = 'none';

    clearInterval(typeInterval);
    typeInterval = setInterval(() => {
        textContainer.innerHTML += oakDialogues[currentDialogIndex].charAt(currentCharIndex);
        currentCharIndex++;

        if (currentCharIndex >= oakDialogues[currentDialogIndex].length) {
            clearInterval(typeInterval);
            isTyping = false;
            arrow.style.display = 'block';
        }
    }, typingSpeed);
}
