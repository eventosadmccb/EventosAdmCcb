
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO SUPABASE ---
    const SUPABASE_URL = 'https://slmliiruyznvwkgwqeil.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbWxpaXJ1eXpudndrZ3dxZWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzA4MjYsImV4cCI6MjA4MjUwNjgyNn0.491qEsqu-4YUoGkhk7Vcw8nzBvN3hCHZzGxMFhrqF9o';
    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error("Erro ao inicializar o Supabase. Verifique suas credenciais.", e);
        showErrorBanner("Erro crítico na configuração. Verifique o console.");
        return;
    }
    
    // --- ESTADO GLOBAL DA APLICAÇÃO ---
    const APP_STATE = {
        user: null,
        perfil: null,
        feriados: {},
        eventos: [],
        pendingUserCount: 0,
        isMenuOpen: false,
    };

    // --- SELETORES GLOBAIS DO DOM ---
    const appRender = document.getElementById('app-render');
    const mainUI = document.querySelector('.flex.flex-col.h-screen');
    const btnMenu = document.getElementById('btn-menu');
    const btnHome = document.getElementById('btn-home');
    const fabAdd = document.getElementById('fab-add');
    const menuLateralContainer = document.getElementById('menu-lateral-container');
    
    // --- LÓGICA DE INICIALIZAÇÃO E CACHE ---
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
        try {
            APP_STATE.perfil = JSON.parse(cachedProfile);
        } catch(e) {
            console.error("Erro ao parsear perfil do cache", e);
            localStorage.removeItem('userProfile');
        }
    }
    
    // --- FUNÇÕES UTILITÁRIAS ---
    const showErrorBanner = (message) => {
        const bannerContainer = document.getElementById('notification-banner-container');
        if (bannerContainer) {
            bannerContainer.innerHTML = renderErrorBanner(message);
            setTimeout(() => {
                bannerContainer.innerHTML = '';
            }, 5000);
        }
    };

    const updateFilterAndCount = (filterText, count) => {
        //... (código existente)
    };
    
    // --- FUNÇÕES DE BUSCA DE DADOS (DATA FETCHING) ---
    const fetchEventos = async () => {
        //... (código existente)
    };

    // --- LÓGICA DE GESTÃO E NOTIFICAÇÃO ---
    const verificarPendenciasAdmin = async () => {
        //... (código existente)
    };
    
    // --- LÓGICA DE GESTÃO DE USUÁRIOS ---
    const carregarUsuariosAdmin = async () => {
        //... (código existente)
    };
    
    const atualizarStatusUsuario = async (userId, novoNivel, buttonEl) => {
        // ... (código existente)
    };
    const removerUsuario = (userId, buttonEl) => {
        // ... (código existente)
    };
    const setupGestaoUsuariosListeners = () => { /* ... código existente ... */ };


    // --- LÓGICA DE NAVEGAÇÃO / ROTEAMENTO ---
    const navigateTo = (page) => {
        appRender.innerHTML = '';
        const isHomePage = page === 'home';
        fabAdd.classList.toggle('hidden', !isHomePage);
        
        document.getElementById('header-action-bar')?.classList.toggle('hidden', !isHomePage);
        document.getElementById('search-filter-bar').classList.toggle('hidden', !isHomePage);
        document.getElementById('filter-status-display').classList.toggle('hidden', !isHomePage);


        switch (page) {
            case 'home':
                appRender.innerHTML = renderHomePage(APP_STATE.eventos);
                updateFilterAndCount('Todos', APP_STATE.eventos.length);
                break;
            case 'adms':
            case 'atendentes':
                carregarUsuariosAdmin();
                break;
            case 'setores':
            case 'cidades':
            case 'localidades':
            case 'tipos_eventos':
            case 'feriados':
                const items = [{ id: 1, nome: `Item 1 de ${page}` }, { id: 2, nome: `Item 2 de ${page}` }];
                appRender.innerHTML = renderManagementScreen(page, items);
                break;
            default:
                appRender.innerHTML = renderHomePage(APP_STATE.eventos);
                updateFilterAndCount('Todos', APP_STATE.eventos.length);
        }
    };

    // --- LÓGICA DO MENU LATERAL ---
    const openMenu = async () => {
        //... (código existente)
    };
    const closeMenu = () => {
        //... (código existente)
    };
    
    // --- FLUXO DE AUTENTICAÇÃO E CADASTRO ---
    const loginMagico = async () => {
        const emailInput = document.getElementById('login-email');
        const email = emailInput.value.trim();
        if (!email) {
            showErrorBanner("Por favor, insira um e-mail.");
            return;
        }
        
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            appRender.innerHTML = renderMagicLinkSentMessage(email);
        } catch (error) {
            console.error("Erro no login mágico:", error);
            showErrorBanner(`Erro ao enviar o link: ${error.message}`);
        }
    };

    const salvarCadastroInicial = async (user) => {
        const nome = document.getElementById('cadastro-nome')?.value.trim();
        const telefone = document.getElementById('cadastro-telefone')?.value.trim();

        if (!nome || !telefone) {
            showErrorBanner("Nome e telefone são obrigatórios.");
            return;
        }

        try {
            const { error } = await supabase.from('atendentes').insert({
                id_usuario: user.id,
                email: user.email,
                nome_atendente: nome,
                telefone: telefone,
                nivel_acesso: 'Aguardando',
                aprovado_por_admin: false,
            });
            if (error) throw error;
            showAwaitingApprovalModal();
        } catch (error) {
            console.error("Erro ao salvar cadastro:", error);
            showErrorBanner(`Não foi possível salvar seu cadastro: ${error.message}`);
        }
    };

    const showAwaitingApprovalModal = () => {
        showModal('Cadastro em Análise', renderAwaitingApprovalMessage(), '', { closable: false });
    };

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    const inicializarApp = async () => {
        try {
            console.log("Inicializando aplicação principal...");
            const anoAtual = new Date().getFullYear();
            
            await Promise.all([
                // sincronizarFeriados(anoAtual), // Descomente se necessário
                fetchEventos()
            ]);
            
            // const feriadosMap = await getFeriadosMap(); // Descomente se necessário
            // APP_STATE.feriados = feriadosMap;
            
            mainUI.classList.remove('hidden');
            navigateTo('home');
            console.log("Aplicação inicializada com sucesso.");
        } catch (error) {
            console.error("Erro fatal durante a inicialização do app:", error);
            showErrorBanner("Ocorreu um erro ao carregar os dados iniciais.");
        }
    };

    // --- CONTROLE DE AUTENTICAÇÃO ---
    const handleUserSession = async (session) => {
        APP_STATE.user = session.user;
        const { data: profile, error } = await supabase
            .from('atendentes')
            .select('*')
            .eq('id_usuario', APP_STATE.user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { 
             console.error("Erro ao buscar perfil:", error);
             showErrorBanner("Ocorreu um erro ao verificar seu perfil.");
             return;
        }
        
        APP_STATE.perfil = profile;
        console.log("Usuário Verificado:", APP_STATE.perfil);

        if (profile) {
            localStorage.setItem('userProfile', JSON.stringify(profile));
        } else {
            localStorage.removeItem('userProfile');
        }

        if (!APP_STATE.perfil) {
            appRender.innerHTML = renderCadastroInicial();
            document.getElementById('btn-finalizar-cadastro').addEventListener('click', () => salvarCadastroInicial(APP_STATE.user));
        } else if (APP_STATE.perfil.nivel_acesso === 'Aguardando') {
            showAwaitingApprovalModal();
        } else {
            await inicializarApp();
            await verificarPendenciasAdmin();
        }
    };

    const handleLogout = () => {
        console.log("Usuário deslogado. Limpando sessão.");
        APP_STATE.user = null;
        APP_STATE.perfil = null;
        APP_STATE.eventos = [];
        localStorage.clear();
        mainUI.classList.add('hidden');
        appRender.innerHTML = renderLoginForm();
        document.getElementById('btn-enviar-link').addEventListener('click', loginMagico);
        document.getElementById('login-email').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); loginMagico(); }
        });
        console.log('Tela de Login Carregada.');
    };

    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`Auth state mudou: ${event}`);
        if (event === 'SIGNED_IN') {
            await handleUserSession(session);
        } else if (event === 'SIGNED_OUT') {
            handleLogout();
        }
    });

    // --- FLUXO DE INICIALIZAÇÃO PRINCIPAL ---
    const mainAppFlow = async () => {
        console.log('Iniciando Auth...');
        appRender.innerHTML = renderLoadingIndicator();
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session) {
                console.log('Sessão encontrada, verificando perfil...');
                await handleUserSession(session);
            } else {
                console.log('Nenhuma sessão, renderizando login...');
                handleLogout();
            }
        } catch (error) {
            console.error("Erro ao obter sessão:", error);
            showErrorBanner("Falha ao verificar autenticação. Tente recarregar a página.");
        }
    };

    // --- MANIPULADORES DE EVENTOS ---
    btnMenu.addEventListener('click', openMenu);
    btnHome.addEventListener('click', () => {
        if (APP_STATE.isMenuOpen) closeMenu();
        navigateTo('home');
    });

    // Inicia a aplicação
    mainAppFlow();
});