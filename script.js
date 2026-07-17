// ==========================================
// VARIÁVEIS GLOBAIS DE ESTADO E MAPA
// ==========================================
let pokemonData = [];
let itemData = [];
let guiasData = [];
let currentVisibleList = []; // Guarda a lista que está sendo exibida na tela
let currentModalIndex = 0;   // Guarda a posição do Pokémon aberto no modal
let currentModalItemIndex = 0; // Guarda a posição do Item aberto no modal

let activeTypeFilter = 'all';
let activeGenFilter = 'all';
let activeCatchFilter = 'all';
let activeCategory = 'normal'; // Controla a aba atual
let activeMetaFilter = 'all';  // Filtro Meta-Gaming
let searchMode = 'pokemon'; // Controla se estamos buscando por nome ou por loot

let caughtPokemon = JSON.parse(localStorage.getItem('pokedex-caught')) || [];
caughtPokemon = caughtPokemon.map(String); // MÁGICA 1: Força todos os saves antigos a virarem texto!

let caughtTMs = JSON.parse(localStorage.getItem('pokedex-tms')) || [];
let isEditingTMs = false; // Controla se estamos no "modo álbum"
let currentTmFilter = 'all'; // Filtro do Dashboard

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

// ==========================================
// DICIONÁRIO DE TIPAGEM DOS TMS (LOOT VISUAL)
// ==========================================
const tmDictionary = {
    "solar beam": "grass", "frenzy plant": "grass", "seed bomb": "grass", "power whip": "grass", "magical leaf": "grass", "petal blizzard": "grass", "grassy terrain": "grass",
    "flamethrower": "fire", "fire blast": "fire", "mystical fire": "fire", "fire punch": "fire", "flame burst": "fire", "fire spin": "fire", "overheat": "fire", "blast burn": "fire",
    "water gun": "water", "hydro pump": "water", "hydro cannon": "water", "surf": "water", "water pulse": "water", "bubble beam": "water", "waterfall": "water", "razor shell": "water", "rain dance": "water", "aqua ring": "water",
    "thunder wave": "electric", "zap cannon": "electric", "charge beam": "electric", "thunder punch": "electric", "thunder": "electric", "thunder fang": "electric",
    "ice beam": "ice", "frost breath": "ice", "blizzard": "ice", "ice punch": "ice",
    "poison jab": "poison", "gunk shot": "poison", "toxic": "poison", "sludge bomb": "poison", "venoshock": "poison", "cross poison": "poison",
    "mud slap": "ground", "sand tomb": "ground", "earth power": "ground", "bulldoze": "ground", "earthquake": "ground",
    "roost": "flying", "whirlwind": "flying", "pluck": "flying", "air slash": "flying", "air cutter": "flying",
    "psychic": "psychic", "amnesia": "psychic", "teleport": "psychic", "reflect": "psychic", "calm mind": "psychic", "dream eater": "psychic", "psybeam": "psychic", "rest": "psychic", "future sight": "psychic", "zen headbutt": "psychic",
    "bug buzz": "bug", "fury cutter": "bug", "leech life": "bug", "infestation": "bug", "bug bite": "bug",
    "sandstorm": "rock", "power gem": "rock", "stone edge": "rock", "rock slide": "rock", "rock tomb": "rock",
    "shadow claw": "ghost", "night shade": "ghost", "confuse ray": "ghost",
    "draco meteor": "dragon", "dragon tail": "dragon", "dragon dance": "dragon",
    "dark pulse": "dark",
    "metal claw": "steel", "metal sound": "steel", "flash cannon": "steel", "iron defense": "steel", "iron tail": "steel", "gyro ball": "steel",
    "focus blast": "fighting", "drain punch": "fighting", "dynamic punch": "fighting", "brick break": "fighting", "wake-up slap": "fighting", "low sweep": "fighting", "power-up punch": "fighting", "focus punch": "fighting", "aura sphere": "fighting",
    "skull bash": "normal", "swift": "normal", "body slam": "normal", "horn drill": "normal", "metronome": "normal", "roar": "normal", "tri-attack": "normal", "pay day": "normal", "screech": "normal", "rage": "normal", "take down": "normal", "protect": "normal", "mega kick": "normal", "mega punch": "normal", "mimic": "normal", "encore": "normal", "double-edge": "normal", "headbutt": "normal", "hyper beam": "normal", "echoed voice": "normal", "hidden power": "normal"
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
    initVipSystem(); // Inicializa Letreiro e Modal VIP
    
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

    document.querySelectorAll('#meta-filters .filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#meta-filters .filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeMetaFilter = pill.dataset.meta;
            applyFilters();
        });
    });

    // Controle de Abas e Transição de Telas
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return; // Previne loops

            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            
            const gridContainer = document.getElementById('pokedex-grid');
            const searchModule = document.getElementById('search-module-container');
            const filtersModule = document.getElementById('filters-container');
            const mapContainer = document.getElementById('map-viewer-container');
            const mapSidebar = document.getElementById('map-sidebar-menu');
            const tutModule = document.getElementById('tutorials-module');
            
            // MÁGICA DE SINCRONIA: Abas DROPS/TMS <-> Pílula LOOT
            const optPokemon = document.getElementById('mode-pokemon');
            const optLoot = document.getElementById('mode-loot');
            
            if (activeCategory === 'drops' || activeCategory === 'tms') {
                searchMode = 'loot';
                if (optPokemon && optLoot) { optPokemon.classList.remove('active'); optLoot.classList.add('active'); }
            } else if (activeCategory === 'normal' || activeCategory === 'dark' || activeCategory === 'boss') {
                searchMode = 'pokemon';
                if (optPokemon && optLoot) { optLoot.classList.remove('active'); optPokemon.classList.add('active'); }
            }

            if (activeCategory === 'mapas') {
                gridContainer.style.display = 'none'; searchModule.style.display = 'none'; filtersModule.style.display = 'none';
                if(tutModule) tutModule.style.display = 'none'; if(mapSidebar) mapSidebar.style.display = 'block'; 
                mapContainer.style.display = 'flex'; initMapViewer(); 
            } else if (activeCategory === 'guias') {
                gridContainer.style.display = 'none'; searchModule.style.display = 'none'; filtersModule.style.display = 'none';
                mapContainer.style.display = 'none'; if(mapSidebar) mapSidebar.style.display = 'none'; 
                if(tutModule) { tutModule.style.display = 'block'; closeTutorial(); }
            } else if (activeCategory === 'drops' || activeCategory === 'tms') {
                gridContainer.style.display = 'grid'; searchModule.style.display = 'block';
                filtersModule.style.display = 'none';
                if(mapSidebar) mapSidebar.style.display = 'none'; mapContainer.style.display = 'none'; if(tutModule) tutModule.style.display = 'none';
                
                // MÁGICA DO ÁLBUM: Mostra o Dashboard só nos TMs
                const tmDash = document.getElementById('tm-dashboard');
                if (activeCategory === 'tms') {
                    if(tmDash) tmDash.style.display = 'flex';
                    if(window.updateTMProgress) window.updateTMProgress();
                } else {
                    if(tmDash) tmDash.style.display = 'none';
                    if(isEditingTMs && window.toggleTMEditMode) window.toggleTMEditMode();
                }
                
                applyFilters(); 
            } else {
                gridContainer.style.display = 'grid'; searchModule.style.display = 'block'; filtersModule.style.display = 'block';
                if(mapSidebar) mapSidebar.style.display = 'none'; mapContainer.style.display = 'none'; if(tutModule) tutModule.style.display = 'none';
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
        const [normalRes, darkRes, bossRes, itemRes, guiasRes] = await Promise.all([
            fetch('data_normal.json?v=' + new Date().getTime()),
            fetch('data_dark.json?v=' + new Date().getTime()),
            fetch('data_boss.json?v=' + new Date().getTime()),
            fetch('data_items.json?v=' + new Date().getTime()).catch(() => null),
            fetch('data_guias.json?v=' + new Date().getTime()).catch(() => null)
        ]);
        
        const normalData = await normalRes.json();
        const darkData = await darkRes.json();
        const bossData = await bossRes.json();
        pokemonData = [...normalData, ...darkData, ...bossData];
        currentVisibleList = [...pokemonData]; 
        
        if(itemRes && itemRes.ok) itemData = await itemRes.json();
        
        if(guiasRes && guiasRes.ok) {
            guiasData = await guiasRes.json();
            renderGuias(guiasData);
        }
        
        renderPokemon(pokemonData);
    } catch (e) { 
        console.error("Erro ao carregar os bancos de dados.", e); 
    }
}

