let pokemonData = [];
let activeTypeFilter = 'all';

const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

// Matriz de Dano (Para calcular Fraquezas e Resistências automaticamente)
const typeModifiers = {
    Normal: { Fighting: 2, Ghost: 0 },
    Fire: { Fire: 0.5, Water: 2, Grass: 0.5, Ice: 0.5, Ground: 2, Bug: 0.5, Rock: 2, Steel: 0.5, Fairy: 0.5 },
    Water: { Fire: 0.5, Water: 0.5, Electric: 2, Grass: 2, Ice: 0.5, Steel: 0.5 },
    Electric: { Electric: 0.5, Ground: 2, Flying: 0.5, Steel: 0.5 },
    Grass: { Fire: 2, Water: 0.5, Electric: 0.5, Grass: 0.5, Ice: 2, Poison: 2, Ground: 0.5, Flying: 2, Bug: 2 },
    Ice: { Fire: 2, Ice: 0.5, Fighting: 2, Rock: 2, Steel: 2 },
    Fighting: { Flying: 2, Psychic: 2, Bug: 0.5, Rock: 0.5, Dark: 0.5, Fairy: 2 },
    Poison: { Grass: 0.5, Fighting: 0.5, Poison: 0.5, Ground: 2, Psychic: 2, Bug: 0.5, Fairy: 0.5 },
    Ground: { Water: 2, Electric: 0, Grass: 2, Ice: 2, Poison: 0.5, Rock: 0.5 },
    Flying: { Electric: 2, Grass: 0.5, Ice: 2, Fighting: 0.5, Ground: 0, Bug: 0.5 },
    Psychic: { Fighting: 0.5, Psychic: 0.5, Bug: 2, Ghost: 2, Dark: 2 },
    Bug: { Fire: 2, Grass: 0.5, Fighting: 0.5, Ground: 0.5, Flying: 2, Rock: 2 },
    Rock: { Normal: 0.5, Fire: 0.5, Water: 2, Grass: 2, Fighting: 2, Poison: 0.5, Ground: 2, Flying: 0.5, Steel: 2 },
    Ghost: { Normal: 0, Fighting: 0, Poison: 0.5, Bug: 0.5, Ghost: 2, Dark: 2 },
    Dragon: { Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 0.5, Ice: 2, Dragon: 2, Fairy: 2 },
    Dark: { Fighting: 2, Psychic: 0, Bug: 2, Ghost: 0.5, Dark: 0.5, Fairy: 2 },
    Steel: { Normal: 0.5, Fire: 2, Grass: 0.5, Ice: 0.5, Fighting: 2, Poison: 0, Ground: 2, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 0.5, Dragon: 0.5, Steel: 0.5, Fairy: 0.5 },
    Fairy: { Fighting: 0.5, Poison: 2, Bug: 0.5, Dragon: 0, Dark: 0.5, Steel: 2 }
};

const grid = document.getElementById('pokedex-grid');
const searchInput = document.getElementById('search-input');
const genFilter = document.getElementById('gen-filter');
const typeFiltersContainer = document.getElementById('type-filters');
const modal = document.getElementById('pokemon-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-btn');

document.addEventListener('DOMContentLoaded', () => {
    renderTypeButtons();
    fetchData();
    searchInput.addEventListener('input', applyFilters);
    genFilter.addEventListener('change', applyFilters);
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { 
        if(e.target === modal) modal.classList.add('hidden'); 
    });
});

async function fetchData() {
    try {
        const response = await fetch('data.json');
        pokemonData = await response.json();
        renderPokemon(pokemonData);
    } catch (error) {
        console.error("Erro no JSON:", error);
    }
}

function renderTypeButtons() {
    typeFiltersContainer.innerHTML = '';
    const btnAll = document.createElement('button');
    btnAll.textContent = 'Todos';
    btnAll.classList.add('type-btn', 'active');
    btnAll.style.background = '#555';
    btnAll.addEventListener('click', () => setTypeFilter('all', btnAll));
    typeFiltersContainer.appendChild(btnAll);

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.textContent = type;
        btn.classList.add('type-btn');
        btn.style.background = `var(--type-${type.toLowerCase()})`;
        btn.addEventListener('click', () => setTypeFilter(type, btn));
        typeFiltersContainer.appendChild(btn);
    });
}

function setTypeFilter(type, clickedBtn) {
    activeTypeFilter = type;
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
    applyFilters();
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGen = genFilter.value;
    const filtered = pokemonData.filter(pokemon => {
        const matchesName = pokemon.name.toLowerCase().includes(searchTerm) || pokemon.id.toString() === searchTerm;
        const matchesGen = selectedGen === 'all' || pokemon.generation.toString() === selectedGen;
        const matchesType = activeTypeFilter === 'all' || pokemon.types.includes(activeTypeFilter);
        return matchesName && matchesGen && matchesType;
    });
    renderPokemon(filtered);
}

