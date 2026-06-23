// ==========================================
// VARIÁVEIS GLOBAIS DE ESTADO E MAPA
// ==========================================
let pokemonData = [];
let currentVisibleList = []; // Guarda a lista que está sendo exibida na tela
let currentModalIndex = 0;   // Guarda a posição do Pokémon aberto no modal

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

// Configurações do Mapa
const cityMaps = {
    "kanto": { name: "Kanto", minZ: 0, maxZ: 9, defaultZ: 7, bounds: { minX: 529, minY: 635, maxX: 1367, maxY: 1801 } },
    "novocontinente": { name: "Novo Continente", minZ: 6, maxZ: 8, defaultZ: 7, bounds: { minX: 2344, minY: 1252, maxX: 3058, maxY: 1840 } }
};

let currentCity = "kanto"; 
let currentZ = cityMaps[currentCity].defaultZ;
let mapTransform = { scale: 1, x: 0, y: 0 };
let isDragging = false;
let startDragX = 0;
let startDragY = 0;

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    renderTypeButtons();
    setupToggles();
    initOakModal();
    initPanAndZoom(); 
    
    // Modo Escuro
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

    // Controle de Abas e Transição de Telas
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            
            const gridContainer = document.getElementById('pokedex-grid');
            const searchModule = document.getElementById('search-module-container');
            const filtersModule = document.getElementById('filters-container');
            const mapContainer = document.getElementById('map-viewer-container');
            const mapSidebar = document.getElementById('map-sidebar-menu');
            
            if (activeCategory === 'mapas') {
                gridContainer.style.display = 'none';
                searchModule.style.display = 'none';
                filtersModule.style.display = 'none';
                if(mapSidebar) mapSidebar.style.display = 'block'; 
                mapContainer.style.display = 'flex';
                initMapViewer(); 
            } else {
                gridContainer.style.display = 'grid';
                searchModule.style.display = 'block';
                filtersModule.style.display = 'block';
                if(mapSidebar) mapSidebar.style.display = 'none'; 
                mapContainer.style.display = 'none';
                applyFilters();
            }
        });
    });
});

// ==========================================
// FUNÇÕES DE DADOS E FILTROS
// ==========================================
async function fetchData() {
    try {
        const [normalRes, darkRes, bossRes] = await Promise.all([
            fetch('data_normal.json?v=' + new Date().getTime()),
            fetch('data_dark.json?v=' + new Date().getTime()),
            fetch('data_boss.json?v=' + new Date().getTime())
        ]);
        const normalData = await normalRes.json();
        const darkData = await darkRes.json();
        const bossData = await bossRes.json();
        pokemonData = [...normalData, ...darkData, ...bossData];
        currentVisibleList = [...pokemonData]; 
        renderPokemon(pokemonData);
    } catch (e) { 
        console.error("Erro ao carregar os bancos de dados.", e); 
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
        this.innerText = group.classList.contains('hidden-filter') ? '▼ STATUS DA POKEDEX' : '▲ ESCONDER STATUS';
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
    
    currentVisibleList = filtered;
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
    if (activeCatchFilter !== 'all') { applyFilters(); }
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

// ==========================================
// PAN (ARRASTAR) & ZOOM DO MAPA (COM CONTRA-ZOOM)
// ==========================================
function initPanAndZoom() {
    const wrapper = document.getElementById('map-wrapper');
    const content = document.getElementById('map-content');
    
    const applyTransform = () => {
        content.style.transform = `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`;
        wrapper.style.setProperty('--map-zoom', mapTransform.scale);
    };

    window.resetMapTransform = () => {
        mapTransform = { scale: 1, x: 0, y: 0 };
        applyTransform();
    };

    window.zoomMap = (direction) => {
        const zoomStep = 0.3; 
        const maxZoom = 4.0;  
        const minZoom = 0.5;  

        if (direction === 'in' && mapTransform.scale < maxZoom) mapTransform.scale += zoomStep;
        if (direction === 'out' && mapTransform.scale > minZoom) mapTransform.scale -= zoomStep;
        applyTransform();
    };

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault(); 
        if (e.deltaY < 0) zoomMap('in');   
        else zoomMap('out');               
    }, { passive: false });

    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startDragX = e.clientX - mapTransform.x;
        startDragY = e.clientY - mapTransform.y;
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        mapTransform.x = e.clientX - startDragX;
        mapTransform.y = e.clientY - startDragY;
        applyTransform();
    });

    wrapper.addEventListener('mouseup', () => isDragging = false);
    wrapper.addEventListener('mouseleave', () => isDragging = false);

    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { 
            isDragging = true;
            startDragX = e.touches[0].clientX - mapTransform.x;
            startDragY = e.touches[0].clientY - mapTransform.y;
        }
    });

    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault(); 
        mapTransform.x = e.touches[0].clientX - startDragX;
        mapTransform.y = e.touches[0].clientY - startDragY;
        applyTransform();
    }, { passive: false });

    wrapper.addEventListener('touchend', () => isDragging = false);
    wrapper.addEventListener('touchcancel', () => isDragging = false);

    document.getElementById('btn-zoom-in').addEventListener('click', () => zoomMap('in'));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoomMap('out'));
    document.getElementById('btn-zoom-reset').addEventListener('click', window.resetMapTransform);
}