// NOVA FUNÇÃO: DESENHAR OS GUIAS (WIKI)
function renderGuias(guias) {
    const grid = document.getElementById('tutorials-grid');
    const articleContainer = document.getElementById('tutorial-articles-container');

    if (!grid || !articleContainer) return;

    // Renderiza os cartões (Grid inicial)
    grid.innerHTML = guias.map(g => `
        <div class="tut-card" onclick="openTutorial('${g.id}')">
            <img src="${g.thumb}" alt="${g.title}" class="tut-thumb" onerror="this.src='https://dummyimage.com/200x110/3498db/fff.png&text=Guia'">
            <h3 class="tut-title">${g.title}</h3>
            <p class="tut-desc">${g.desc}</p>
        </div>
    `).join('');

    // Renderiza o corpo dos artigos completos de forma oculta
    articleContainer.innerHTML = guias.map(g => `
        <div class="article-content-block" id="article-${g.id}" style="display: none;">
            ${g.content.join('\n')}
        </div>
    `).join('');
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
    // Botão Mestre de Otimização Mobile
    const toggleAll = document.getElementById('toggle-all-filters');
    if (toggleAll) {
        toggleAll.onclick = function() {
            const wrapper = document.getElementById('all-filters-wrapper');
            wrapper.classList.toggle('hidden-filter');
            this.innerText = wrapper.classList.contains('hidden-filter') 
                ? '⚙️ MOSTRAR FILTROS AVANÇADOS' 
                : '⚙️ ESCONDER FILTROS';
        };
    }

    const toggleGen = document.getElementById('toggle-gen');
    if (toggleGen) {
        toggleGen.onclick = function() {
            const group = document.getElementById('group-gen');
            group.classList.toggle('hidden-filter');
            this.innerText = group.classList.contains('hidden-filter') ? '▼ FILTRAR POR REGIÃO' : '▲ ESCONDER REGIÕES';
        };
    }

    const toggleType = document.getElementById('toggle-type');
    if (toggleType) {
        toggleType.onclick = function() {
            const group = document.getElementById('group-type');
            group.classList.toggle('hidden-filter');
            this.innerText = group.classList.contains('hidden-filter') ? '▼ FILTRAR POR TIPO' : '▲ ESCONDER TIPOS';
        };
    }

    const toggleCatch = document.getElementById('toggle-catch');
    if (toggleCatch) {
        toggleCatch.onclick = function() {
            const group = document.getElementById('group-catch');
            group.classList.toggle('hidden-filter');
            this.innerText = group.classList.contains('hidden-filter') ? '▼ STATUS DA POKEDEX' : '▲ ESCONDER STATUS';
        };
    }

    const toggleMeta = document.getElementById('toggle-meta');
    if (toggleMeta) {
        toggleMeta.onclick = function() {
            const group = document.getElementById('group-meta');
            if (group) {
                group.classList.toggle('hidden-filter');
                this.innerText = group.classList.contains('hidden-filter') ? '▼ FILTROS META-GAMING' : '▲ ESCONDER META-GAMING';
            }
        };
    }
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    
    // INTERCEPTADOR: MODO ITENS/LOOT
    if (activeCategory === 'drops' || activeCategory === 'tms' || searchMode === 'loot') {
        let filteredItems = itemData || [];
        
        // Separa os TMs do resto dos drops
        if (activeCategory === 'tms') {
            filteredItems = filteredItems.filter(i => i.name.toUpperCase().startsWith("TM "));
        } else if (activeCategory === 'drops') {
            filteredItems = filteredItems.filter(i => !i.name.toUpperCase().startsWith("TM "));
        }

        if (search !== '') {
            filteredItems = filteredItems.filter(i => i.name.toLowerCase().includes(search));
        }
        
        renderItems(filteredItems);
        return; // Interrompe a função aqui para não renderizar Pokémons!
    }

    let filtered = pokemonData.filter(p => {
        // ... (continua igual o resto da sua função applyFilters)
        const pCat = p.category || 'normal';
        if (pCat !== activeCategory) return false;

        // NOVO: SISTEMA DE BUSCA DUPLA (NOME vs LOOT)
        let mSearch = false;
        if (search === '') {
            mSearch = true;
        } else if (searchMode === 'pokemon') {
            mSearch = p.name.toLowerCase().includes(search) || p.id.toString() === search;
        } else if (searchMode === 'loot') {
            if (p.loot) {
                // NOVA LÓGICA: Verifica se é Array. Se sim, busca nos itens. Se não, busca como texto normal.
                mSearch = Array.isArray(p.loot) 
                    ? p.loot.some(item => item.toLowerCase().includes(search)) 
                    : p.loot.toLowerCase().includes(search);
            }
        }

        const mGen = activeGenFilter === 'all' || (p.generation && p.generation.toString().toLowerCase() === activeGenFilter.toLowerCase());
        const mType = activeTypeFilter === 'all' || p.types.includes(activeTypeFilter);
        
        const isCaught = caughtPokemon.includes(p.id.toString()); // MÁGICA 2
        let mCatch = true;
        if (activeCatchFilter === 'caught') mCatch = isCaught;
        if (activeCatchFilter === 'uncaught') mCatch = !isCaught;

        let mMeta = true; 

        return mSearch && mGen && mType && mCatch && mMeta;
    });
    
    // NOVO: SISTEMA DE ORDENAÇÃO DE STATUS (DO MAIOR PARA O MENOR)
    if (activeMetaFilter !== 'all') {
        filtered.sort((a, b) => {
            const sA = a.stats || {};
            const sB = b.stats || {};
            
            if (activeMetaFilter === 'atk') return (sB.atk || 0) - (sA.atk || 0);
            if (activeMetaFilter === 'spatk') return (sB.spatk || 0) - (sA.spatk || 0);
            if (activeMetaFilter === 'speed') return (sB.spd || 0) - (sA.spd || 0); // Nota: No JSON a velocidade está salva como "spd"
            if (activeMetaFilter === 'tank') {
                // Cálculo de Tank considerando a soma das defesas física e especial
                const totalTankA = (sA.def || 0) + (sA.spdef || 0);
                const totalTankB = (sB.def || 0) + (sB.spdef || 0);
                return totalTankB - totalTankA;
            }
            return 0;
        });
    }
    
    currentVisibleList = filtered;
    
    // DECISÃO DE RENDERIZAÇÃO: POKÉMON VS INVENTÁRIO
    if (searchMode === 'loot' && itemData.length > 0) {
        // Se estiver no modo Loot, filtramos o banco de Itens pelo nome
        let filteredItems = itemData;
        if (search !== '') {
            filteredItems = itemData.filter(i => i.name.toLowerCase().includes(search));
        }
        renderItems(filteredItems);
    } else {
        renderPokemon(filtered);
    }
}