function renderPokemon(pokemonArray) {
    grid.innerHTML = '';
    pokemonArray.forEach(pokemon => {
        const primaryType = pokemon.types[0].toLowerCase();
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.style.setProperty('--bg-color', `var(--type-${primaryType})`);
        card.addEventListener('click', () => openModal(pokemon));
        const typesHTML = pokemon.types.map(t => `<span class="type-badge" style="background-color: var(--type-${t.toLowerCase()})">${t}</span>`).join('');
        card.innerHTML = `<p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</p><img src="${pokemon.image}" alt="${pokemon.name}"><h3 class="pokemon-name">${pokemon.name}</h3><div class="pokemon-types">${typesHTML}</div>`;
        grid.appendChild(card);
    });
}

function calculateMatchups(pokemonTypes) {
    let multipliers = {};
    types.forEach(t => multipliers[t] = 1);

    pokemonTypes.forEach(pType => {
        const mods = typeModifiers[pType] || {};
        types.forEach(atkType => {
            if (mods[atkType] !== undefined) {
                multipliers[atkType] *= mods[atkType];
            }
        });
    });

    let weak = [];
    let resist = [];
    
    for (const [t, mult] of Object.entries(multipliers)) {
        if (mult > 1) weak.push(t);
        if (mult < 1) resist.push(t); // Pega 0.5x, 0.25x e 0x (imunidades)
    }
    return { weak, resist };
}

function openModal(pokemon) {
    const primaryType = pokemon.types[0].toLowerCase();
    const typesHTML = pokemon.types.map(t => `<span class="type-badge" style="background-color: var(--type-${t.toLowerCase()})">${t}</span>`).join('');
    const locationsHTML = pokemon.locations.map(loc => `<li>📍 ${loc}</li>`).join('');
    
    // Cálculo das Vantagens e Fraquezas
    const matchups = calculateMatchups(pokemon.types);
    const weakHTML = matchups.weak.map(t => `<span class="type-badge" style="background-color: var(--type-${t.toLowerCase()})">${t}</span>`).join('');
    const resistHTML = matchups.resist.map(t => `<span class="type-badge" style="background-color: var(--type-${t.toLowerCase()})">${t}</span>`).join('');

    const stats = pokemon.stats || { hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 };
    const statHTML = `<div class="stats-container">
        <div class="stat-row"><span class="stat-name">HP</span><span class="stat-val">${stats.hp}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.hp/255)*100}%; background: #FF5959;"></div></div></div>
        <div class="stat-row"><span class="stat-name">ATK</span><span class="stat-val">${stats.atk}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.atk/255)*100}%; background: #F5AC78;"></div></div></div>
        <div class="stat-row"><span class="stat-name">DEF</span><span class="stat-val">${stats.def}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.def/255)*100}%; background: #FAE078;"></div></div></div>
        <div class="stat-row"><span class="stat-name">SP.ATK</span><span class="stat-val">${stats.spatk}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.spatk/255)*100}%; background: #9DB7F5;"></div></div></div>
        <div class="stat-row"><span class="stat-name">SP.DEF</span><span class="stat-val">${stats.spdef}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.spdef/255)*100}%; background: #A7DB8D;"></div></div></div>
        <div class="stat-row"><span class="stat-name">SPD</span><span class="stat-val">${stats.spd}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.spd/255)*100}%; background: #FA92B2;"></div></div></div>
    </div>`;

    modalBody.innerHTML = `
        <div class="modal-header-bg" style="--modal-bg-color: var(--type-${primaryType})">
            <img src="${pokemon.image}" alt="${pokemon.name}">
        </div>
        <div class="modal-info">
            <p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')} - Gen ${pokemon.generation}</p>
            <h2>${pokemon.name}</h2>
            <div class="pokemon-types">${typesHTML}</div>
            
            <div class="info-grid">
                
                <div class="info-item">
                    <span class="info-label">⚔️ Fraquezas (Leva + Dano de:)</span>
                    <div class="pokemon-types" style="justify-content: flex-start; flex-wrap: wrap;">${weakHTML || '<span style="color:#aaa; font-size:0.8rem;">Nenhuma (Uau!)</span>'}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">🛡️ Resistências (Leva - Dano de:)</span>
                    <div class="pokemon-types" style="justify-content: flex-start; flex-wrap: wrap;">${resistHTML || '<span style="color:#aaa; font-size:0.8rem;">Nenhuma</span>'}</div>
                </div>

                <div class="info-item">
                    <span class="info-label">📊 Status Base</span>
                    ${statHTML}
                </div>

                <div class="info-item">
                    <span class="info-label">🗺️ Localizações & Radar</span>
                    <div class="radar-container">
                        <div class="radar-scanner"></div>
                        <span class="radar-text">Sinal de GPS... Procurando Respawns.</span>
                        </div>
                    <ul class="location-list">
                        ${locationsHTML || "<li>Nenhum respawn registrado</li>"}
                    </ul>
                </div>

            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}
