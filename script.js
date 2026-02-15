const {createApp, ref, reactive, computed, onMounted, watch, nextTick} = Vue;

createApp({
    setup() {
        const CONFIG = {
            towel: {
                realWidthCm: 30,
                realHeightCm: 45,
                distFromBaseCm: 6
            },
            embroidery: {
                realWidthCm: 18,
                realHeightCm: 11.5,
                artWidthCm: 8
            },
            fonts: [
                {name: 'Great Vibes', family: "'Great Vibes', cursive"},
                {name: 'Allura', family: "'Allura', cursive"},
                {name: 'Lumios Marker', family: "'Lumios Marker', cursive"},
                {name: 'Dancing Script', family: "'Dancing Script', cursive"},
                {name: 'Alex Brush', family: "'Alex Brush', cursive"},
                {name: 'Pacifico', family: "'Pacifico', cursive"},
                {name: 'Italianno', family: "'Italianno', cursive"},
                {name: 'Parisienne', family: "'Parisienne', cursive"},
                {name: 'Krone', family: "'Krona One', sans-serif"},
            ],
            towelColors: [
                {rgb: "rgb(216, 208, 179)", name: "Bege Escuro"},
                {rgb: "rgb(204, 255, 204)", name: "Verde Claro"},
                {rgb: "rgb(166, 242, 251)", name: "Azul Claro"},
                {rgb: "rgb(224, 214, 255)", name: "Lilás"},
                {rgb: "rgb(252, 201, 223)", name: "Rosa"},
                {rgb: "rgb(254, 213, 213)", name: "Rosa-Chá"},
                {rgb: "rgb(255, 208, 185)", name: "Pêssego"},
                {rgb: "rgb(255, 157, 109)", name: "Salmão"},
                {rgb: "rgb(249, 249, 249)", name: "Branco"},
                {rgb: "rgb(254, 254, 211)", name: "Marfim"},
                {rgb: "rgb(254, 244, 221)", name: "Bege Claro"},
                {rgb: "rgb(42, 42, 42)", name: "Preto"},
                {rgb: "rgb(191, 44, 44)", name: "Vermelho"},
            ],
            threadColors: [
                {hex: "#333333", name: "Grafite"},
                {hex: "#FFFFFF", name: "Branco"},
                {hex: "#D4AF37", name: "Dourado"},
                {hex: "#C0C0C0", name: "Prata"},
                {hex: "#0D47A1", name: "Azul Marinho"},
                {hex: "#B22222", name: "Vermelho"},
                {hex: "#E91E63", name: "Pink"},
                {hex: "#4A148C", name: "Roxo"},
                {hex: "#1B5E20", name: "Verde Musgo"},
                {hex: "#5D4037", name: "Marrom"},
            ]
        };

        const fonts = CONFIG.fonts;
        const towelColors = CONFIG.towelColors;
        const threadColors = CONFIG.threadColors;

        const mockImages = ref([]);

        const state = reactive({
            text: 'Lorena',
            font: "'Great Vibes', cursive",
            towelColorName: 'Branco',
            towelColorRgb: 'rgb(249, 249, 249)',
            threadColorName: 'Grafite',
            threadColorHex: '#333333',
            artName: '',
            artUrl: '',
            isFlipped: false,
            activeStep: 1,
            selectedThemeFilter: 'all'
        });

        const msgSucesso = ref(false);
        const showMobileFs = ref(false);
        const textContainerRef = ref(null);
        const textSpanRef = ref(null);
        const mainEmbroideryBoxRef = ref(null);
        const fsEmbroideryBoxRef = ref(null);
        const fsFontSize = ref('20px');

        const themes = computed(() => {
            const uniqueThemes = new Set(mockImages.value.map(img => img.theme));
            return ['all', ...Array.from(uniqueThemes)];
        });

        const filteredArts = computed(() => {
            if (state.selectedThemeFilter === 'all') return mockImages.value;
            return mockImages.value.filter(img => img.theme === state.selectedThemeFilter);
        });

        const toggleStep = (step) => {
            state.activeStep = state.activeStep === step ? step : step;
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    const el = document.getElementById(`step-${step}`);
                    if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
                }, 300);
            }
        };

        // --- CÁLCULO DE TEXTO OTIMIZADO ---
        const adjustTextSize = async () => {
            await nextTick();
            const el = textSpanRef.value;
            const container = textContainerRef.value;
            if (!el || !container || !state.text.trim()) return;

            let maxFont = window.innerWidth <= 768 ? 120 : 250;
            let fontSize = 10;
            el.style.fontSize = fontSize + 'px';

            // Margem de Segurança Rigorosa:
            // O texto deve parar de crescer exatamente quando atingir a largura ou altura da caixa.
            const maxWidth = container.clientWidth;
            const maxHeight = container.clientHeight;

            // Reset size to avoid overflow before measuring
            el.style.fontSize = '10px';

            while (el.offsetWidth < maxWidth && el.offsetHeight < maxHeight && fontSize < maxFont) {
                fontSize += 1;
                el.style.fontSize = fontSize + 'px';
            }

            // Garante que não estourou (backtrack se necessário)
            if (el.offsetWidth > maxWidth || el.offsetHeight > maxHeight) {
                fontSize -= 1;
                el.style.fontSize = fontSize + 'px';
            }
        };

        const openMobileFullscreen = async () => {
            showMobileFs.value = true;
            await nextTick();
            if (mainEmbroideryBoxRef.value && fsEmbroideryBoxRef.value && textSpanRef.value) {
                const mainWidth = mainEmbroideryBoxRef.value.clientWidth;
                const fsWidth = fsEmbroideryBoxRef.value.clientWidth;
                const currentFontSize = parseFloat(textSpanRef.value.style.fontSize) || 10;
                const scaleFactor = fsWidth / mainWidth;
                fsFontSize.value = (currentFontSize * scaleFactor) + 'px';
            }
        };

        const setFont = (fontObj) => {
            state.font = fontObj.family;
            adjustTextSize();
        };
        const setTowelColor = (color) => {
            state.towelColorName = color.name;
            state.towelColorRgb = color.rgb;
        };
        const setThreadColor = (color) => {
            state.threadColorName = color.name;
            state.threadColorHex = color.hex;
        };
        const selectArt = (art) => {
            state.artName = art.name;
            state.artUrl = art.url;
            adjustTextSize();
        };
        const toggleFlip = () => {
            state.isFlipped = !state.isFlipped;
        };

        const formatFontPreview = (txt) => {
            if (!txt || !txt.trim()) return "Nome";
            // Retorna apenas a primeira palavra ou limita o tamanho para não quebrar o grid
            const primeiraPalavra = txt.trim().split(/\s+/)[0];
            return primeiraPalavra.length > 12 ? primeiraPalavra.substring(0, 10) + '...' : primeiraPalavra;
        };

        const resetCreator = () => {
            state.text = 'Lorena';
            state.font = "'Great Vibes', cursive";
            state.towelColorName = 'Branco';
            state.towelColorRgb = 'rgb(249, 249, 249)';
            state.threadColorName = 'Grafite';
            state.threadColorHex = '#333333';
            state.isFlipped = false;
            state.activeStep = 1;
            if (mockImages.value.length > 0) selectArt(mockImages.value[0]);
            updateUrl();
        };

        const updateUrl = () => {
            const params = new URLSearchParams();
            params.set('txt', state.text);
            params.set('t_c', state.towelColorName);
            params.set('b_c', state.threadColorName);
            params.set('font', state.font);
            params.set('art', state.artName);
            params.set('f', state.isFlipped ? '1' : '0');
            window.history.replaceState(null, '', '?' + params.toString());
        };

        const copyUrl = () => {
            updateUrl();
            navigator.clipboard.writeText(window.location.href);
            msgSucesso.value = true;
            setTimeout(() => msgSucesso.value = false, 2000);
        };

        const sendWhatsApp = () => {
            const cleanFont = state.font.replace(/'/g, "").split(',')[0];
            const iNome = "\uD83D\uDC64";
            const iArte = "\uD83C\uDFA8";
            const iToalha = "\u2753";
            const iLinha = "\uD83E\uDDF5";
            const iFonte = "\u270D";
            const textoCru =
                `*Novo Pedido de Toalha (30x45):*
------------------
${iNome} *Nome:* ${state.text}
${iArte} *Arte:* ${state.artName} ${state.isFlipped ? '(Espelhada)' : ''}
${iToalha} *Cor Toalha:* ${state.towelColorName}
${iLinha} *Cor Linha:* ${state.threadColorName}
${iFonte} *Fonte:* ${cleanFont}

Visualize aqui:
${window.location.href}`;

            const msg = encodeURIComponent(textoCru);
            window.open(`https://wa.me/551176690770?text=${msg}`);
        };

        const applyConfigStyles = () => {
            const root = document.documentElement;
            const t = CONFIG.towel;
            const e = CONFIG.embroidery;

            root.style.setProperty('--towel-aspect', `${t.realWidthCm} / ${t.realHeightCm}`);
            root.style.setProperty('--embroidery-aspect', `${e.realWidthCm} / ${e.realHeightCm}`);
            root.style.setProperty('--embroidery-width-percent', `${(e.realWidthCm / t.realWidthCm) * 100}%`);
            root.style.setProperty('--art-width-percent', `${(e.artWidthCm / e.realWidthCm) * 100}%`);
            root.style.setProperty('--dist-from-base-percent', `${(t.distFromBaseCm / t.realWidthCm) * 100}%`);

            // Mobile specific logic if needed can also be here, 
            // but the current CSS handles mobile with media queries.
            // We set the baseline from CONFIG.
        };

        let debounceTimer;
        watch(() => state.text, () => {
            let linhas = state.text.split('\n');
            if (linhas.length > 2) linhas = linhas.slice(0, 2);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                adjustTextSize();
                updateUrl();
            }, 300);
        });

        watch([() => state.font, () => state.activeStep, () => state.towelColorName, () => state.threadColorName, () => state.isFlipped, () => state.artName], () => {
            adjustTextSize();
            updateUrl();
        });

        onMounted(async () => {
            applyConfigStyles();
            try {
                const response = await fetch('artes-toalhas/manifest.json');
                if (response.ok) {
                    mockImages.value = await response.json();
                }
            } catch (e) {
                console.error("Erro JSON", e);
            }

            const params = new URLSearchParams(window.location.search);
            if (params.has('txt')) state.text = params.get('txt');
            if (params.has('t_c')) {
                const color = towelColors.find(c => c.name === params.get('t_c'));
                if (color) setTowelColor(color);
            }
            if (params.has('b_c')) {
                const color = threadColors.find(c => c.name === params.get('b_c'));
                if (color) setThreadColor(color);
            }
            if (params.has('font')) state.font = params.get('font');

            let artToSelect = null;
            if (params.has('art')) {
                const artName = params.get('art');
                artToSelect = mockImages.value.find(img => img.name === artName);
            }
            if (!artToSelect && mockImages.value.length > 0) artToSelect = mockImages.value[0];
            if (artToSelect) selectArt(artToSelect);

            if (params.has('f')) state.isFlipped = params.get('f') === '1';

            window.addEventListener('resize', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(adjustTextSize, 300);
            });
            setTimeout(adjustTextSize, 500);
        });

        return {
            fonts, towelColors, threadColors, themes, state, msgSucesso, showMobileFs,
            textContainerRef, textSpanRef, mainEmbroideryBoxRef, fsEmbroideryBoxRef, fsFontSize,
            filteredArts, toggleStep, setFont, setTowelColor, setThreadColor, selectArt,
            toggleFlip, resetCreator, copyUrl, sendWhatsApp, formatFontPreview, openMobileFullscreen
        };
    }
}).mount('#app');