// NOVA FUNÇÃO: DESENHAR A GRADE DE ITENS E APLICAR FILTROS DO ÁLBUM
function renderItems(list) {
    const grid = document.getElementById('pokedex-grid');
    
    // Filtro do Álbum de TMs
    let displayList = list;
    if (activeCategory === 'tms') {
        if (currentTmFilter === 'owned') displayList = list.filter(i => caughtTMs.includes(i.name));
        if (currentTmFilter === 'missing') displayList = list.filter(i => !caughtTMs.includes(i.name));
    }

    grid.innerHTML = displayList.map(item => {
        const isTM = item.name.toUpperCase().startsWith("TM ");
        const isOwned = isTM && caughtTMs.includes(item.name);
        const ownedClass = isOwned ? 'tm-owned' : '';

        return `
            <div class="item-card ${ownedClass}" onclick="handleItemClick('${item.name}', event, ${isTM})">
                <img src="img/loots/${item.icon_name}.gif" alt="${item.name}" onerror="this.onerror=null; this.src='img/loots/${item.icon_name}.png'; this.onerror=function(){this.src='https://dummyimage.com/24x24/dcdde1/2c3e50.png&text=?';};">
                <span class="item-card-name">${item.name}</span>
                <span class="item-card-count">${item.droppedBy.length} DROP(S)</span>
            </div>
        `;
    }).join('');
}

// LÓGICA DO ÁLBUM DE TMs
window.handleItemClick = (itemName, event, isTM) => {
    if (event) event.stopPropagation();
    
    if (isEditingTMs && isTM) {
        const idx = caughtTMs.indexOf(itemName);
        if (idx > -1) { caughtTMs.splice(idx, 1); } 
        else { caughtTMs.push(itemName); }
        
        localStorage.setItem('pokedex-tms', JSON.stringify(caughtTMs));
        event.currentTarget.classList.toggle('tm-owned');
        updateTMProgress();
    } else {
        openItemModal(itemName);
    }
};

