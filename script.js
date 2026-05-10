let pokemonData = [];
let activeTypeFilter = 'all';
let activeGenFilter = 'all';

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
    
    document.querySelector('.close-btn').onclick = () => document.getElementById('pokemon-modal').classList.add('hidden');
    window.onclick = e => { if(e.target.classList.contains('modal-overlay')) document.getElementById('pokemon-modal').classList.add('hidden'); };
    
    document.getElementById('search-input').addEventListener('input', applyFilters);
});

async function fetchData() {
    try {
        const response = await fetch('data.json');
        pokemonData = await response.json();
        renderPokemon(pokemonData);
    } catch (e) { console.error("Erro ao carregar banco de dados:", e); }
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
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const filtered = pokemonData.filter(p => {
        const mName = p.name.toLowerCase().includes(search) || p.id.toString() === search;
        const mGen = activeGenFilter === 'all' || p.generation.toString() === activeGenFilter;
        const mType = activeTypeFilter === 'all' || p.types.includes(activeTypeFilter);
        return mName && mGen && mType;
    });
    renderPokemon(filtered);
}

function renderPokemon(list) {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = list.map(p => `
        <div class="pk-card" onclick="openModal(${p.id})">
            <div class="pk-card-inner">
                <span class="pk-id">#${p.id.toString().padStart(3, '0')}</span>
                <img src="${p.image}" loading="lazy">
                <h3 class="pk-name">${p.name}</h3>
                <div class="pk-types-mini">
                    ${p.types.map(t => `<span class="type-dot" style="background:var(--type-${t.toLowerCase()})"></span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

window.openModal = (id) => {
    const p = pokemonData.find(x => x.id === id);
    if(!p) return;
    
    const matchups = calculateMatchups(p.types);
    
    const locationsHTML = p.locations.map(loc => `
        <div class="loc-button" onclick="updateRadar('${loc}', this)">
            <span class="loc-text">${loc}</span>
            <span class="loc-icon">🗺️</span>
        </div>
    `).join('');

    const statsHTML = Object.entries(p.stats).map(([name, val]) => `
        <div class="stat-row">
            <label>${name.toUpperCase()}</label>
            <div class="bar-container"><div class="bar-fill" style="width:${(val/255)*100}%"></div></div>
            <span class="stat-num">${val}</span>
        </div>
    `).join('');

    document.getElementById('modal-body').innerHTML = `
        <div class="modal-pokedex-view">
            <div class="modal-left-wing">
                <div class="screen-border">
                    <div class="main-screen">
                        <img src="${p.image}" class="poke-img-large">
                        <div class="screen-info">
                            <h2>${p.name}</h2>
                            <div class="type-tags">
                                ${p.types.map(t => `<span class="tag" style="background:var(--type-${t.toLowerCase()})">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="location-module">
                    <h4 class="label-tech">LOCALIZAÇÕES DETECTADAS</h4>
                    <div class="loc-list-scroll">${locationsHTML || '<p style="color:#aaa; font-family:monospace;">Nenhum registro encontrado.</p>'}</div>
                </div>
            </div>

            <div class="modal-right-wing">
                <div class="radar-module">
                    <div class="radar-display" id="radar-screen">
                        <div class="radar-grid"></div>
                        <div class="radar-beam"></div>
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
                        <span class="blink" style="color: #ffcb05;">Sincronizando com a Silph Co...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('pokemon-modal').classList.remove('hidden');
    
    setTimeout(() => {
        const first = document.querySelector('.loc-button');
        if(first) first.click();
    }, 100);

    loadEvolutions(p.name);
};

async function loadEvolutions(pokemonName) {
    const container = document.getElementById('evo-container');
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
            const inOurDex = pokemonData.find(p => p.id === e.id);
            if(inOurDex) {
                return `<img src="${inOurDex.image}" class="evo-sprite" title="${inOurDex.name}" onclick="openModal(${inOurDex.id})">`;
            } else {
                return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.id}.png" class="evo-sprite missing" title="${e.name} (Fora do DB)">`;
            }
        }).join('<span class="evo-arrow">❯</span>'); 

    } catch(err) {
        container.innerHTML = '<span style="color:#ff6b6b; font-size:0.7rem; font-family: monospace;">Falha no sinal. DNA não encontrado.</span>';
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

window.updateRadar = (name, el) => {
    document.querySelectorAll('.loc-button').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    
    const screen = document.getElementById('radar-screen');
    
    // --- O TRUQUE PARA O WINDOWS ---
    // Pega o nome do JSON e troca todas as barras (/) por hifens (-)
    const nomeSeguro = name.replace(/\//g, '-');
    
    // Agora ele busca a imagem usando os hifens na URL
    const imagePath = `mapas/${nomeSeguro}.png`;
    
    screen.innerHTML = `
        <img src="${imagePath}" class="map-img" onerror="this.style.display='none'; showRadarFallback('${name}')">
        <div class="radar-grid"></div>
        <div class="radar-beam"></div>
        <div class="map-overlay"></div>
    `;
    
    document.getElementById('radar-label').innerText = name.toUpperCase();
};

window.showRadarFallback = (name) => {
    const screen = document.getElementById('radar-screen');
    screen.innerHTML = `
        <div class="radar-grid"></div>
        <div class="radar-beam"></div>
        <div class="radar-status">
            <span class="blink">BUSCANDO SINAL...</span><br>
            <strong style="color:#32cd32; font-size:0.65rem;">${name}</strong>
        </div>
    `;
};