// ==========================================
// LÓGICA DO GPS SETORIAL (MENU LATERAL)
// ==========================================
function initMapViewer() {
    const listContainer = document.getElementById('map-list-container');
    
    // Só gera os cards se a lista estiver vazia para não duplicar
    if (listContainer.innerHTML.trim() === '') {
        Object.keys(cityMaps).forEach(key => {
            const city = cityMaps[key];
            const card = document.createElement('div');
            card.className = `map-select-card ${currentCity === key ? 'active' : ''}`;
            card.dataset.city = key;
            
            // Puxa a miniatura personalizada
            const thumbSrc = `continentes/${key}-icone.png`;
            
            card.innerHTML = `
                <img src="${thumbSrc}" class="map-card-thumb" onerror="this.src='https://via.placeholder.com/55x55/111/32cd32?text=MAP'">
                <div class="map-card-info">
                    <span class="map-card-name">${city.name.toUpperCase()}</span>
                    <span class="map-card-desc">SINAL Z:${city.minZ}-${city.maxZ}</span>
                </div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.map-select-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                currentCity = key;
                currentZ = cityMaps[currentCity].defaultZ;
                updateMapDisplay();
            });
            
            listContainer.appendChild(card);
        });
    }
    
    updateMapDisplay();
}

function changeZ(direction) {
    const cityConfig = cityMaps[currentCity];
    let newZ = currentZ;

    if (direction === 'up') newZ = currentZ - 1; 
    else if (direction === 'down') newZ = currentZ + 1; 

    if (newZ >= cityConfig.minZ && newZ <= cityConfig.maxZ) {
        currentZ = newZ;
        updateMapDisplay();
    }
}

function updateMapDisplay() {
    const cityConfig = cityMaps[currentCity];
    const mapImage = document.getElementById('map-image');
    const statusText = document.getElementById('map-status-text');

    // Imagem do mapa principal
    mapImage.src = `continentes/${currentCity}-z${currentZ}.png`;
    mapImage.alt = `Mapa de ${cityConfig.name}`;
    statusText.textContent = `SINAL ESTABELECIDO: ${cityConfig.name.toUpperCase()}`;

    mapImage.onerror = () => {
        mapImage.src = ''; 
        mapImage.alt = 'SINAL PERDIDO';
        statusText.textContent = `⚠ ERRO DE SINAL (IMAGEM NÃO ENCONTRADA)`;
    };

    if(window.resetMapTransform) window.resetMapTransform();

    renderMapPins();
}

// ==========================================
// RENDERIZAÇÃO DE PINS DE POKÉMON NO MAPA
// ==========================================
function renderMapPins() {
    const container = document.getElementById('map-pins-container');
    if (!container) return; 
    
    container.innerHTML = ''; 
    const cityConfig = cityMaps[currentCity];

    if (!cityConfig.bounds) return;

    const { minX, maxX, minY, maxY } = cityConfig.bounds;
    let pinsData = {}; 
    let totalPinsEncontrados = 0;

    pokemonData.forEach(p => {
        if (!p.locations) return;
        
        p.locations.forEach(loc => {
            // 1. Cria uma lista com TODOS os textos possíveis para procurar coordenadas
            let stringsToCheck = [];
            
            if (typeof loc === 'string') {
                stringsToCheck.push(loc);
            } else if (typeof loc === 'object') {
                if (loc.local) stringsToCheck.push(loc.local);
                if (loc.rota) stringsToCheck.push(loc.rota);
                // Se tiver passos (rotas complexas), adiciona todos eles na busca!
                if (loc.passos && Array.isArray(loc.passos)) {
                    stringsToCheck = stringsToCheck.concat(loc.passos);
                }
            }

            // 2. Analisa cada texto encontrado
            stringsToCheck.forEach(locString => {
                // Regex flexível: Procura o número depois do X e o número depois do Y, ignorando o Z ou qualquer outra palavra no meio.
                let match = locString.match(/X\s*[:]?\s*(\d+)[^\d]*Y\s*[:]?\s*(\d+)/i);
                
                if (match) {
                    let x = parseInt(match[1]);
                    let y = parseInt(match[2]);

                    // Verifica se a coordenada está dentro dos "bounds" do mapa atual
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        let key = `${x},${y}`; 
                        
                        if (!pinsData[key]) pinsData[key] = [];
                        
                        // Evita duplicar o mesmo Pokémon exatamente no mesmo milímetro
                        if (!pinsData[key].find(poke => poke.id === p.id)) {
                            pinsData[key].push(p);
                            totalPinsEncontrados++;
                        }
                    }
                }
            });
        });
    });

    console.log(`[MAPA ${cityConfig.name.toUpperCase()}] Total de Pins válidos encontrados na área:`, totalPinsEncontrados);

    // 3. Renderiza os pins na tela
    for (let key in pinsData) {
        let [x, y] = key.split(',').map(Number);
        let pokemons = pinsData[key];

        let percentX = ((x - minX) / (maxX - minX)) * 100;
        let percentY = ((y - minY) / (maxY - minY)) * 100;

        let pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.style.left = `${percentX}%`;
        pin.style.top = `${percentY}%`;

        let tooltipHTML = pokemons.map(p => 
            `<img src="${p.image}" class="pin-poke-img" title="${p.name}" onclick="openModal('${p.id}')">`
        ).join('');
        
        pin.innerHTML = `<div class="pin-tooltip">${tooltipHTML}</div>`;

        container.appendChild(pin);
    }
}

// ==========================================
// UTILITÁRIOS E MODAL
// ==========================================
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

window.navigatePokemon = (direction, event) => {
    if(event) event.stopPropagation(); 
    if (currentVisibleList.length === 0) return;

    currentModalIndex += direction;
    if (currentModalIndex < 0) currentModalIndex = currentVisibleList.length - 1; 
    else if (currentModalIndex >= currentVisibleList.length) currentModalIndex = 0; 

    const targetPokemon = currentVisibleList[currentModalIndex];
    openModal(targetPokemon.id); 
};

window.openModal = (id) => {
    const p = pokemonData.find(x => x.id.toString() === id.toString());
    if(!p) return;
    
    currentModalIndex = currentVisibleList.findIndex(x => x.id.toString() === id.toString());

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
    const statsHTML = Object.entries(p.stats || {}).map(([name, val]) => `
        <div class="stat-row">
            <label>${name.toUpperCase()}</label>
            <div class="bar-container"><div class="bar-fill" style="width:${(val/255)*100}%"></div></div>
            <span class="stat-num">${val}</span>
        </div>
    `).join('');

    if (pCategory === 'boss') {
        rightWingHTML = `
            <div class="radar-module">
                <div class="radar-display" id="radar-screen">
                    <div class="radar-grid"></div><div class="radar-beam"></div>
                    <p id="radar-label">RASTREANDO...</p>
                </div>
            </div>
            
            <div class="boss-loot-module">
                <h4 class="label-tech">RECOMPENSA DIÁRIA</h4>
                <div class="loot-box">${p.loot || '???'}</div>
                
                <div class="boss-bonus-container">
                    <span class="bonus-badge shiny-bonus" title="Derrotar a versão Shiny garante o dobro de recompensas!" onclick="toggleShinyModal(this, '${p.name}', '${p.image}')">✨ SHINY: 2X LOOT</span>
                    <span class="bonus-badge fds-bonus" title="Aos sábados e domingos, o loot padrão é dobrado!">📅 FDS: 2X LOOT</span>
                </div>
            </div>

            <div class="boss-guide-module">
                <h4 class="label-tech">MANUAL DE COMBATE</h4>
                <p class="boss-guide-text">${p.guide || 'Nenhuma informação avançada detectada sobre este Boss.'}</p>
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
        let soulsHTML = '';
        if (p.souls) {
            const soulsNormal = p.souls.normal ? p.souls.normal : '???';
            const soulsEternizado = p.souls.eternizado ? p.souls.eternizado : '???';
            soulsHTML = `
                <div class="souls-module">
                    <h4 class="label-tech">CUSTO DE CONVERSÃO (SOULS)</h4>
                    <div class="souls-container">
                        <div class="soul-box"><span class="soul-label">NORMAL</span><span class="soul-value">${soulsNormal}</span></div>
                        <div class="soul-box eternizado"><span class="soul-label">ETERNIZADO</span><span class="soul-value">${soulsEternizado}</span></div>
                    </div>
                </div>
            `;
        } else {
            const textoExclusivo = p.exclusive ? p.exclusive : 'CAPTURA EXCLUSIVA / EVENTO';
            soulsHTML = `<div class="souls-module"><h4 class="label-tech">MÉTODO DE OBTENÇÃO</h4><span class="exclusive-badge">${textoExclusivo.toUpperCase()}</span></div>`;
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
                <div class="screen-border" style="position: relative;">
                    <button class="nav-arrow prev-arrow" title="Anterior" onclick="navigatePokemon(-1, event)">&#10094;</button>
                    <button class="nav-arrow next-arrow" title="Próximo" onclick="navigatePokemon(1, event)">&#10095;</button>
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

// ==========================================
// MENSAGENS INICIAIS DO PROFESSOR OAK
// ==========================================
const oakDialogues = [
    "Olá! Bem-vindo ao mundo de PokemonR - PBR!",
    "Esta Pokedex e uma pagina criada de fãs para fãs e NAO é um produto oficial do Servidor",
    "Um agradecimento super especial a comunidade pelo apoio continuo!",
    "Apoiadores: Jarubinha, Ricardobtj, Bonacina, Upzin, Paleguazv, Marlin, Leander Hastings, Vincent",
    "Desenvolvida por: Kalazatti.",
    "Use a barra de pesquisa ou os filtros para rastrear os POKeMON. Boa caca!"
];

let currentDialogIndex = 0;
let currentCharIndex = 0;
let isTyping = false;
let typingSpeed = 30;
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

// ==========================================
// MENSAGENS DO CRIADOR (KALAZATTI)
// ==========================================
const supportDialogues = [
    "E ai, Treinador! Beleza? Eu sou o Kalazatti.",
    "Desenvolvi essa Pokedex com muito carinho para ajudar a nossa comunidade do Poketibia PBR.",
    "Manter esse projeto no ar, sem propagandas chatas e com tudo atualizado, exige muito tempo e cafeina rsrs.",
    "Se essa ferramenta tem ajudado na sua jornada e voce quiser me pagar um cafezinho para manter a pokedex atualizada...",
    "E so clicar no botao abaixo! Qualquer ajuda e super bem-vinda e me motiva a trazer mais novidades e manter o projeto vivo.",
    "Muito obrigado e boa caçada! Qualquer dúvida ou idéia para a pokedex, é só me chamar!"
];

let currentSupportIndex = 0;
let currentSupportCharIndex = 0;
let isSupportTyping = false;
let supportTypeInterval;

window.initSupportModal = (event) => {
    if(event) event.preventDefault();
    const modal = document.getElementById('support-modal');
    const closeBtn = document.getElementById('close-support');
    const dialogBox = document.getElementById('support-dialog-box');
    const finalBtn = document.getElementById('final-support-btn');
    
    // Reseta os estados toda vez que abre
    currentSupportIndex = 0;
    finalBtn.classList.add('hidden');
    modal.classList.remove('hidden');
    
    startSupportTyping();

    closeBtn.onclick = () => { modal.classList.add('hidden'); };

    dialogBox.onclick = (e) => {
        // Impede que clicar no botão de doação avance o texto
        if(e.target.id === 'final-support-btn') return;

        const textContainer = document.getElementById('support-text');
        const arrow = document.getElementById('support-arrow');

        if (isSupportTyping) {
            // Pula a animação se clicar enquanto digita
            clearInterval(supportTypeInterval);
            textContainer.innerHTML = supportDialogues[currentSupportIndex];
            isSupportTyping = false;
            
            if (currentSupportIndex === supportDialogues.length - 1) {
                arrow.style.display = 'none';
                finalBtn.classList.remove('hidden');
            } else {
                arrow.style.display = 'block';
            }
        } else {
            // Avança para a próxima frase
            if (currentSupportIndex < supportDialogues.length - 1) {
                currentSupportIndex++;
                startSupportTyping();
            }
        }
    };
};

function startSupportTyping() {
    const textContainer = document.getElementById('support-text');
    const arrow = document.getElementById('support-arrow');
    const finalBtn = document.getElementById('final-support-btn');
    
    textContainer.innerHTML = '';
    currentSupportCharIndex = 0;
    isSupportTyping = true;
    arrow.style.display = 'none';
    finalBtn.classList.add('hidden');

    clearInterval(supportTypeInterval);
    supportTypeInterval = setInterval(() => {
        textContainer.innerHTML += supportDialogues[currentSupportIndex].charAt(currentSupportCharIndex);
        currentSupportCharIndex++;

        if (currentSupportCharIndex >= supportDialogues[currentSupportIndex].length) {
            clearInterval(supportTypeInterval);
            isSupportTyping = false;
            
            if (currentSupportIndex === supportDialogues.length - 1) {
                arrow.style.display = 'none';
                finalBtn.classList.remove('hidden');
            } else {
                arrow.style.display = 'block';
            }
        }
    }, typingSpeed);
}

// ==========================================
// ALTERNAR IMAGEM SHINY NO MODAL DO BOSS (BUSCA POR NOME)
// ==========================================
window.toggleShinyModal = async (badge, pokeName, normalImg) => {
    const imgEl = document.querySelector('.poke-img-stacked');
    const genBar = document.querySelector('.stacked-gen-bar');
    
    if (!imgEl) return;

    const isShiny = badge.classList.contains('active-shiny');
    
    if (isShiny) {
        // Volta ao estado normal instantaneamente
        imgEl.style.opacity = '0';
        setTimeout(() => {
            imgEl.src = normalImg;
            badge.classList.remove('active-shiny');
            badge.innerHTML = '✨ SHINY: 2X LOOT';
            if(genBar) {
                genBar.innerHTML = 'ALERTA DE BOSS';
                genBar.classList.remove('shiny-buff-bar');
            }
            imgEl.style.opacity = '1';
        }, 150);
        return;
    }

    // Se estiver carregando a versão Shiny
    badge.innerHTML = '⏳ BUSCANDO...';
    imgEl.style.opacity = '0.5'; // Deixa a imagem meio apagada enquanto baixa

    try {
        // Formata o nome para o padrão da PokeAPI (ex: "Mr. Mime" vira "mr-mime")
        let apiName = pokeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if(apiName === 'mrmime') apiName = 'mr-mime';

        // Pede para a PokeAPI os dados exatos deste Pokémon
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
        if (!response.ok) throw new Error("Pokémon não encontrado na API");
        
        const data = await response.json();
        
        // Pega a arte oficial Shiny. Se não tiver, pega o sprite de GameBoy como plano B
        const shinyUrl = data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny;
        
        if (!shinyUrl) throw new Error("Imagem Shiny não existe");

        // Aplica a imagem com transição
        imgEl.style.opacity = '0';
        setTimeout(() => {
            imgEl.src = shinyUrl;
            badge.classList.add('active-shiny');
            badge.innerHTML = '✨ VER NORMAL';
            
            if(genBar) {
                genBar.innerHTML = '✨ BOSS SHINY (+STATUS) ✨';
                genBar.classList.add('shiny-buff-bar');
            }
            imgEl.style.opacity = '1';
        }, 150);

    } catch (error) {
        // Se der qualquer erro de nome ou a internet falhar, ele avisa bonitinho e não quebra a tela
        console.error("Erro ao buscar Shiny:", error);
        badge.innerHTML = '⚠ SHINY INDISPONÍVEL';
        imgEl.style.opacity = '1';
    }
};

// ==========================================
// SISTEMA DE REPORT DE BUGS (DISCORD WEBHOOK)
// ==========================================
window.initReportModal = (event) => {
    if(event) event.preventDefault();
    document.getElementById('report-modal').classList.remove('hidden');
    document.getElementById('report-status').innerText = '';
};

document.getElementById('close-report').onclick = () => {
    document.getElementById('report-modal').classList.add('hidden');
};

document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submit-report-btn');
    const status = document.getElementById('report-status');
    const nick = document.getElementById('report-nick').value.trim();
    const type = document.getElementById('report-type').value;
    const msg = document.getElementById('report-msg').value.trim();

    // Verificação de Cooldown (Trava de 10 minutos)
    const lastReport = localStorage.getItem('pokedex-last-report');
    if (lastReport) {
        const now = new Date().getTime();
        const diff = now - parseInt(lastReport);
        if (diff < 10 * 60 * 1000) { 
            const faltam = Math.ceil((10 * 60 * 1000 - diff) / 60000);
            status.innerText = `⏳ Aguarde ${faltam} min para enviar outro report.`;
            status.style.color = '#ffcb05';
            return;
        }
    }

    btn.innerText = 'ENVIANDO...';
    btn.disabled = true;

    // COLOQUE O LINK DO SEU WEBHOOK EXATAMENTE AQUI DENTRO DAS ASPAS
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1519072852513525831/grsC32dPzfIsb7g19z2lGykbyrejCLHL7yjaS4Sop5HsHnhwj3S6L1gZjloY4dhnpLW9';

    // Construção do Card (Embed) para o Discord
    const payload = {
        username: "Pokedex PBR - Report",
        avatar_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
        embeds: [{
            title: `🚨 NOVO RELATÓRIO: ${type}`,
            color: type === 'BUG' ? 16711680 : (type === 'LOCAL' ? 16766720 : 3447003),
            fields: [
                { name: "👤 Nick no Jogo", value: nick, inline: true },
                { name: "🏷️ Categoria", value: type, inline: true },
                { name: "📝 Mensagem do Usuário", value: msg }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            status.innerText = '✅ Relatório enviado com sucesso! Obrigado.';
            status.style.color = '#32cd32';
            document.getElementById('report-form').reset();
            localStorage.setItem('pokedex-last-report', new Date().getTime().toString());
        } else {
            throw new Error('Falha no envio da API');
        }
    } catch(err) {
        status.innerText = '❌ Erro de conexão com o servidor.';
        status.style.color = '#ff4b2b';
        console.error("Erro Discord:", err);
    }

    btn.innerText = 'ENVIAR RELATÓRIO';
    btn.disabled = false;
});