window.toggleTMEditMode = () => {
    const grid = document.getElementById('pokedex-grid');
    const btn = document.getElementById('edit-tm-btn');
    const flash = document.getElementById('screen-flash');
    
    isEditingTMs = !isEditingTMs;
    
    if(flash) {
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 150);
    }

    if (isEditingTMs) {
        grid.classList.add('tm-edit-mode');
        btn.innerHTML = '💾 SALVAR';
        btn.classList.add('editing');
    } else {
        grid.classList.remove('tm-edit-mode');
        btn.innerHTML = '✏️ EDITAR';
        btn.classList.remove('editing');
        applyFilters(); 
    }
};

// LÓGICA DO MENU FLUTUANTE (DROPDOWN) DE FILTRO
window.toggleTMFilterMenu = (event) => {
    if(event) event.stopPropagation();
    const dropdown = document.getElementById('tm-filter-dropdown');
    if(dropdown) dropdown.classList.toggle('hidden');
};

window.selectTMFilter = (type, label, itemElement) => {
    currentTmFilter = type;
    
    // Atualiza o texto do botão principal com o que foi escolhido
    const btn = document.getElementById('tm-filter-btn');
    if(btn) btn.innerHTML = `🎛️ FILTRO: ${label} ▼`;
    
    // Atualiza a marcação azul de quem foi clicado na lista
    document.querySelectorAll('.tm-drop-item').forEach(el => el.classList.remove('active'));
    if(itemElement) itemElement.classList.add('active');
    
    // Esconde o menuzinho
    const dropdown = document.getElementById('tm-filter-dropdown');
    if(dropdown) dropdown.classList.add('hidden');
    
    applyFilters();
};

// Esconde o submenu de filtros se o cara clicar em qualquer outro lugar da tela
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('tm-filter-dropdown');
    const filterBtn = document.getElementById('tm-filter-btn');
    if (dropdown && !dropdown.classList.contains('hidden') && event.target !== filterBtn) {
        dropdown.classList.add('hidden');
    }
});

window.updateTMProgress = () => {
    const totalTMs = itemData.filter(i => i.name.toUpperCase().startsWith("TM ")).length;
    if(totalTMs === 0) return;
    const pct = (caughtTMs.length / totalTMs) * 100;
    const bar = document.getElementById('tm-progress-fill');
    if(bar) bar.style.width = pct + '%';
};

window.requestReset = () => { document.getElementById('reset-confirm-modal').classList.remove('hidden'); };

window.resetTMCollection = () => {
    caughtTMs = [];
    localStorage.removeItem('pokedex-tms');
    document.getElementById('reset-confirm-modal').classList.add('hidden');
    if(isEditingTMs) toggleTMEditMode();
    applyFilters();
    updateTMProgress();
};

window.toggleCatch = (event, id) => {
    event.stopPropagation();
    const safeId = id.toString(); // MÁGICA 3: Converte o clique para texto
    const idx = caughtPokemon.indexOf(safeId);
    
    if(idx > -1) {
        caughtPokemon.splice(idx, 1);
        event.target.classList.remove('caught');
    } else {
        caughtPokemon.push(safeId);
        event.target.classList.add('caught');
    }
    localStorage.setItem('pokedex-caught', JSON.stringify(caughtPokemon));
    if (activeCatchFilter !== 'all') { applyFilters(); }
};

function renderPokemon(list) {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = list.map(p => {
        const isCaught = caughtPokemon.includes(p.id.toString()); // MÁGICA 4
        const pCategory = p.category || 'normal';
        
        let genText = '';
        if (pCategory === 'boss') genText = 'BOSS 24H';
        else if (pCategory === 'dark') genText = 'DARK';
        else if (isNaN(p.generation)) genText = p.generation.toUpperCase(); 
        else genText = 'GEN ' + p.generation;

        return `
            <div class="pk-card" onclick="openModal('${p.id}')">
                <div class="pk-card-inner">
                    <span class="pk-id">#${p.id.toString().split('-')[0].padStart(3, '0')}</span>
                    <div class="catch-btn ${isCaught ? 'caught' : ''}" onclick="toggleCatch(event, '${p.id}')" title="Marcar como Capturado"></div>
                    <img src="${p.image}" loading="lazy">
                    <h3 class="pk-name">${p.name}</h3>
                    <div class="pk-gen-bar">${genText}</div>
                    <div class="pk-types-mini">
                        ${p.types.map(t => `<span class="type-dot" style="background:var(--type-${t.toLowerCase()})"></span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// PAN (ARRASTAR) & ZOOM DO MAPA
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
        e.preventDefault(); 
        isDragging = true;
        startDragX = e.clientX - mapTransform.x;
        startDragY = e.clientY - mapTransform.y;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        mapTransform.x = e.clientX - startDragX;
        mapTransform.y = e.clientY - startDragY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => isDragging = false);

    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { 
            isDragging = true;
            startDragX = e.touches[0].clientX - mapTransform.x;
            startDragY = e.touches[0].clientY - mapTransform.y;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        mapTransform.x = e.touches[0].clientX - startDragX;
        mapTransform.y = e.touches[0].clientY - startDragY;
        applyTransform();
    }, { passive: false });

    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchcancel', () => isDragging = false);

    document.getElementById('btn-zoom-in').addEventListener('click', () => zoomMap('in'));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoomMap('out'));
    document.getElementById('btn-zoom-reset').addEventListener('click', window.resetMapTransform);
}

