let pokemonData = [];
let activeTypeFilter = 'all';

const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

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
        grid.innerHTML = '<p style="color:red; width:100%; text-align:center;">Erro ao carregar os dados. Verifique se você gerou o arquivo data.json corretamente.</p>';
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
    
    if(pokemonArray.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: white;">Nenhum Pokémon encontrado.</p>';
        return;
    }
    
    pokemonArray.forEach(pokemon => {
        const primaryType = pokemon.types[0].toLowerCase();
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.style.setProperty('--bg-color', `var(--type-${primaryType})`);
        
        card.addEventListener('click', () => openModal(pokemon));

        const typesHTML = pokemon.types.map(t => 
            `<span class="type-badge" style="background-color: var(--type-${t.toLowerCase()})">${t}</span>`
        ).join('');
        
        card.innerHTML = `
            <p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</p>
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h3 class="pokemon-name">${pokemon.name}</h3>
            <div class="pokemon-types">${typesHTML}</div>
        `;
        
        grid.appendChild(card);
    });
}

function openModal(pokemon) {
    const primaryType = pokemon.types[0].toLowerCase();
    
    const typesHTML = pokemon.types.map(t => 
        `<span class="type-badge" style="background-color: var(--type-${t.toLowerCase()})">${t}</span>`
    ).join('');
    
    const locationsHTML = pokemon.locations.map(loc => {
        if(loc.trim() === "") return "";
        return `<li>📍 ${loc}</li>`;
    }).join('');

    const stats = pokemon.stats || { hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 };
    
    const statHTML = `
        <div class="stats-container">
            <div class="stat-row"><span class="stat-name">HP</span><span class="stat-val">${stats.hp}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.hp/255)*100}%; background: #FF5959;"></div></div></div>
            <div class="stat-row"><span class="stat-name">ATK</span><span class="stat-val">${stats.atk}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.atk/255)*100}%; background: #F5AC78;"></div></div></div>
            <div class="stat-row"><span class="stat-name">DEF</span><span class="stat-val">${stats.def}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.def/255)*100}%; background: #FAE078;"></div></div></div>
            <div class="stat-row"><span class="stat-name">SP.ATK</span><span class="stat-val">${stats.spatk}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.spatk/255)*100}%; background: #9DB7F5;"></div></div></div>
            <div class="stat-row"><span class="stat-name">SP.DEF</span><span class="stat-val">${stats.spdef}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.spdef/255)*100}%; background: #A7DB8D;"></div></div></div>
            <div class="stat-row"><span class="stat-name">SPD</span><span class="stat-val">${stats.spd}</span><div class="stat-bar"><div class="stat-fill" style="width: ${(stats.spd/255)*100}%; background: #FA92B2;"></div></div></div>
        </div>
    `;

    modalBody.innerHTML = `
        <div class="modal-header-bg" style="--modal-bg-color: var(--type-${primaryType})">
            <img src="${pokemon.image}" alt="${pokemon.name}">
        </div>
        <div class="modal-info">
            <p class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</p>
            <h2>${pokemon.name}</h2>
            <div class="pokemon-types">${typesHTML}</div>
            
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Geração</span>
                    <span class="info-value">Gen ${pokemon.generation}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🗺️ Localizações / Respawns</span>
                    <ul class="location-list">
                        ${locationsHTML || "<li>Nenhuma localização registrada</li>"}
                    </ul>
                </div>
                <div class="info-item">
                    <span class="info-label">📊 Status Base</span>
                    ${statHTML}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}