// ==========================================
// LÓGICA DO GPS SETORIAL (MENU LATERAL)
// ==========================================
function initMapViewer() {
    const listContainer = document.getElementById('map-list-container');
    
    if (listContainer.innerHTML.trim() === '') {
        Object.keys(cityMaps).forEach(key => {
            const city = cityMaps[key];
            const card = document.createElement('div');
            card.className = `map-select-card ${currentCity === key ? 'active' : ''}`;
            card.dataset.city = key;
            
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
            let stringsToCheck = [];
            
            if (typeof loc === 'string') {
                stringsToCheck.push(loc);
            } else if (typeof loc === 'object') {
                if (loc.local) stringsToCheck.push(loc.local);
                if (loc.rota) stringsToCheck.push(loc.rota);
                if (loc.passos && Array.isArray(loc.passos)) {
                    stringsToCheck = stringsToCheck.concat(loc.passos);
                }
            }

            stringsToCheck.forEach(locString => {
                let match = locString.match(/X\s*[:]?\s*(\d+)[^\d]*Y\s*[:]?\s*(\d+)/i);
                if (match) {
                    let x = parseInt(match[1]);
                    let y = parseInt(match[2]);

                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        let key = `${x},${y}`; 
                        if (!pinsData[key]) pinsData[key] = [];
                        if (!pinsData[key].find(poke => poke.id === p.id)) {
                            pinsData[key].push(p);
                            totalPinsEncontrados++;
                        }
                    }
                }
            });
        });
    });

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
window.toggleAccordion = (buttonEl, event, passosEscapados) => {
    if(event) event.stopPropagation();
    
    // 1. Encontra os containers corretos
    const accordion = buttonEl.closest('.loc-accordion');
    const container = accordion.querySelector('.loc-steps-container');
    
    // 2. Encontra APENAS o elemento da setinha dentro do botão
    const arrowIcon = buttonEl.querySelector('.expand-arrow'); 
    
    // 3. Abre ou fecha a sanfona
    container.classList.toggle('hidden-steps');

    // 4. Muda apenas o texto da setinha, sem apagar o nome da rota!
    if (arrowIcon) {
        arrowIcon.innerText = container.classList.contains('hidden-steps') ? '▼' : '▲';
    }

    // 5. Lógica de desenhar no mapa (mantida igual à sua)
    if (!container.classList.contains('hidden-steps') && passosEscapados) {
        document.querySelector('.cat-btn[data-cat="mapas"]').click();
        const arrayPassos = JSON.parse(decodeURIComponent(passosEscapados));
        if(window.drawRouteOnMap) window.drawRouteOnMap(arrayPassos);
    }
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

// ==========================================
// ABRIR MODAL DO POKÉMON (COM FORMAS REGIONAIS)
// ==========================================
window.openModal = (id) => {
    const p = pokemonData.find(x => x.id.toString() === id.toString());
    if(!p) return;
    
    currentModalIndex = currentVisibleList.findIndex(x => x.id.toString() === id.toString());

    const matchups = calculateMatchups(p.types);
    const pCategory = p.category || 'normal';
    
    let baseId = p.id.toString();
    if (/^\d+-/.test(baseId)) baseId = baseId.split('-')[0]; 

    const relatives = pokemonData.filter(x => {
        const xId = x.id.toString();
        return xId === baseId || xId.startsWith(baseId + '-');
    });
    
    const otherForms = relatives.filter(x => x.id.toString() !== p.id.toString());
    
    let formButtonsHTML = '';
    if(otherForms.length > 0) {
        formButtonsHTML = `<div class="form-btn-container">` + 
            otherForms.map(f => {
                let formName = f.id.toString().includes('-') ? f.id.toString().split('-')[1].toUpperCase() : 'NORMAL';
                let icon = formName === 'ALOLA' ? '🌴' : (formName === 'GALAR' ? '⚔️' : (formName === 'HISUI' ? '🏔️' : '✨'));
                if (formName === 'NORMAL') icon = '🌍';
                return `<button class="form-toggle-btn" onclick="switchForm('${f.id}')">${icon} ${formName}</button>`;
            }).join('') + 
        `</div>`;
    }
    
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
                const encodedPassos = encodeURIComponent(JSON.stringify(loc.passos));
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
                        <div class="loc-button accordion-toggle" onclick="toggleAccordion(this, event, '${encodedPassos}')">
                            <span class="loc-text">${locName}</span>
                            <div class="loc-actions">
                                ${noteHTML}
                                <span class="loc-icon copy-icon" title="Copiar Local" onclick="copyLoc('${locName}', this, event)">📋</span>
                                <span class="loc-icon expand-arrow" title="Ver Rota no Mapa">▼</span>
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

    const statColors = {
        hp: '#32cd32', atk: '#e3350d', def: '#ff9800',
        spatk: '#3498db', spdef: '#9c27b0', spd: '#f1c40f'
    };

    const baseAtk = p.stats?.atk || 0;
    const baseSpAtk = p.stats?.spatk || 0;
    const baseDef = p.stats?.def || 0;
    const baseSpDef = p.stats?.spdef || 0;
    
    let recommendedNatures = [];

    if (p.natures && Array.isArray(p.natures)) {
        recommendedNatures = p.natures.map(n => ({ name: n, desc: 'Recomendada', bold: true }));
    } else if (baseAtk > baseSpAtk) {
        recommendedNatures = [
            { name: "ADAMANT", desc: "+ATK / -SP.ATK", bold: true }, 
            { name: "BRAVE", desc: "+ATK / -SPD", bold: false },     
            { name: "JOLLY", desc: "+SPD / -SP.ATK", bold: false }   
        ];
    } else if (baseSpAtk > baseAtk) {
        recommendedNatures = [
            { name: "MODEST", desc: "+SP.ATK / -ATK", bold: true }, 
            { name: "QUIET", desc: "+SP.ATK / -SPD", bold: false },  
            { name: "TIMID", desc: "+SPD / -ATK", bold: false }      
        ];
    } else {
        recommendedNatures = [
            { name: "LONELY", desc: "+ATK / -DEF", bold: true },
            { name: "MILD", desc: "+SP.ATK / -DEF", bold: false },
            { name: "HASTY", desc: "+SPD / -DEF", bold: false }
        ];
    }

    const totalDef = baseDef + baseSpDef;
    if (totalDef >= 180 && !p.natures) {
        if (baseDef >= baseSpDef && baseAtk > baseSpAtk) {
            recommendedNatures[2] = { name: "IMPISH", desc: "+DEF / -SP.ATK", bold: false };
        } else if (baseSpDef >= baseDef && baseSpAtk > baseAtk) {
            recommendedNatures[2] = { name: "CALM", desc: "+SP.DEF / -ATK", bold: false };
        }
    }

    const maxStatValue = Math.max(...Object.values(p.stats || {}));

    const statsHTML = `
        <div class="nature-container">
            <span class="nature-title">NATURES RECOMENDADAS</span>
            <div class="nature-pills">
                ${recommendedNatures.map(n => 
                    `<span class="nature-pill nature-tooltip" data-tooltip="${n.desc}">
                        ${n.bold ? `<b>${n.name}</b>` : n.name}
                    </span>`
                ).join('')}
            </div>
        </div>
        <div class="stats-list-animated">
            ${Object.entries(p.stats || {}).map(([name, val]) => {
                const isHighest = val === maxStatValue;
                const cor = statColors[name.toLowerCase()] || '#ff4b2b';
                
                return `
                <div class="stat-row ${isHighest ? 'stat-highest' : ''}">
                    <label>${name.toUpperCase()}</label>
                    <div class="bar-container">
                        <div class="bar-fill" style="--target-width:${(val/255)*100}%; background-color:${cor};"></div>
                    </div>
                    <span class="stat-num">${val}</span>
                </div>
                `;
            }).join('')}
        </div>
    `;

    // ======================= LÓGICA DO LOOT =======================
    let lootHTML = '<span style="color:#888; font-size: 0.8rem; font-family: monospace;">Loot não registrado.</span>';
    
    let items = [];
    if (p.loot) {
        if (Array.isArray(p.loot)) {
            items = p.loot; // Se já for o Array novo, usa direto
        } else if (typeof p.loot === 'string' && p.loot.trim() !== '') {
            items = p.loot.split(',').map(item => item.trim()); // Se for o texto antigo, faz o split
        }
    }

    if (items.length > 0) {
        lootHTML = '<div class="loot-icons-container">' + items.map(item => {
            let safeImgName = item.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            if (item.toUpperCase().startsWith("TM ")) {
                const moveName = item.substring(3).toLowerCase().trim();
                const tmType = tmDictionary[moveName] || 'normal';
                safeImgName = `tm-${tmType}`;
            }
            
            const fallbackJS = `this.onerror=null; this.src='img/loots/${safeImgName}.png'; this.onerror=function(){this.src='https://dummyimage.com/24x24/dcdde1/2c3e50.png&text=?';};`;
            
            return `
                <div class="loot-icon-item loot-tooltip" data-tooltip="${item}" onclick="searchByLoot(\`${item}\`, event)">
                    <img src="img/loots/${safeImgName}.gif" alt="${item}" onerror="${fallbackJS}">
                </div>
            `;
        }).join('') + '</div>';
    }

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
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed rgba(0,0,0,0.2); margin-bottom: 8px; padding-bottom: 4px;">
                    <h4 class="label-tech" style="border: none; margin: 0; padding: 0; text-shadow: none;">RECOMPENSA DIÁRIA</h4>
                    <button class="loot-report-btn loot-tooltip" style="color: #111;" data-tooltip="REPORTAR LOOT" onclick="reportLoot('${p.name}')">⚠️</button>
                </div>
                
                <div class="loot-box" style="margin-top: 10px; background: #fff; padding: 10px; border-radius: 8px; border: 3px solid var(--dex-border); font-size: 1rem; color: var(--dex-red); font-weight: 900; text-transform: uppercase;">
                    ${(Array.isArray(p.loot) ? p.loot.join(', ') : p.loot) || '<span style="color:#888; font-size: 0.8rem;">Recompensa não registrada.</span>'}
                </div>
                
                <div class="boss-bonus-container">
                    <span class="bonus-badge shiny-bonus" title="Derrotar a versão Shiny garante o dobro de recompensas!" onclick="toggleShinyModal(this, '${p.name}', '${p.image}')">✨ SHINY: 2X LOOT</span>
                    <span class="bonus-badge fds-bonus" title="Aos sábados e domingos, o loot padrão é dobrado!">📅 FDS: 2X LOOT</span>
                </div>
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
            
            <div class="data-module" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #999; margin-bottom: 8px; padding-bottom: 4px;">
                    <h4 class="label-tech" style="border: none; margin: 0; padding: 0;">TABELA DE DROP</h4>
                    <button class="loot-report-btn loot-tooltip" data-tooltip="REPORTAR LOOT" onclick="reportLoot('${p.name}')">⚠️</button>
                </div>
                ${lootHTML}
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
                                ${formButtonsHTML}
                            </div>
                        ` : `
                            <img src="${p.image}" class="poke-img-large">
                            <div class="screen-info">
                                <h2>${p.name}</h2>
                                <div class="modal-gen-bar">${isNaN(p.generation) ? p.generation.toUpperCase() : 'GERAÇÃO ' + p.generation}</div>
                                <div class="type-tags">
                                    ${p.types.map(t => `<span class="tag" style="background:var(--type-${t.toLowerCase()})">${t}</span>`).join('')}
                                </div>
                                ${formButtonsHTML}
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
    
    currentSupportIndex = 0;
    finalBtn.classList.add('hidden');
    modal.classList.remove('hidden');
    
    startSupportTyping();

    closeBtn.onclick = () => { modal.classList.add('hidden'); };

    dialogBox.onclick = (e) => {
        if(e.target.id === 'final-support-btn') return;

        const textContainer = document.getElementById('support-text');
        const arrow = document.getElementById('support-arrow');

        if (isSupportTyping) {
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
// ALTERNAR IMAGEM SHINY NO MODAL DO BOSS
// ==========================================
window.toggleShinyModal = async (badge, pokeName, normalImg) => {
    const imgEl = document.querySelector('.poke-img-stacked');
    const genBar = document.querySelector('.stacked-gen-bar');
    
    if (!imgEl) return;

    const isShiny = badge.classList.contains('active-shiny');
    
    if (isShiny) {
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

    badge.innerHTML = '⏳ BUSCANDO...';
    imgEl.style.opacity = '0.5'; 

    try {
        let apiName = pokeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if(apiName === 'mrmime') apiName = 'mr-mime';

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
        if (!response.ok) throw new Error("Pokémon não encontrado na API");
        
        const data = await response.json();
        const shinyUrl = data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny;
        
        if (!shinyUrl) throw new Error("Imagem Shiny não existe");

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

// ==========================================
// MODAL DE DOWNLOAD DO APP (COM TUTORIAL)
// ==========================================
window.initDownloadAppModal = (event) => {
    if(event) event.preventDefault();
    document.getElementById('download-app-modal').classList.remove('hidden');
    changeApkPage(1); // Garante que sempre abre na página de introdução
};

window.changeApkPage = (pageNumber) => {
    const page1 = document.getElementById('apk-page-1');
    const page2 = document.getElementById('apk-page-2');
    const scrollContainer = document.querySelector('#download-app-modal .app-modal-text');

    if (pageNumber === 1) {
        page1.classList.remove('hidden-step');
        page2.classList.add('hidden-step');
    } else if (pageNumber === 2) {
        page1.classList.add('hidden-step');
        page2.classList.remove('hidden-step');
    }
    
    // Joga o scroll do modal lá para cima ao trocar de página
    if(scrollContainer) {
        scrollContainer.scrollTop = 0;
    }
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

    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1519072852513525831/grsC32dPzfIsb7g19z2lGykbyrejCLHL7yjaS4Sop5HsHnhwj3S6L1gZjloY4dhnpLW9';

    const payload = {
        username: "Pokedex PBR - Report",
        avatar_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
        content: "<@743785451978227812> 🚨 Você tem um novo relatório de Bug!",
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

// ==========================================
// ALTERNAR FORMAS REGIONAIS NO MODAL
// ==========================================
window.switchForm = (newId) => {
    const modalContent = document.querySelector('.modal-pokedex-view');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.95)';
    modalContent.style.transition = 'all 0.2s ease';
    
    setTimeout(() => {
        openModal(newId); 
        const newContent = document.querySelector('.modal-pokedex-view');
        newContent.style.opacity = '1';
        newContent.style.transform = 'scale(1)';
    }, 200);
};

// ==========================================
// SISTEMA DE APOIADORES VIP (LETREIRO E MODAL)
// ==========================================

const vipData = {
    donators: ["Jarubinha", "The DarkNess", "Avil", "Player level One"],
    contributors: ["Paleguazv", "Marlin", "Leander Hastings", "Vincent", "Ricardobtj", "Bonacina", "Upzin"]
};

function initVipSystem() {
    const marqueeText = document.getElementById('vip-marquee-text');
    const donatorsGrid = document.getElementById('vip-donators-grid');
    const contributorsGrid = document.getElementById('vip-contributors-grid');

    if (marqueeText) {
        const donatorsString = vipData.donators.map(n => `☕ ${n}`).join(' &nbsp; ★ &nbsp; ');
        const contributorsString = vipData.contributors.map(n => `🗺️ ${n}`).join(' &nbsp; ★ &nbsp; ');
        
        marqueeText.innerHTML = `HALL DA FAMA: &nbsp;&nbsp; ★ &nbsp; ${donatorsString} &nbsp; ★ &nbsp; ${contributorsString} &nbsp; ★`;
    }

    if (donatorsGrid) {
        donatorsGrid.innerHTML = vipData.donators.map(name => 
            `<div class="vip-name-badge donator-badge">${name}</div>`
        ).join('');
    }

    if (contributorsGrid) {
        contributorsGrid.innerHTML = vipData.contributors.map(name => 
            `<div class="vip-name-badge contributor-badge">${name}</div>`
        ).join('');
    }
}

window.openVipModal = () => {
    document.getElementById('vip-modal').classList.remove('hidden');
};

window.closeVipModal = () => {
    document.getElementById('vip-modal').classList.add('hidden');
};

// ==========================================
// SISTEMA DE TUTORIAIS E GUIAS (WIKI)
// ==========================================
window.openTutorial = (articleId) => {
    document.getElementById('tutorials-grid').style.display = 'none';
    document.getElementById('tutorial-article-view').style.display = 'block';
    
    // Esconde todos os textos e mostra só o que foi clicado
    document.querySelectorAll('.article-content-block').forEach(el => el.style.display = 'none');
    
    const targetArticle = document.getElementById('article-' + articleId);
    if(targetArticle) targetArticle.style.display = 'block';
    
    // Joga o scroll do painel principal para cima
    document.getElementById('tutorials-module').scrollTop = 0;
};

window.closeTutorial = () => {
    document.getElementById('tutorials-grid').style.display = 'grid';
    document.getElementById('tutorial-article-view').style.display = 'none';
};

window.reportLoot = (pokeName) => {
    // Esconde o modal do pokemon
    document.getElementById('pokemon-modal').classList.add('hidden');
    
    // Abre o modal de report
    document.getElementById('report-modal').classList.remove('hidden');
    document.getElementById('report-status').innerText = '';
    
    // Preenche os campos automaticamente
    document.getElementById('report-type').value = 'SUGESTÃO';
    document.getElementById('report-msg').value = `LOOT DO ${pokeName.toUpperCase()}:\n- \n- \n- `;
    
    // Foca na caixa de texto
    document.getElementById('report-msg').focus();
};

// ==========================================
// SISTEMA DE PESQUISA AVANÇADA (NOME / LOOT)
// ==========================================

// Configura o clique no novo interruptor (Pílula)
document.addEventListener('DOMContentLoaded', () => {
    const searchModeToggle = document.getElementById('search-mode-toggle');
    const optPokemon = document.getElementById('mode-pokemon');
    const optLoot = document.getElementById('mode-loot');
    

    if(searchModeToggle) {
        searchModeToggle.addEventListener('click', () => {
            if (searchMode === 'pokemon') {
                const itemBtn = document.querySelector('.cat-btn[data-cat="drops"]');
                if(itemBtn) itemBtn.click();
            } else {
                const normBtn = document.querySelector('.cat-btn[data-cat="normal"]');
                if(normBtn) normBtn.click();
            }
        });
    }
});

// O Gatilho de Engenharia Reversa (Ao clicar no Loot no Modal)
window.searchByLoot = (lootName, event) => {
    // LÓGICA DO MOBILE (TOQUE DE SELEÇÃO / TOQUE DUPLO)
    // Se o aparelho for touch (não suporta hover de mouse)...
    if (event && window.matchMedia("(hover: none)").matches) {
        const el = event.currentTarget;
        // Se ainda não estiver selecionado, seleciona e para por aqui (1º toque)
        if (!el.classList.contains('mobile-selected')) {
            document.querySelectorAll('.loot-icon-item').forEach(i => i.classList.remove('mobile-selected'));
            el.classList.add('mobile-selected');
            return; 
        }
        // Se já estiver selecionado, passa reto e executa a busca! (2º toque)
    }

    // 1. Fecha o modal do Pokémon
    document.getElementById('pokemon-modal').classList.add('hidden');
    
    // 2. Garante que estamos na aba NORMAL (Onde ficam os drops)
    if (activeCategory !== 'normal') {
        document.querySelector('.cat-btn[data-cat="normal"]').click();
    }
    
    // 3. Muda a pílula para o modo "LOOT"
    searchMode = 'loot';
    const optPokemon = document.getElementById('mode-pokemon');
    const optLoot = document.getElementById('mode-loot');
    if (optPokemon && optLoot) {
        optPokemon.classList.remove('active');
        optLoot.classList.add('active');
    }
    
    // 4. Preenche o campo de texto com o nome do item
    document.getElementById('search-input').value = lootName;
    
    // 5. Executa a pesquisa e leva o jogador para o topo da tela
    applyFilters();
    
    const displayElement = document.querySelector('.pokedex-main-display');
    if(displayElement) displayElement.scrollTop = 0;
};

// ==========================================
// POKÉDEX VERTICAL (MODAL DE ITENS) E CONEXÕES
// ==========================================

// Substitui a função searchByLoot antiga (Agora ela abre o Modal Vertical direto!)
window.searchByLoot = (lootName, event) => {
    if (event) event.stopPropagation();
    
    // Fecha o modal do Pokémon
    document.getElementById('pokemon-modal').classList.add('hidden');
    
    // Abre a Pokédex Vertical do Item
    openItemModal(lootName);
};

// ==========================================
// POKÉDEX VERTICAL (MODAL DE ITENS COM NAVEGAÇÃO)
// ==========================================

window.searchByLoot = (lootName, event) => {
    if (event) event.stopPropagation();
    document.getElementById('pokemon-modal').classList.add('hidden');
    openItemModal(lootName);
};

// Navegação Pelas Setas no Modal do Item
window.navigateItem = (direction, event) => {
    if (event) event.stopPropagation();
    if (itemData.length === 0) return;

    currentModalItemIndex += direction;
    if (currentModalItemIndex < 0) currentModalItemIndex = itemData.length - 1;
    else if (currentModalItemIndex >= itemData.length) currentModalItemIndex = 0;

    renderItemModal();
};

window.openItemModal = (itemName) => {
    const index = itemData.findIndex(i => i.name === itemName);
    if (index === -1) return;
    
    currentModalItemIndex = index;
    renderItemModal();
    document.getElementById('item-modal').classList.remove('hidden');
};

function renderItemModal() {
    const item = itemData[currentModalItemIndex];
    if (!item) return;

    const fallbackJS = `this.onerror=null; this.src='img/loots/${item.icon_name}.png'; this.onerror=function(){this.src='https://dummyimage.com/64x64/dcdde1/2c3e50.png&text=?';};`;

    const droppersHTML = item.droppedBy.map(p => `
        <div class="mini-dropper-card" onclick="swapToPokemonModal('${p.id}')">
            <img src="${p.image}" loading="lazy">
            <span>${p.name}</span>
        </div>
    `).join('');

    // Injeta o HTML usando as MESMAS classes visuais do Modal de Pokémon (Carcaça Vermelha)
    document.getElementById('item-modal-body').innerHTML = `
        <div class="modal-pokedex-view item-vertical-view">
            <div class="modal-left-wing item-vertical-wing">
                
                <div class="screen-border" style="position: relative; margin-bottom: 0;">
                    <button class="nav-arrow prev-arrow" title="Anterior" onclick="navigateItem(-1, event)">&#10094;</button>
                    <button class="nav-arrow next-arrow" title="Próximo" onclick="navigateItem(1, event)">&#10095;</button>
                    
                    <div class="main-screen main-screen-stacked">
                        <div class="stacked-container">
                            <img src="img/loots/${item.icon_name}.gif" class="poke-img-stacked" style="image-rendering: pixelated; margin-bottom: -5px;" onerror="${fallbackJS}">
                            <h2 class="poke-name-stacked" style="font-size: 1.15rem; margin-top: 5px;">${item.name}</h2>
                            <div class="modal-gen-bar stacked-gen-bar">${item.droppedBy.length} POKÉMON(S) DROPAM</div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- A parte de baixo da dobradiça -->
            <div class="item-bottom-area">
                <h4 class="label-tech">DROPA DE:</h4>
                <div class="droppers-grid">
                    ${droppersHTML}
                </div>
            </div>

        </div>
    `;
}

// Quando o jogador clica num rosto de Pokémon dentro do Item
window.swapToPokemonModal = (pokeId) => {
    document.getElementById('item-modal').classList.add('hidden');
    openModal(pokeId);
};
