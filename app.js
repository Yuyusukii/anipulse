const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const CACHE_URL = "data/anime-cache.json";
const DEFAULT_PROFILE_IMAGE = "IMAGENS/LOGO%20DO%20SITE.png";
const PROFILE_REGISTRY_KEY = "anipulse:usernameRegistry";
const PROFILE_DIRECTORY_KEY = "anipulse:profileDirectory";
const CHAT_THREADS_KEY = "anipulse:chatThreads";
const PUBLIC_CHATS_KEY = "anipulse:publicChats";
const SEARCH_HISTORY_KEY = "anipulse:searchHistory";
const BOT_PROFILE_ID = "anipulse-chat-bot";
const PUBLIC_THREAD_PREFIX = "public:";
const FIRST_SEEN_KEY = "anipulse:firstSeenAt";
const MIN_PROFILE_FIRST_SEEN = "2026-04-30T00:00:00.000Z";
const PROFILE_SYSTEM_VERSION = 3;
const XP_SAVE_KEY = "anipulse:lastXpTick";
const PROFILE_MEDIA_DB = "anipulse-profile-media";
const PROFILE_MEDIA_STORE = "assets";
const PROFILE_MEDIA_REF_PREFIX = "idb:profile-";
const CHAT_MEDIA_REF_PREFIX = "idb:chat-";
const PROFILE_MEDIA_KEYS = {
  avatar: "profile-avatar",
  banner: "profile-banner",
};
const PROFILE_MAX_LEVEL = 50;
const CATALOG_PAGE_SIZE = 50;
const TRENDING_PAGE_SIZE = 30;
const PROFILE_ANIME_PREVIEW_LIMIT = 8;
const PROFILE_CHARACTER_PREVIEW_LIMIT = 5;
const CHAT_ATTACHMENT_LIMIT_BYTES = 40 * 1024 * 1024;
const SEARCH_HISTORY_LIMIT = 10;
const ANILIST_REQUEST_TIMEOUT_MS = 12000;
const PUBLIC_CHAT_FIXTURE_MEMBERS = [
  { id: BOT_PROFILE_ID, name: "Yui Bot", username: "yui_bot", role: "CO", avatar: DEFAULT_PROFILE_IMAGE },
  { id: "public-member-mika", name: "Mika", username: "mika_chan", role: "member", avatar: DEFAULT_PROFILE_IMAGE },
  { id: "public-member-ren", name: "Ren", username: "ren_anime", role: "member", avatar: DEFAULT_PROFILE_IMAGE },
];
const DETAILS_CHARACTER_RENDER_CHUNK = 48;
const DETAILS_CHARACTER_PAGE_SIZE = 50;
const DETAILS_CHARACTER_PAGE_LIMIT = 100;
const FALLBACK_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];
const TAG_TIERS = [
  {
    min: 0,
    max: 10,
    labels: ["Novato", "Faísca Shonen", "Primeiro Episódio", "Caçador de Openings", "Fã em Treino"],
  },
  {
    min: 11,
    max: 20,
    labels: ["Senpai Urbano", "Maratonista Noturno", "Guardião da Watchlist", "Caçador de Arcos", "Especialista Isekai"],
  },
  {
    min: 21,
    max: 30,
    labels: ["Elite Shonen", "Crítico de Temporada", "Lenda dos Fillers", "Mestre dos Gêneros", "Colecionador de Sagas"],
  },
  {
    min: 31,
    max: 40,
    labels: ["Arquivista Anime", "Lorde das Maratonas", "Oráculo do Catálogo", "Veterano AniPulse", "Guardião Vermelho"],
  },
  {
    min: 41,
    max: 49,
    labels: ["Titã do Perfil", "Imperador Otaku", "Aura Lendária", "Mito das Temporadas", "Ascendente AniPulse"],
  },
  {
    min: 50,
    max: 50,
    labels: ["Supremo AniPulse", "Deus do Catálogo", "Lenda Final", "Nível Supremo", "Coroa Vermelha"],
  },
];
const STYLE_TAGS = createStyleTags();
const PROFILE_STATUSES = {
  online: { label: "Online", title: "Online" },
  away: { label: "Ausente", title: "Ausente" },
  dnd: { label: "Não perturbe", title: "Não perturbe" },
  offline: { label: "Offline", title: "Offline" },
};
const DEFAULT_PROFILE = {
  systemVersion: PROFILE_SYSTEM_VERSION,
  id: "local-main-profile",
  name: "Akira",
  username: "akirapulse",
  status: "online",
  firstSeenAt: getFirstSeenAt(),
  level: 0,
  xp: 0,
  onlineSeconds: 0,
  interactions: 0,
  age: 18,
  hideAge: false,
  country: "Brasil",
  stateRegion: "",
  hideLocation: false,
  hideChatBubble: false,
  tag: "Novato",
  memberSince: "",
  quote: '"O sofrimento é o que nos torna fortes."',
  bio: "Apaixonado por animes desde sempre! Aqui compartilho minhas aventuras, emoções e histórias favoritas.",
  avatar: "",
  avatarX: 50,
  avatarY: 35,
  banner: "",
  bannerX: 50,
  bannerY: 50,
};

const storedProfile = readStore("anipulse:profileData", null);

const state = {
  page: 1,
  hasNextPage: false,
  total: 0,
  media: [],
  trending: [],
  spotlightIndex: 0,
  filters: {
    search: "",
    genre: "",
    year: "",
    status: "",
    sort: "TRENDING_DESC",
  },
  favorites: readStore("anipulse:favorites", []),
  wishlist: readStore("anipulse:wishlist", []),
  history: readStore("anipulse:history", []),
  completed: readStore("anipulse:completed", []),
  favoriteCharacters: readStore("anipulse:favoriteCharacters", []),
  searchHistory: readStore(SEARCH_HISTORY_KEY, []),
  characterResults: [],
  profileResults: [],
  viewedProfile: null,
  chatThreads: readStore(CHAT_THREADS_KEY, {}),
  publicChats: [],
  publicChatSearch: "",
  chatMedia: {},
  activeChatProfile: null,
  chatWindowOpen: false,
  chatView: "list",
  unreadThreads: readStore("anipulse:chatUnread", {}),
  voiceCall: null,
  callStream: null,
  callAnalyser: null,
  callVoiceFrame: 0,
  remoteVoiceFrame: 0,
  callVoiceTimeout: 0,
  remoteVoiceTimeout: 0,
  callMicLevel: 0,
  callNoiseFloor: 0.018,
  callSpeakingFrames: 0,
  screenStream: null,
  screenSharing: false,
  genres: FALLBACK_GENRES,
  profileName: localStorage.getItem("anipulse:profile") || "",
  profile: upgradeProfile(storedProfile),
  profileMedia: {
    avatar: "",
    banner: "",
  },
  profileMediaObjectUrls: {
    avatar: "",
    banner: "",
  },
  adMode: localStorage.getItem("anipulse:ads") || "balanced",
  deferredInstallPrompt: null,
  cacheGeneratedAt: "",
  activeDetailsId: null,
  detailsCharacterCache: new Map(),
  detailsCharacterRenderToken: "",
  profileSectionExpanded: {
    completed: false,
    favorites: false,
    wishlist: false,
    characters: false,
  },
};

const elements = {
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchHistoryPanel: document.querySelector("#searchHistoryPanel"),
  searchHistoryList: document.querySelector("#searchHistoryList"),
  clearSearchHistory: document.querySelector("[data-clear-search-history]"),
  genreFilter: document.querySelector("#genreFilter"),
  yearFilter: document.querySelector("#yearFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  animeGrid: document.querySelector("#animeGrid"),
  trendingRail: document.querySelector("#trendingRail"),
  spotlight: document.querySelector("#spotlight"),
  catalogTitle: document.querySelector("#catalogTitle"),
  resultCount: document.querySelector("#resultCount"),
  cacheStatus: document.querySelector("#cacheStatus"),
  loadMoreButton: document.querySelector("#loadMoreButton"),
  refreshButton: document.querySelector("#refreshButton"),
  detailsShell: document.querySelector("#detailsShell"),
  detailsContent: document.querySelector("#detailsContent"),
  favoritesList: document.querySelector("#favoritesList"),
  wishlistList: document.querySelector("#wishlistList"),
  historyList: document.querySelector("#historyList"),
  favoriteCount: document.querySelector("#favoriteCount"),
  wishlistCount: document.querySelector("#wishlistCount"),
  historyCount: document.querySelector("#historyCount"),
  heroWatchedCount: document.querySelector("#heroWatchedCount"),
  heroFavoriteCount: document.querySelector("#heroFavoriteCount"),
  heroWishlistCount: document.querySelector("#heroWishlistCount"),
  profileName: document.querySelector("#profileName"),
  toast: document.querySelector("#toast"),
  installButton: document.querySelector("#installButton"),
  stickyAd: document.querySelector("#stickyAd"),
  closeStickyAd: document.querySelector("#closeStickyAd"),
  homeView: document.querySelector("#homeView"),
  profileView: document.querySelector("#profileView"),
  profileEditor: document.querySelector("#profileEditor"),
  profileForm: document.querySelector("#profileForm"),
  accountAvatar: document.querySelector("#accountAvatar"),
  accountStatus: document.querySelector("#accountStatus"),
  accountName: document.querySelector("#accountName"),
  accountLevel: document.querySelector("#accountLevel"),
  heroProfileAvatar: document.querySelector("#heroProfileAvatar"),
  heroProfileStatus: document.querySelector("#heroProfileStatus"),
  heroProfileName: document.querySelector("#heroProfileName"),
  heroProfileLevel: document.querySelector("#heroProfileLevel"),
  profileBanner: document.querySelector("#profileBanner"),
  profileBannerImage: document.querySelector("#profileBannerImage"),
  profileAvatar: document.querySelector("#profileAvatar"),
  profileStatus: document.querySelector("#profileStatus"),
  profileTitle: document.querySelector("#profileTitle"),
  profileLevelBadge: document.querySelector("#profileLevelBadge"),
  profileHandle: document.querySelector("#profileHandle"),
  profileMember: document.querySelector("#profileMember"),
  profileXpText: document.querySelector("#profileXpText"),
  profileQuote: document.querySelector("#profileQuote"),
  profileBio: document.querySelector("#profileBio"),
  profileLocation: document.querySelector("#profileLocation"),
  profileAge: document.querySelector("#profileAge"),
  profileTag: document.querySelector("#profileTag"),
  metricWatched: document.querySelector("#metricWatched"),
  metricPlan: document.querySelector("#metricPlan"),
  metricFavorites: document.querySelector("#metricFavorites"),
  metricHours: document.querySelector("#metricHours"),
  statHours: document.querySelector("#statHours"),
  profileCompletedGrid: document.querySelector("#profileCompletedGrid"),
  profileAnimeFavorites: document.querySelector("#profileAnimeFavorites"),
  profileWishlist: document.querySelector("#profileWishlist"),
  profileFavoriteCharacters: document.querySelector("#profileFavoriteCharacters"),
  characterResultsSection: document.querySelector("#characterResultsSection"),
  characterResults: document.querySelector("#characterResults"),
  characterResultCount: document.querySelector("#characterResultCount"),
  profileResultsSection: document.querySelector("#profileResultsSection"),
  profileResults: document.querySelector("#profileResults"),
  profileResultCount: document.querySelector("#profileResultCount"),
  statList: document.querySelector(".stat-list"),
  heroXpText: document.querySelector("#heroXpText"),
  heroXpFill: document.querySelector("#heroXpFill"),
  editorLevel: document.querySelector("#editorLevel"),
  editorXp: document.querySelector("#editorXp"),
  profileUsernameStatus: document.querySelector("#profileUsernameStatus"),
  profileChatButton: document.querySelector("[data-open-chat]"),
  unlockedTags: document.querySelector("#unlockedTags"),
  avatarGallery: document.querySelector("#avatarGallery"),
  bannerGallery: document.querySelector("#bannerGallery"),
  avatarPreview: document.querySelector("#avatarPreview"),
  bannerPreview: document.querySelector("#bannerPreview"),
  chatDock: document.querySelector("#chatDock"),
  chatBubble: document.querySelector("#chatBubble"),
  chatBubbleAvatar: document.querySelector("#chatBubbleAvatar"),
  chatUnreadBadge: document.querySelector("#chatUnreadBadge"),
  chatWindow: document.querySelector("#chatWindow"),
  chatBackButton: document.querySelector("[data-chat-back]"),
  chatVoiceButton: document.querySelector("[data-chat-voice]"),
  chatThreadList: document.querySelector("#chatThreadList"),
  chatAvatar: document.querySelector("#chatAvatar"),
  chatTitle: document.querySelector("#chatTitle"),
  chatSubtitle: document.querySelector("#chatSubtitle"),
  chatMessages: document.querySelector("#chatMessages"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  chatFileInput: document.querySelector("#chatFileInput"),
  callScreen: document.querySelector("#callScreen"),
  callTimer: document.querySelector("#callTimer"),
  callMeAvatar: document.querySelector("#callMeAvatar"),
  callThemAvatar: document.querySelector("#callThemAvatar"),
  callMeName: document.querySelector("#callMeName"),
  callThemName: document.querySelector("#callThemName"),
  callStatus: document.querySelector("#callStatus"),
  callMeRing: document.querySelector("#callMeRing"),
  callThemRing: document.querySelector("#callThemRing"),
  callShareQuality: document.querySelector("#callShareQuality"),
  callShareFps: document.querySelector("#callShareFps"),
  callShareButton: document.querySelector("[data-call-share]"),
  callSharePreview: document.querySelector("#callSharePreview"),
  callShareVideo: document.querySelector("#callShareVideo"),
  callShareLabel: document.querySelector("#callShareLabel"),
  callShareFullscreen: document.querySelector("[data-call-fullscreen]"),
};

let voiceCallInterval = null;
let audioContext = null;
let editorPreviewFrame = 0;
const pendingChatMediaLoads = new Set();

const mediaQuery = `
query AnimeCatalog(
  $page: Int,
  $perPage: Int,
  $search: String,
  $genre: String,
  $seasonYear: Int,
  $status: MediaStatus,
  $sort: [MediaSort]
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      hasNextPage
    }
    media(
      type: ANIME,
      isAdult: false,
      search: $search,
      genre: $genre,
      seasonYear: $seasonYear,
      status: $status,
      sort: $sort
    ) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        extraLarge
        color
      }
      bannerImage
      description(asHtml: false)
      episodes
      duration
      status
      season
      seasonYear
      genres
      averageScore
      popularity
      format
      trailer {
        id
        site
        thumbnail
      }
      recommendations(sort: RATING_DESC, perPage: 6) {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
      characters(sort: FAVOURITES_DESC, perPage: 6) {
        nodes {
          id
          name {
            full
            native
          }
          image {
            large
          }
          favourites
        }
      }
    }
  }
}`;

const genreQuery = `
query GenreCollection {
  GenreCollection
}`;

const characterSearchQuery = `
query CharacterSearch($page: Int, $perPage: Int, $search: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      hasNextPage
    }
    characters(search: $search, sort: FAVOURITES_DESC) {
      id
      name {
        full
        native
      }
      image {
        large
      }
      favourites
      media(type: ANIME, sort: POPULARITY_DESC, perPage: 3) {
        nodes {
          id
          title {
            romaji
            english
          }
        }
      }
    }
  }
}`;

const animeCharactersQuery = `
query AnimeCharacters($id: Int, $page: Int, $perPage: Int) {
  Media(id: $id, type: ANIME) {
    characters(page: $page, perPage: $perPage, sort: FAVOURITES_DESC) {
      pageInfo {
        total
        currentPage
        hasNextPage
      }
      nodes {
        id
        name {
          full
          native
        }
        image {
          large
        }
        favourites
      }
    }
  }
}`;

document.addEventListener("DOMContentLoaded", async () => {
  populateYears();
  populateGenres(FALLBACK_GENRES);
  loadGenres();
  await prepareProfileMedia();
  hydrateProfile();
  reserveCurrentUsername();
  ensureBotProfile();
  ensurePublicChats();
  bindEvents();
  renderLocalLists();
  setAdMode(state.adMode);
  startLevelProgression();
  boot();
});

async function boot() {
  renderGridSkeleton();
  const cached = await loadCache();

  if (cached) {
    if (Array.isArray(cached.genres) && cached.genres.length) {
      state.genres = cached.genres;
      populateGenres(state.genres);
    }
    applyHomeData(cached.collections.trending, cached.collections.catalog);
    state.cacheGeneratedAt = cached.generatedAt;
    updateCacheStatus("cache");
  }

  try {
    const [trending, catalog] = await Promise.all([
      fetchAnime({ sort: "TRENDING_DESC", page: 1, perPage: TRENDING_PAGE_SIZE }),
      fetchAnime({ sort: state.filters.sort, page: 1, perPage: CATALOG_PAGE_SIZE }),
    ]);
    applyHomeData(trending, catalog);
    updateCacheStatus("live");
  } catch (error) {
    console.warn(error);
    if (!cached) {
      renderError("Não foi possível carregar a AniList agora. Tente atualizar em alguns instantes.");
    } else {
      showToast("AniList offline no momento. Usando cache local.");
    }
  }
}

function applyHomeData(trending, catalog) {
  state.trending = trending.media;
  state.media = catalog.media;
  state.total = catalog.total;
  state.hasNextPage = catalog.hasNextPage;
  state.page = Math.max(1, Math.ceil(catalog.media.length / CATALOG_PAGE_SIZE));
  renderSpotlight(state.trending[0]);
  renderTrendingRail();
  renderGrid();
  updateCatalogMeta();
  ensureBotProfile();
  if (!elements.profileView.hidden) renderProfileView();
}

async function loadCache() {
  try {
    const response = await fetch(CACHE_URL, { cache: "no-store" });
    if (!response.ok) return null;
    const cache = await response.json();
    if (!cache?.collections?.trending?.media?.length || !cache?.collections?.catalog?.media?.length) {
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

async function loadGenres() {
  try {
    const data = await requestAniList(genreQuery);
    const genres = data?.GenreCollection?.filter(Boolean);
    if (genres?.length) {
      state.genres = genres;
      populateGenres(genres);
    }
  } catch {
    populateGenres(FALLBACK_GENRES);
  }
}

async function requestAniList(query, variables = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ANILIST_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`AniList respondeu com ${response.status}`);
    }

    const payload = await response.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((item) => item.message).join(", "));
    }
    return payload.data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("A AniList demorou demais para responder. Tente novamente.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function populateGenres(genres = FALLBACK_GENRES) {
  const selected = elements.genreFilter.value;
  const options = ['<option value="">Todos</option>']
    .concat([...new Set(genres)].sort((a, b) => a.localeCompare(b)).map((genre) => `<option>${escapeHtml(genre)}</option>`));
  elements.genreFilter.innerHTML = options.join("");
  if ([...elements.genreFilter.options].some((option) => option.value === selected)) {
    elements.genreFilter.value = selected;
  }
}

function addSearchHistory(query) {
  const term = String(query || "").trim();
  if (!term) return;
  state.searchHistory = [term, ...state.searchHistory.filter((item) => item.toLowerCase() !== term.toLowerCase())]
    .slice(0, SEARCH_HISTORY_LIMIT);
  writeStore(SEARCH_HISTORY_KEY, state.searchHistory);
}

function renderSearchHistory() {
  if (!elements.searchHistoryPanel || !elements.searchHistoryList) return;
  const current = elements.searchInput.value.trim().toLowerCase();
  const items = state.searchHistory.filter((item) => !current || item.toLowerCase().includes(current)).slice(0, SEARCH_HISTORY_LIMIT);

  if (!items.length) {
    elements.searchHistoryPanel.hidden = true;
    elements.searchHistoryList.innerHTML = "";
    return;
  }

  elements.searchHistoryPanel.hidden = false;
  elements.searchHistoryList.innerHTML = items
    .map(
      (item) => `
        <button class="search-history-item" type="button" data-search-history="${escapeHtml(item)}">
          <strong>${escapeHtml(item)}</strong>
        </button>
      `,
    )
    .join("");
}

function hideSearchHistory() {
  if (elements.searchHistoryPanel) elements.searchHistoryPanel.hidden = true;
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    awardXp(14, "busca");
    state.filters.search = elements.searchInput.value.trim();
    addSearchHistory(state.filters.search);
    hideSearchHistory();
    state.page = 1;
    loadCatalog();
  });

  elements.searchInput.addEventListener("focus", renderSearchHistory);
  elements.searchInput.addEventListener("input", renderSearchHistory);
  elements.clearSearchHistory?.addEventListener("click", () => {
    state.searchHistory = [];
    writeStore(SEARCH_HISTORY_KEY, state.searchHistory);
    renderSearchHistory();
    showToast("Histórico de pesquisa limpo");
  });
  elements.searchHistoryList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-search-history]");
    if (!button) return;
    elements.searchInput.value = button.dataset.searchHistory;
    elements.searchForm.requestSubmit();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-shell")) hideSearchHistory();
  });

  [elements.genreFilter, elements.yearFilter, elements.statusFilter, elements.sortFilter].forEach((control) => {
    control.addEventListener("change", () => {
      awardXp(8, "filtro");
      state.filters.genre = elements.genreFilter.value;
      state.filters.year = elements.yearFilter.value;
      state.filters.status = elements.statusFilter.value;
      state.filters.sort = elements.sortFilter.value;
      state.page = 1;
      loadCatalog();
    });
  });

  elements.loadMoreButton.addEventListener("click", () => {
    if (!state.hasNextPage) return;
    awardXp(10, "catálogo");
    state.page += 1;
    loadCatalog({ append: true });
  });

  document.querySelectorAll("[data-quick-trending]").forEach((button) => {
    button.addEventListener("click", () => {
      awardXp(8, "trending");
      closeProfileView();
      elements.searchInput.value = "";
      state.filters = {
        search: "",
        genre: "",
        year: "",
        status: "",
        sort: "TRENDING_DESC",
      };
      elements.genreFilter.value = "";
      elements.yearFilter.value = "";
      elements.statusFilter.value = "";
      elements.sortFilter.value = "TRENDING_DESC";
      state.characterResults = [];
      state.profileResults = [];
      renderCharacterSearchResults();
      renderProfileSearchResults();
      hideSearchHistory();
      state.page = 1;
      loadCatalog();
      document.querySelector(".catalog-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-open-profile]").forEach((button) => {
    button.addEventListener("click", () => openProfileView());
  });

  document.querySelectorAll("[data-close-profile]").forEach((button) => {
    button.addEventListener("click", closeProfileView);
  });

  document.querySelector("[data-scroll-favorites]")?.addEventListener("click", () => {
    document.querySelector("#favoritesList")?.closest(".list-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.querySelector("[data-show-notifications]")?.addEventListener("click", () => {
    showToast("Sem novas notificações por enquanto.");
  });

  document.querySelectorAll("[data-edit-profile]").forEach((button) => {
    button.addEventListener("click", openProfileEditor);
  });

  const profileNavigationButtons = document.querySelectorAll(".profile-nav-item");
  profileNavigationButtons[3]?.addEventListener("click", () => {
    closeProfileView();
    document.querySelector(".filters-band")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => elements.genreFilter?.focus(), 420);
  });
  profileNavigationButtons[4]?.addEventListener("click", openProfileEditor);

  const profileTabTargets = [".profile-hero-card", ".profile-section-completed", ".profile-section-wishlist", "#profileFavoriteCharacters"];
  document.querySelectorAll(".profile-tabs button").forEach((button, index) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(profileTabTargets[index]);
      if (!target) return;
      document.querySelectorAll(".profile-tabs button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelector(".profile-aside .profile-info-card:nth-child(2) .text-link")?.addEventListener("click", () => {
    document.querySelector(".profile-metrics")?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Estatísticas do perfil atualizadas");
  });

  document.querySelectorAll("[data-close-editor]").forEach((button) => {
    button.addEventListener("click", closeProfileEditor);
  });

  document.querySelector("[data-reset-profile]")?.addEventListener("click", () => {
    state.profile = { ...DEFAULT_PROFILE };
    saveProfile();
    fillProfileForm();
    showToast("Perfil restaurado");
  });

  document.querySelector("[data-share-profile]")?.addEventListener("click", async () => {
    const profile = getViewedProfile();
    const text = `${profile.name || DEFAULT_PROFILE.name} no AniPulse - ${location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link do perfil copiado");
    } catch {
      showToast("Perfil pronto para compartilhar");
    }
  });

  elements.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(elements.profileForm);
    const nextUsername = normalizeUsername(form.get("username"));
    const usernameCheck = validateUsername(nextUsername, state.profile.username);
    const previousUsername = state.profile.username;

    if (!usernameCheck.ok) {
      elements.profileUsernameStatus.textContent = usernameCheck.message;
      elements.profileUsernameStatus.classList.add("is-error");
      return;
    }

    const nextTag = String(form.get("tag") || DEFAULT_PROFILE.tag);
    const unlockedTags = getUnlockedTags();
    state.profile = {
      ...state.profile,
      name: String(form.get("name") || DEFAULT_PROFILE.name).trim().slice(0, 24),
      username: nextUsername,
      status: normalizeStatus(form.get("status")),
      age: clampNumber(form.get("age"), 1, 120, DEFAULT_PROFILE.age),
      hideAge: form.get("hideAge") === "on",
      country: String(form.get("country") || DEFAULT_PROFILE.country).trim().slice(0, 32),
      stateRegion: String(form.get("stateRegion") || "").trim().slice(0, 32),
      hideLocation: form.get("hideLocation") === "on",
      hideChatBubble: form.get("hideChatBubble") === "on",
      tag: unlockedTags.includes(nextTag) ? nextTag : getUnlockedTags()[0],
      avatar: String(form.get("avatar") || "").trim(),
      avatarX: clampNumber(form.get("avatarX"), 0, 100, DEFAULT_PROFILE.avatarX),
      avatarY: clampNumber(form.get("avatarY"), 0, 100, DEFAULT_PROFILE.avatarY),
      banner: String(form.get("banner") || "").trim(),
      bannerX: clampNumber(form.get("bannerX"), 0, 100, DEFAULT_PROFILE.bannerX),
      bannerY: clampNumber(form.get("bannerY"), 0, 100, DEFAULT_PROFILE.bannerY),
      quote: String(form.get("quote") || DEFAULT_PROFILE.quote).trim().slice(0, 96),
      bio: String(form.get("bio") || DEFAULT_PROFILE.bio).trim().slice(0, 240),
    };
    syncUsernameRegistry(previousUsername, state.profile.username);
    awardXp(30, "perfil", { silent: true });
    saveProfile();
    closeProfileEditor();
    showToast("Perfil salvo");
  });

  elements.profileForm.elements.username.addEventListener("input", () => {
    const result = validateUsername(normalizeUsername(elements.profileForm.elements.username.value), state.profile.username);
    elements.profileUsernameStatus.textContent = result.message;
    elements.profileUsernameStatus.classList.toggle("is-error", !result.ok);
  });

  ["avatar", "avatarX", "avatarY", "banner", "bannerX", "bannerY"].forEach((name) => {
    elements.profileForm.elements[name].addEventListener("input", scheduleEditorPreviewUpdate);
  });

  elements.profileForm.elements.avatarFile.addEventListener("change", () => {
    handleDeviceImage(elements.profileForm.elements.avatarFile, "avatar");
  });

  elements.profileForm.elements.bannerFile.addEventListener("change", () => {
    handleDeviceImage(elements.profileForm.elements.bannerFile, "banner");
  });

  elements.profileName.addEventListener("input", () => {
    const value = elements.profileName.value.trim();
    state.profile.name = value || DEFAULT_PROFILE.name;
    saveProfile();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.profileEditor.hidden) {
      closeProfileEditor();
    }
  });

  elements.refreshButton.addEventListener("click", () => {
    awardXp(6, "atualização");
    showToast("Atualizando catálogo");
    boot();
  });

  document.querySelectorAll("[data-close-details]").forEach((button) => {
    button.addEventListener("click", closeDetails);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.detailsShell.hidden) {
      closeDetails();
    }
  });

  document.querySelectorAll("[data-ad-mode]").forEach((button) => {
    button.addEventListener("click", () => setAdMode(button.dataset.adMode));
  });

  elements.closeStickyAd.addEventListener("click", () => {
    elements.stickyAd.classList.add("is-hidden");
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    elements.installButton.hidden = true;
  });

  bindChatEvents();
}

function openProfileView(profile = null) {
  const isDirectoryProfile = profile && typeof profile === "object" && "id" in profile && "username" in profile;
  state.viewedProfile = isDirectoryProfile && profile.id !== state.profile.id ? normalizeDirectoryProfile(profile) : null;
  renderProfileView();
  elements.homeView.hidden = true;
  elements.profileView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeProfileView() {
  if (!elements.profileView || elements.profileView.hidden) return;
  elements.profileView.hidden = true;
  elements.homeView.hidden = false;
  state.viewedProfile = null;
}

function openProfileEditor() {
  if (!isViewingLocalProfile()) return;
  fillProfileForm();
  elements.profileEditor.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeProfileEditor() {
  if (editorPreviewFrame) {
    window.cancelAnimationFrame(editorPreviewFrame);
    editorPreviewFrame = 0;
  }
  elements.profileEditor.hidden = true;
  document.body.style.overflow = elements.detailsShell.hidden ? "" : "hidden";
}

function fillProfileForm() {
  const form = elements.profileForm;
  renderStyleOptions();
  renderMediaGalleries();
  form.elements.name.value = state.profile.name;
  form.elements.username.value = state.profile.username;
  form.elements.status.value = normalizeStatus(state.profile.status);
  form.elements.age.value = state.profile.age;
  form.elements.hideAge.checked = Boolean(state.profile.hideAge);
  form.elements.country.value = state.profile.country;
  form.elements.stateRegion.value = state.profile.stateRegion;
  form.elements.hideLocation.checked = Boolean(state.profile.hideLocation);
  form.elements.hideChatBubble.checked = Boolean(state.profile.hideChatBubble);
  form.elements.tag.value = state.profile.tag;
  form.elements.avatar.value = state.profile.avatar;
  form.elements.avatarX.value = state.profile.avatarX;
  form.elements.avatarY.value = state.profile.avatarY;
  form.elements.banner.value = state.profile.banner;
  form.elements.bannerX.value = state.profile.bannerX;
  form.elements.bannerY.value = state.profile.bannerY;
  form.elements.quote.value = state.profile.quote;
  form.elements.bio.value = state.profile.bio;
  elements.editorLevel.textContent = `Nível ${state.profile.level}`;
  elements.editorXp.textContent = getXpLabel();
  elements.profileUsernameStatus.textContent = validateUsername(state.profile.username, state.profile.username).message;
  elements.profileUsernameStatus.classList.remove("is-error");
  updateLevelBadgeStyles();
  updateEditorPreviews();
}

function saveProfile() {
  reserveCurrentUsername();
  writeStore("anipulse:profileData", state.profile);
  localStorage.setItem("anipulse:profile", state.profile.name);
  publishProfile();
  applyProfile();
  if (!elements.profileView.hidden) renderProfileView();
  renderChatDock();
}

function applyProfile() {
  const avatar = getProfileAvatar();
  const avatarPosition = getAvatarPosition();
  const name = state.profile.name || DEFAULT_PROFILE.name;
  const level = `Nível ${state.profile.level ?? DEFAULT_PROFILE.level}`;

  elements.profileName.value = name;
  elements.accountName.textContent = name;
  elements.accountLevel.textContent = level;
  elements.accountAvatar.src = avatar;
  elements.accountAvatar.style.objectPosition = avatarPosition;
  elements.heroProfileAvatar.src = avatar;
  elements.heroProfileAvatar.style.objectPosition = avatarPosition;
  elements.heroProfileName.textContent = name;
  elements.heroProfileLevel.textContent = level;
  updateStatusDots();
  updateXpDisplay();
  updateProfileCounters();
}

function renderProfileView() {
  applyProfileText();
  renderProfileAnimeSections();
  renderProfileFavoriteCharacters();
}

function applyProfileText() {
  const profile = getViewedProfile();
  const local = isViewingLocalProfile();
  const avatar = getProfileAvatarFor(profile);
  const avatarPosition = getAvatarPositionFor(profile);
  const bannerPosition = getBannerPositionFor(profile);
  const name = profile.name || DEFAULT_PROFILE.name;
  const username = normalizeUsername(profile.username);
  const level = `Nível ${profile.level ?? DEFAULT_PROFILE.level}`;

  elements.profileBanner.style.backgroundImage = getProfileBannerBackground();
  elements.profileBanner.style.backgroundPosition = `center, ${bannerPosition}`;
  const bannerSource = getProfileBannerSourceFor(profile);
  if (elements.profileBannerImage) {
    elements.profileBannerImage.hidden = !bannerSource;
    elements.profileBannerImage.src = bannerSource || "";
    elements.profileBannerImage.style.objectPosition = bannerPosition;
  }
  elements.profileAvatar.src = avatar;
  elements.profileAvatar.style.objectPosition = avatarPosition;
  elements.profileTitle.textContent = name;
  elements.profileLevelBadge.textContent = level;
  elements.profileHandle.textContent = `@${username}`;
  elements.profileMember.textContent = `Membro desde ${formatMemberDate(profile.firstSeenAt)}`;
  elements.profileXpText.textContent = local ? getXpLabel() : `Nível ${profile.level || 0} no AniPulse`;
  elements.profileQuote.textContent = profile.quote || DEFAULT_PROFILE.quote;
  elements.profileBio.textContent = profile.bio || "Este perfil ainda não escreveu uma bio.";
  elements.profileLocation.textContent = profile.hideLocation ? "Localização oculta" : getLocationLabelFor(profile);
  elements.profileAge.textContent = profile.hideAge ? "Idade oculta" : `${profile.age || DEFAULT_PROFILE.age} anos`;
  elements.profileTag.textContent = profile.tag || DEFAULT_PROFILE.tag;
  elements.profileView.querySelectorAll("[data-edit-profile]").forEach((button) => {
    button.hidden = !local;
  });
  if (elements.profileChatButton) {
    elements.profileChatButton.hidden = local;
    elements.profileChatButton.disabled = Boolean(profile.hideChatBubble);
    elements.profileChatButton.textContent = profile.hideChatBubble ? "Chat oculto" : "Chat";
  }
  updateLevelBadgeStyles();
  updateStatusDots();
  updateProfileCounters();
}

function updateXpDisplay() {
  const goal = getXpGoal(state.profile.level);
  const percent = state.profile.level >= PROFILE_MAX_LEVEL ? 100 : Math.min(100, Math.round((state.profile.xp / goal) * 100));
  const label = getXpLabel();

  if (elements.heroXpText) elements.heroXpText.textContent = label;
  if (elements.heroXpFill) elements.heroXpFill.style.width = `${percent}%`;
  if (elements.profileXpText) elements.profileXpText.textContent = label;
  if (elements.editorLevel) elements.editorLevel.textContent = `Nível ${state.profile.level}`;
  if (elements.editorXp) elements.editorXp.textContent = label;
  updateLevelBadgeStyles();
}

function getXpGoal(level = state.profile.level) {
  return 120 + Number(level || 0) * 80;
}

function getXpLabel() {
  if (state.profile.level >= PROFILE_MAX_LEVEL) {
    return "Nível máximo · Supremo";
  }
  return `${Number(state.profile.xp || 0).toLocaleString("pt-BR")} / ${getXpGoal().toLocaleString("pt-BR")} XP`;
}

function awardXp(amount, reason = "atividade", options = {}) {
  const now = Date.now();
  state.profile.interactions = Number(state.profile.interactions || 0) + 1;
  if (state.profile.level >= PROFILE_MAX_LEVEL) {
    state.profile.level = PROFILE_MAX_LEVEL;
    state.profile.xp = 0;
    localStorage.setItem(XP_SAVE_KEY, String(now));
    saveProfile();
    return;
  }

  state.profile.xp = Number(state.profile.xp || 0) + amount;

  let leveledUp = false;
  while (state.profile.level < PROFILE_MAX_LEVEL && state.profile.xp >= getXpGoal(state.profile.level)) {
    state.profile.xp -= getXpGoal(state.profile.level);
    state.profile.level += 1;
    leveledUp = true;
  }
  if (state.profile.level >= PROFILE_MAX_LEVEL) {
    state.profile.level = PROFILE_MAX_LEVEL;
    state.profile.xp = 0;
  }

  localStorage.setItem(XP_SAVE_KEY, String(now));
  saveProfile();

  if (leveledUp) {
    if (!elements.profileEditor.hidden) renderStyleOptions();
    showToast(`Nível ${state.profile.level} desbloqueado. Novas tags disponíveis.`);
  } else if (!options.silent && amount >= 10) {
    showToast(`+${amount} XP por ${reason}`);
  }
}

function createStyleTags() {
  const tags = [];
  for (let level = 0; level <= PROFILE_MAX_LEVEL; level += 1) {
    const tier = TAG_TIERS.find((item) => level >= item.min && level <= item.max) || TAG_TIERS[0];
    tier.labels.forEach((label) => {
      tags.push({
        level,
        label: level === 0 ? label : `${label} ${level}`,
      });
    });
  }
  return tags;
}

function getLevelTierClass(level = state.profile.level) {
  const safeLevel = clampNumber(level, 0, PROFILE_MAX_LEVEL, 0);
  if (safeLevel >= PROFILE_MAX_LEVEL) return "level-tier-supreme";
  if (safeLevel >= 41) return "level-tier-41";
  if (safeLevel >= 31) return "level-tier-31";
  if (safeLevel >= 21) return "level-tier-21";
  if (safeLevel >= 11) return "level-tier-11";
  if (safeLevel >= 1) return "level-tier-1";
  return "level-tier-0";
}

function applyLevelClass(element, level = state.profile.level) {
  if (!element) return;
  element.classList.add("level-pill");
  element.classList.remove(
    "level-tier-0",
    "level-tier-1",
    "level-tier-11",
    "level-tier-21",
    "level-tier-31",
    "level-tier-41",
    "level-tier-supreme",
  );
  element.classList.add(getLevelTierClass(level));
}

function updateLevelBadgeStyles() {
  [elements.accountLevel, elements.heroProfileLevel, elements.editorLevel].forEach((element) => {
    applyLevelClass(element, state.profile.level);
  });
  applyLevelClass(elements.profileLevelBadge, getViewedProfile().level);
}

function startLevelProgression() {
  const tick = () => {
    if (document.hidden) return;
    state.profile.onlineSeconds = Number(state.profile.onlineSeconds || 0) + 60;
    awardXp(20, "tempo online", { silent: true });
  };

  setInterval(tick, 60000);
  window.__anipulseAwardXp = (amount = 100) => awardXp(Number(amount), "teste");
}

function getUnlockedTags() {
  return STYLE_TAGS.filter((tag) => tag.level <= state.profile.level).map((tag) => tag.label);
}

function renderStyleOptions() {
  const select = elements.profileForm.elements.tag;
  const levelKey = String(state.profile.level);
  const unlocked = getUnlockedTags();

  if (select.dataset.renderedLevel !== levelKey) {
    select.innerHTML = STYLE_TAGS.map((tag) => {
      const disabled = tag.level > state.profile.level ? "disabled" : "";
      const label = tag.level > state.profile.level ? `${tag.label} - nível ${tag.level}` : tag.label;
      return `<option value="${escapeHtml(tag.label)}" ${disabled}>${escapeHtml(label)}</option>`;
    }).join("");
    select.dataset.renderedLevel = levelKey;
  }

  if (!unlocked.includes(state.profile.tag)) {
    state.profile.tag = unlocked.at(-1) || DEFAULT_PROFILE.tag;
  }

  elements.unlockedTags.textContent = `${unlocked.length} tags liberadas. Próxima: ${getNextTagLabel()}`;
}

function getNextTagLabel() {
  const next = STYLE_TAGS.find((tag) => tag.level > state.profile.level);
  return next ? `${next.label} no nível ${next.level}` : "todas desbloqueadas";
}

function renderMediaGalleries() {
  if (!elements.avatarGallery || !elements.bannerGallery) return;

  const gallery = getGalleryImages();
  elements.avatarGallery.innerHTML = gallery
    .map((image, index) => renderGalleryButton(image, index, "avatar"))
    .join("");
  elements.bannerGallery.innerHTML = gallery
    .map((image, index) => renderGalleryButton(image, index, "banner"))
    .join("");

  elements.avatarGallery.querySelectorAll("[data-gallery-src]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.profileForm.elements.avatar.value = button.dataset.gallerySrc;
      scheduleEditorPreviewUpdate();
    });
  });

  elements.bannerGallery.querySelectorAll("[data-gallery-src]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.profileForm.elements.banner.value = button.dataset.gallerySrc;
      scheduleEditorPreviewUpdate();
    });
  });
}

function scheduleEditorPreviewUpdate() {
  if (editorPreviewFrame) return;
  editorPreviewFrame = window.requestAnimationFrame(() => {
    editorPreviewFrame = 0;
    updateEditorPreviews();
  });
}

async function handleDeviceImage(input, target) {
  const file = input.files?.[0];
  if (!file) return;

  const maxSize = target === "banner" ? 15 * 1024 * 1024 : 4 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast(target === "banner" ? "Banner muito grande. Use até 15 MB." : "Avatar muito grande. Use até 4 MB.");
    input.value = "";
    return;
  }

  try {
    const mediaRef = await saveProfileMediaFile(target, file);
    elements.profileForm.elements[target].value = mediaRef;
    updateEditorPreviews();
    showToast(target === "banner" ? "Banner carregado do dispositivo" : "Avatar carregado do dispositivo");
  } catch (error) {
    console.error(error);
    showToast("Não consegui salvar essa imagem do dispositivo.");
  } finally {
    input.value = "";
  }
}

async function prepareProfileMedia() {
  let migrated = false;

  for (const target of Object.keys(PROFILE_MEDIA_KEYS)) {
    const value = state.profile[target];

    if (isInlineProfileMedia(value)) {
      try {
        const blob = await fetch(value).then((response) => response.blob());
        await saveProfileMediaBlob(target, blob);
        state.profile[target] = getProfileMediaRef(target);
        migrated = true;
      } catch (error) {
        console.error(error);
        state.profileMedia[target] = value;
      }
      continue;
    }

    if (isProfileMediaRef(value, target)) {
      await loadProfileMediaAsset(target);
    }
  }

  if (migrated) {
    writeStore("anipulse:profileData", state.profile);
  }
}

async function saveProfileMediaFile(target, file) {
  await saveProfileMediaBlob(target, file);
  return getProfileMediaRef(target);
}

async function saveProfileMediaBlob(target, blob) {
  const key = PROFILE_MEDIA_KEYS[target];
  if (!key) throw new Error("Tipo de mídia inválido.");

  setProfileMediaObjectUrl(target, blob);
  const db = await openProfileMediaDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(PROFILE_MEDIA_STORE, "readwrite");
    transaction.objectStore(PROFILE_MEDIA_STORE).put({
      id: key,
      blob,
      type: blob.type || "image/*",
      updatedAt: new Date().toISOString(),
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function loadProfileMediaAsset(target) {
  const key = PROFILE_MEDIA_KEYS[target];
  if (!key) return false;

  try {
    const db = await openProfileMediaDb();
    const item = await new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILE_MEDIA_STORE, "readonly");
      const request = transaction.objectStore(PROFILE_MEDIA_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!item?.blob) return false;
    setProfileMediaObjectUrl(target, item.blob);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function openProfileMediaDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROFILE_MEDIA_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROFILE_MEDIA_STORE)) {
        db.createObjectStore(PROFILE_MEDIA_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function setProfileMediaObjectUrl(target, blob) {
  if (state.profileMediaObjectUrls[target]) {
    URL.revokeObjectURL(state.profileMediaObjectUrls[target]);
  }

  const objectUrl = URL.createObjectURL(blob);
  state.profileMediaObjectUrls[target] = objectUrl;
  state.profileMedia[target] = objectUrl;
}

function getProfileMediaRef(target) {
  return `${PROFILE_MEDIA_REF_PREFIX}${target}`;
}

function isProfileMediaRef(value, target = "") {
  const text = String(value || "");
  if (!text.startsWith(PROFILE_MEDIA_REF_PREFIX)) return false;
  return target ? text === getProfileMediaRef(target) : true;
}

function isInlineProfileMedia(value) {
  return /^data:image\//i.test(String(value || ""));
}

function resolveProfileMedia(value, target) {
  if (isProfileMediaRef(value, target)) {
    return state.profileMedia[target] || "";
  }
  return String(value || "").trim();
}

function renderGalleryButton(src, index, type) {
  const isSelected = (type === "avatar" ? getProfileAvatar() : state.profile.banner) === src;
  return `
    <button class="gallery-option ${isSelected ? "is-selected" : ""}" type="button" data-gallery-src="${escapeHtml(src)}" aria-label="Selecionar imagem ${index + 1}">
      <img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" />
    </button>
  `;
}

function getGalleryImages() {
  const images = [
    DEFAULT_PROFILE_IMAGE,
    ...state.trending.map((anime) => imageFor(anime, "large")),
    ...state.media.map((anime) => imageFor(anime, "large")),
    ...state.trending.map((anime) => anime.bannerImage).filter(Boolean),
  ];
  return [...new Set(images)].slice(0, 14);
}

function updateEditorPreviews() {
  const form = elements.profileForm;
  const avatar = resolveProfileMedia(form.elements.avatar.value, "avatar") || DEFAULT_PROFILE_IMAGE;
  const banner = resolveProfileMedia(form.elements.banner.value, "banner");
  const avatarX = clampNumber(form.elements.avatarX.value, 0, 100, state.profile.avatarX);
  const avatarY = clampNumber(form.elements.avatarY.value, 0, 100, state.profile.avatarY);
  const bannerX = clampNumber(form.elements.bannerX.value, 0, 100, state.profile.bannerX);
  const bannerY = clampNumber(form.elements.bannerY.value, 0, 100, state.profile.bannerY);

  elements.avatarPreview.src = avatar;
  elements.avatarPreview.style.objectPosition = `${avatarX}% ${avatarY}%`;
  elements.bannerPreview.style.backgroundImage = banner
    ? `linear-gradient(90deg, rgba(5, 6, 12, 0.35), rgba(5, 6, 12, 0.1)), url("${escapeCssUrl(banner)}")`
    : getProfileBannerBackground();
  elements.bannerPreview.style.backgroundPosition = `${bannerX}% ${bannerY}%`;
}

function validateUsername(username, currentUsername = "") {
  if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) {
    return { ok: false, message: "Use 3 a 24 letras, números, ponto, traço ou underline." };
  }

  const reserved = readStore(PROFILE_REGISTRY_KEY, {});
  const owner = reserved[username.toLowerCase()];

  if (owner && owner !== state.profile.id && username !== currentUsername) {
    return { ok: false, message: "Esse usuário já está em uso." };
  }

  return { ok: true, message: "Usuário disponível." };
}

function reserveCurrentUsername() {
  const registry = readStore(PROFILE_REGISTRY_KEY, {});
  registry[state.profile.username.toLowerCase()] = state.profile.id;
  writeStore(PROFILE_REGISTRY_KEY, registry);
}

function syncUsernameRegistry(previousUsername, nextUsername) {
  const registry = readStore(PROFILE_REGISTRY_KEY, {});
  if (previousUsername && previousUsername.toLowerCase() !== nextUsername.toLowerCase()) {
    delete registry[previousUsername.toLowerCase()];
  }
  registry[nextUsername.toLowerCase()] = state.profile.id;
  writeStore(PROFILE_REGISTRY_KEY, registry);
}

function publishProfile() {
  const directory = getProfileDirectory().filter((profile) => profile.id !== state.profile.id);
  const status = normalizeStatus(state.profile.status);
  directory.unshift({
    id: state.profile.id,
    name: state.profile.name || DEFAULT_PROFILE.name,
    username: normalizeUsername(state.profile.username),
    status,
    level: state.profile.level || 0,
    tag: state.profile.tag || DEFAULT_PROFILE.tag,
    firstSeenAt: state.profile.firstSeenAt,
    age: state.profile.age,
    hideAge: Boolean(state.profile.hideAge),
    country: state.profile.country,
    stateRegion: state.profile.stateRegion,
    hideLocation: Boolean(state.profile.hideLocation),
    hideChatBubble: Boolean(state.profile.hideChatBubble),
    quote: state.profile.quote,
    bio: state.profile.bio,
    avatar: getProfileAvatar(),
    avatarX: state.profile.avatarX,
    avatarY: state.profile.avatarY,
    banner: getProfileBannerSource(),
    bannerX: state.profile.bannerX,
    bannerY: state.profile.bannerY,
    completed: state.completed.map(compactProfileAnime).slice(0, 120),
    favorites: state.favorites.map(compactProfileAnime).slice(0, 120),
    wishlist: state.wishlist.map(compactProfileAnime).slice(0, 120),
    favoriteCharacters: state.favoriteCharacters.map(compactCharacter).slice(0, 120),
  });
  writeStore(PROFILE_DIRECTORY_KEY, directory.slice(0, 200));
}

function getProfileDirectory() {
  const directory = readStore(PROFILE_DIRECTORY_KEY, [])
    .filter((profile) => profile?.id && profile?.username)
    .map(normalizeDirectoryProfile);
  return directory.some((profile) => profile.id === BOT_PROFILE_ID)
    ? directory
    : [createBotProfile(), ...directory];
}

function ensureBotProfile() {
  const directory = getProfileDirectory().filter((profile) => profile.id !== BOT_PROFILE_ID);
  writeStore(PROFILE_DIRECTORY_KEY, [createBotProfile(), ...directory].slice(0, 200));
}

function createBotProfile() {
  const animePool = [...state.trending, ...state.media, ...state.favorites, ...state.wishlist].filter(Boolean).filter(uniqueById);
  const favorites = animePool.slice(0, 6).map(compactProfileAnime);
  const completed = animePool.slice(6, 12).map(compactProfileAnime);
  const wishlist = animePool.slice(12, 18).map(compactProfileAnime);
  return normalizeDirectoryProfile({
    id: BOT_PROFILE_ID,
    name: "Yui Bot",
    username: "yui_bot",
    status: "online",
    level: 50,
    tag: "Supremo AniPulse",
    firstSeenAt: "2026-05-01T00:00:00.000Z",
    age: 0,
    hideAge: true,
    country: "AniPulse",
    stateRegion: "Chat Lab",
    hideLocation: false,
    hideChatBubble: false,
    quote: "Pode testar o chat comigo.",
    bio: "Bot local de teste para mensagens, anexos, ligação e menções de anime.",
    avatar: DEFAULT_PROFILE_IMAGE,
    avatarX: 50,
    avatarY: 35,
    banner: state.trending[0]?.bannerImage || state.media[0]?.bannerImage || "",
    bannerX: 50,
    bannerY: 50,
    completed,
    favorites,
    wishlist,
    favoriteCharacters: [],
  });
}

function isBotProfile(profile = state.activeChatProfile) {
  return profile?.id === BOT_PROFILE_ID;
}

function ensurePublicChats() {
  state.publicChats = normalizePublicChats(readStore(PUBLIC_CHATS_KEY, []));
  savePublicChats();
}

function normalizePublicChats(chats) {
  const source = Array.isArray(chats) && chats.length ? chats : [createDefaultPublicChat()];
  return source.map(normalizePublicChat).filter(Boolean);
}

function createDefaultPublicChat() {
  return {
    id: "global-anipulse",
    name: "AniPulse Global",
    slug: "anipulse-global",
    description: "Chat público local para testar busca, entrada e chamadas em grupo.",
    icon: DEFAULT_PROFILE_IMAGE,
    createdAt: new Date().toISOString(),
    ownerId: BOT_PROFILE_ID,
    call: null,
    members: [
      ...PUBLIC_CHAT_FIXTURE_MEMBERS,
      {
        id: state.profile.id,
        name: state.profile.name || DEFAULT_PROFILE.name,
        username: normalizeUsername(state.profile.username),
        role: "member",
        avatar: getProfileAvatar(),
      },
    ],
    banned: [],
  };
}

function normalizePublicChat(chat) {
  if (!chat?.id && !chat?.name) return null;
  const id = String(chat.id || createPublicChatId(chat.name));
  const members = Array.isArray(chat.members) ? chat.members.map(normalizePublicMember).filter(Boolean) : [];
  return {
    id,
    name: String(chat.name || "Chat público").trim().slice(0, 42),
    slug: String(chat.slug || slugify(chat.name || id)),
    description: String(chat.description || "").trim().slice(0, 120),
    icon: chat.icon || DEFAULT_PROFILE_IMAGE,
    createdAt: chat.createdAt || new Date().toISOString(),
    ownerId: chat.ownerId || members.find((member) => member.role === "ADM")?.id || state.profile.id,
    members: ensureCurrentPublicMember(id, members, chat.ownerId),
    banned: Array.isArray(chat.banned) ? chat.banned.map(String) : [],
    call: normalizePublicCall(chat.call),
  };
}

function normalizePublicMember(member) {
  if (!member?.id) return null;
  return {
    id: String(member.id),
    name: String(member.name || "Membro").slice(0, 32),
    username: normalizeUsername(member.username || member.name || "membro"),
    role: normalizePublicRole(member.role),
    avatar: member.avatar || DEFAULT_PROFILE_IMAGE,
  };
}

function normalizePublicRole(role) {
  return role === "ADM" || role === "CO" ? role : "member";
}

function normalizePublicCall(call) {
  if (!call?.active) return null;
  return {
    active: true,
    startedAt: call.startedAt || new Date().toISOString(),
    startedBy: call.startedBy || "Sistema",
    participants: Array.isArray(call.participants) ? call.participants.map(normalizePublicCallParticipant).filter(Boolean) : [],
  };
}

function normalizePublicCallParticipant(participant) {
  if (!participant?.id) return null;
  const mode = participant.mode === "speaker" ? "speaker" : "listener";
  return {
    id: String(participant.id),
    name: String(participant.name || "Membro").slice(0, 32),
    avatar: participant.avatar || DEFAULT_PROFILE_IMAGE,
    mode,
    muted: mode === "speaker" && Boolean(participant.muted),
    joinedAt: participant.joinedAt || new Date().toISOString(),
  };
}

function ensureCurrentPublicMember(chatId, members, ownerId) {
  const clean = members.filter((member, index, list) => list.findIndex((item) => item.id === member.id) === index);
  if (ownerId === state.profile.id && !clean.some((member) => member.id === state.profile.id)) {
    clean.push({
      id: state.profile.id,
      name: state.profile.name || DEFAULT_PROFILE.name,
      username: normalizeUsername(state.profile.username),
      role: ownerId === state.profile.id ? "ADM" : "member",
      avatar: getProfileAvatar(),
    });
  }
  return clean.map((member) => member.id === ownerId ? { ...member, role: "ADM" } : member);
}

function savePublicChats() {
  writeStore(PUBLIC_CHATS_KEY, state.publicChats);
}

function createPublicChatId(name) {
  return `${slugify(name || "chat-publico")}-${Date.now().toString(36)}`;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "chat";
}

function getPublicThreadId(chatId) {
  return `${PUBLIC_THREAD_PREFIX}${chatId}`;
}

function isPublicThreadId(threadId) {
  return String(threadId || "").startsWith(PUBLIC_THREAD_PREFIX);
}

function isPublicChatProfile(profile = state.activeChatProfile) {
  return Boolean(profile?.isPublicChat || isPublicThreadId(profile?.id));
}

function getPublicChatIdFromThread(threadId) {
  return String(threadId || "").replace(PUBLIC_THREAD_PREFIX, "");
}

function findPublicChat(chatId) {
  return state.publicChats.find((chat) => chat.id === chatId);
}

function getActivePublicChat() {
  if (!isPublicChatProfile(state.activeChatProfile)) return null;
  return findPublicChat(state.activeChatProfile.publicChatId || getPublicChatIdFromThread(state.activeChatProfile.id));
}

function publicChatToProfile(chat) {
  return {
    id: getPublicThreadId(chat.id),
    name: chat.name,
    username: chat.slug || slugify(chat.name),
    status: chat.call?.active ? "online" : "away",
    avatar: chat.icon || DEFAULT_PROFILE_IMAGE,
    hideChatBubble: false,
    isPublicChat: true,
    publicChatId: chat.id,
  };
}

function getCurrentPublicMember(chat) {
  return chat?.members?.find((member) => member.id === state.profile.id) || null;
}

function getCurrentPublicRole(chat) {
  return normalizePublicRole(getCurrentPublicMember(chat)?.role);
}

function canManagePublicChat(chat) {
  return getCurrentPublicRole(chat) === "ADM";
}

function canStartPublicCall(chat) {
  return ["ADM", "CO"].includes(getCurrentPublicRole(chat));
}

function canModeratePublicCall(chat) {
  return canStartPublicCall(chat);
}

function getPublicMemberRole(chat, memberId) {
  return normalizePublicRole(chat?.members?.find((member) => member.id === memberId)?.role);
}

function canDropPublicCallParticipant(chat, participantId) {
  if (!chat?.call?.active || !participantId || !canModeratePublicCall(chat)) return false;
  if (participantId === state.profile.id) return false;
  const participant = chat.call.participants?.find((item) => item.id === participantId);
  if (!participant || participant.mode !== "speaker") return false;
  const currentRole = getCurrentPublicRole(chat);
  const targetRole = getPublicMemberRole(chat, participantId);
  if (targetRole === "ADM") return false;
  if (currentRole === "CO" && targetRole !== "member") return false;
  return true;
}

function isPublicChatMember(chat) {
  return Boolean(getCurrentPublicMember(chat)) && !chat?.banned?.includes(state.profile.id);
}

function normalizeDirectoryProfile(profile) {
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    username: normalizeUsername(profile.username),
    status: normalizeStatus(profile.status),
    level: clampNumber(profile.level, 0, PROFILE_MAX_LEVEL, 0),
    firstSeenAt: isReasonableFirstSeen(profile.firstSeenAt) ? profile.firstSeenAt : getFirstSeenAt(),
    avatar: profile.avatar || DEFAULT_PROFILE_IMAGE,
    hideChatBubble: Boolean(profile.hideChatBubble),
    isPublicChat: Boolean(profile.isPublicChat),
    publicChatId: profile.publicChatId || "",
    completed: Array.isArray(profile.completed) ? profile.completed : [],
    favorites: Array.isArray(profile.favorites) ? profile.favorites : [],
    wishlist: Array.isArray(profile.wishlist) ? profile.wishlist : [],
    favoriteCharacters: Array.isArray(profile.favoriteCharacters) ? profile.favoriteCharacters : [],
  };
}

function searchProfiles(query) {
  const needle = String(query || "").trim().toLowerCase().replace(/^@+/, "");
  if (!needle) return [];

  return getProfileDirectory()
    .filter((profile) => {
      const name = String(profile.name || "").toLowerCase();
      const username = String(profile.username || "").toLowerCase();
      return name.includes(needle) || username.includes(needle);
    })
    .slice(0, 8);
}

function getFirstSeenAt() {
  const stored = localStorage.getItem(FIRST_SEEN_KEY);
  if (isReasonableFirstSeen(stored)) return stored;

  const now = new Date().toISOString();
  localStorage.setItem(FIRST_SEEN_KEY, now);
  return now;
}

function formatMemberDate(value) {
  const date = isReasonableFirstSeen(value) ? new Date(value) : new Date(getFirstSeenAt());
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function isValidDate(value) {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

function isReasonableFirstSeen(value) {
  if (!isValidDate(value)) return false;
  return new Date(value).getTime() >= new Date(MIN_PROFILE_FIRST_SEEN).getTime();
}

function normalizeStatus(value) {
  const status = String(value || DEFAULT_PROFILE.status);
  return PROFILE_STATUSES[status] ? status : DEFAULT_PROFILE.status;
}

function applyStatusDot(dot, status, large = false) {
  if (!dot) return;
  const safeStatus = normalizeStatus(status);
  dot.className = `status-dot status-${safeStatus}${large ? " status-dot-large" : ""}`;
  dot.title = PROFILE_STATUSES[safeStatus].title;
  dot.setAttribute("aria-label", PROFILE_STATUSES[safeStatus].title);
}

function updateStatusDots() {
  const status = normalizeStatus(state.profile.status);
  applyStatusDot(elements.accountStatus, status);
  applyStatusDot(elements.heroProfileStatus, status);
  applyStatusDot(elements.profileStatus, getViewedProfile().status, true);
}

function getLocationLabel() {
  return [state.profile.country, state.profile.stateRegion].filter(Boolean).join(", ") || DEFAULT_PROFILE.country;
}

function updateProfileCounters() {
  const profile = getViewedProfile();
  const completed = isViewingLocalProfile() ? state.completed : profile.completed || [];
  const favorites = isViewingLocalProfile() ? state.favorites : profile.favorites || [];
  const wishlist = isViewingLocalProfile() ? state.wishlist : profile.wishlist || [];
  const stats = getCompletedStats(completed);
  const localStats = getCompletedStats(state.completed);
  const watched = stats.count;
  const plan = wishlist.length;
  const hoursLabel = formatHours(stats.minutes);

  if (elements.heroWatchedCount) elements.heroWatchedCount.textContent = String(localStats.count);
  if (elements.heroFavoriteCount) elements.heroFavoriteCount.textContent = String(state.favorites.length);
  if (elements.heroWishlistCount) elements.heroWishlistCount.textContent = String(state.wishlist.length);
  if (elements.metricWatched) elements.metricWatched.textContent = String(watched);
  if (elements.metricPlan) elements.metricPlan.textContent = String(plan);
  if (elements.metricFavorites) elements.metricFavorites.textContent = String(favorites.length);
  if (elements.metricHours) elements.metricHours.textContent = hoursLabel;
  if (elements.statHours) {
    elements.statHours.innerHTML = `${hoursLabel}<small>Total</small>`;
  }
  if (elements.statList) {
    const watchedHours = formatHours(stats.minutes);
    const planHours = formatHours(Math.round(wishlist.reduce((total, anime) => total + getAnimeWatchMinutes(anime), 0)));
    elements.statList.innerHTML = `
      <span><i></i>Assistidos <strong>${watchedHours}</strong></span>
      <span><i></i>Desejos <strong>${planHours}</strong></span>
    `;
  }
}

function getCompletedStats(items = state.completed) {
  const minutes = items.reduce((total, anime) => total + (Number(anime.watchMinutes) || getAnimeWatchMinutes(anime)), 0);
  return {
    count: items.length,
    minutes,
  };
}

function getAnimeWatchMinutes(anime) {
  const episodes = Number(anime.episodes) > 0 ? Number(anime.episodes) : 12;
  const duration = Number(anime.duration) > 0 ? Number(anime.duration) : 24;
  return Math.round(episodes * duration);
}

function formatHours(minutes) {
  const hours = minutes / 60;
  if (hours < 10 && hours % 1 !== 0) {
    return `${hours.toFixed(1).replace(".", ",")}h`;
  }
  return `${Math.round(hours)}h`;
}

function renderProfileAnimeSections() {
  const profile = getViewedProfile();
  const local = isViewingLocalProfile();
  renderProfileAnimeGrid(elements.profileCompletedGrid, local ? state.completed : profile.completed || [], "Nenhum anime completo ainda.", "completed");
  renderProfileAnimeGrid(elements.profileAnimeFavorites, local ? state.favorites : profile.favorites || [], "Nenhum anime favorito ainda.", "favorites");
  renderProfileAnimeGrid(elements.profileWishlist, local ? state.wishlist : profile.wishlist || [], "Lista de desejos vazia.", "wishlist");
}

function renderProfileAnimeGrid(root, items, emptyText, sectionKey) {
  if (!root) return;
  const sortedItems = [...items].filter(Boolean).sort((a, b) =>
    getTitle(a).localeCompare(getTitle(b), "pt-BR", { sensitivity: "base" }),
  );
  updateProfileSectionCount(root, sortedItems.length);

  if (!sortedItems.length) {
    root.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  const expanded = Boolean(state.profileSectionExpanded[sectionKey]);
  const visibleItems = expanded ? sortedItems : sortedItems.slice(0, PROFILE_ANIME_PREVIEW_LIMIT);
  root.innerHTML = `
    ${visibleItems.map(renderProfileAnimeCard).join("")}
    ${renderProfileShowMore(sectionKey, sortedItems.length, visibleItems.length, expanded, PROFILE_ANIME_PREVIEW_LIMIT)}
  `;
  wireDynamicActions(root);
  wireProfileSectionToggles(root);
}

function renderProfileAnimeCard(anime) {
  const title = getTitle(anime);
  const rating = getCompletionRating(anime);
  return `
    <article class="continue-card">
      <button class="continue-cover" type="button" data-open-details="${anime.id}" aria-label="Abrir ${escapeHtml(title)}">
        <img src="${imageFor(anime)}" alt="" loading="lazy" decoding="async" />
        <span class="play-dot">▶</span>
      </button>
      <h3>${escapeHtml(title)}</h3>
      <p>${anime.seasonYear || "Anime"}${anime.averageScore ? ` · ★ ${(anime.averageScore / 10).toFixed(1)}` : ""}</p>
      ${rating === null ? "" : `<div class="profile-rating" aria-label="Sua nota: ${rating} de 10">${renderRatingStars(rating)}<strong>${rating}/10</strong></div>`}
    </article>
  `;
}

function renderProfileFavoriteCharacters() {
  if (!elements.profileFavoriteCharacters) return;
  const profile = getViewedProfile();
  const items = [...(isViewingLocalProfile() ? state.favoriteCharacters : profile.favoriteCharacters || [])]
    .filter(Boolean)
    .sort((a, b) => {
      const fans = Number(b.favourites || 0) - Number(a.favourites || 0);
      if (fans !== 0) return fans;
      return getCharacterName(a).localeCompare(getCharacterName(b), "pt-BR", { sensitivity: "base" });
    });
  updateProfileSectionCount(elements.profileFavoriteCharacters, items.length);

  if (!items.length) {
    elements.profileFavoriteCharacters.innerHTML = `<div class="empty-state">Nenhum personagem favorito.</div>`;
    return;
  }
  const expanded = Boolean(state.profileSectionExpanded.characters);
  const visibleItems = expanded ? items : items.slice(0, PROFILE_CHARACTER_PREVIEW_LIMIT);
  elements.profileFavoriteCharacters.innerHTML = `
    ${visibleItems
    .map(
      (character, index) => `
      <button class="ranking-item" type="button" data-toggle-character-favorite="${character.id}">
        <span>${index + 1}</span>
        <img src="${characterImage(character)}" alt="" loading="lazy" decoding="async" />
        <strong>${escapeHtml(getCharacterName(character))}<small>${Number(character.favourites || 0).toLocaleString("pt-BR")} fãs</small></strong>
      </button>
    `,
    )
    .join("")}
    ${renderProfileShowMore("characters", items.length, visibleItems.length, expanded, PROFILE_CHARACTER_PREVIEW_LIMIT)}
  `;
  wireDynamicActions(elements.profileFavoriteCharacters);
  wireProfileSectionToggles(elements.profileFavoriteCharacters);
}

function renderProfileShowMore(sectionKey, total, shown, expanded, previewLimit) {
  if (total <= previewLimit) return "";
  const remaining = total - shown;
  const label = expanded ? "Mostrar menos" : `Mostrar +${remaining}`;
  return `
    <button class="profile-show-more" type="button" data-profile-section-toggle="${sectionKey}" aria-expanded="${expanded}">
      ${label}
    </button>
  `;
}

function wireProfileSectionToggles(root) {
  root.querySelectorAll("[data-profile-section-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const sectionKey = button.dataset.profileSectionToggle;
      state.profileSectionExpanded[sectionKey] = !state.profileSectionExpanded[sectionKey];
      if (sectionKey === "characters") {
        renderProfileFavoriteCharacters();
        return;
      }
      renderProfileAnimeSections();
    });
  });
}

function updateProfileSectionCount(root, count) {
  const counter = root.closest(".profile-section, .profile-info-card")?.querySelector("[data-profile-count]");
  if (counter) {
    counter.textContent = `${count.toLocaleString("pt-BR")} ${count === 1 ? "item" : "itens"}`;
  }
}

function getViewedProfile() {
  return state.viewedProfile || state.profile;
}

function isViewingLocalProfile() {
  return !state.viewedProfile || state.viewedProfile.id === state.profile.id;
}

function getProfileAvatar() {
  return resolveProfileMedia(state.profile.avatar, "avatar") || DEFAULT_PROFILE_IMAGE;
}

function getProfileAvatarFor(profile = getViewedProfile()) {
  if (!profile || profile.id === state.profile.id) return getProfileAvatar();
  return profile.avatar || DEFAULT_PROFILE_IMAGE;
}

function getProfileBanner() {
  const source = getProfileBannerSource();
  if (source) return `url("${escapeCssUrl(source)}")`;
  return "linear-gradient(135deg, rgba(255, 18, 49, 0.36), rgba(122, 53, 255, 0.22))";
}

function getProfileBannerSource() {
  const banner = resolveProfileMedia(state.profile.banner, "banner");
  if (banner) return banner;
  const anime = state.trending[0] || state.media[0];
  return anime?.bannerImage || "";
}

function getProfileBannerSourceFor(profile = getViewedProfile()) {
  if (!profile || profile.id === state.profile.id) return getProfileBannerSource();
  return profile.banner || "";
}

function getProfileBannerBackground() {
  return "linear-gradient(135deg, rgba(255, 18, 49, 0.22), rgba(122, 53, 255, 0.12))";
}

function escapeCssUrl(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function getAvatarPosition() {
  return `${state.profile.avatarX}% ${state.profile.avatarY}%`;
}

function getAvatarPositionFor(profile = getViewedProfile()) {
  const x = clampNumber(profile?.avatarX, 0, 100, DEFAULT_PROFILE.avatarX);
  const y = clampNumber(profile?.avatarY, 0, 100, DEFAULT_PROFILE.avatarY);
  return `${x}% ${y}%`;
}

function getBannerPosition() {
  return `${state.profile.bannerX}% ${state.profile.bannerY}%`;
}

function getBannerPositionFor(profile = getViewedProfile()) {
  const x = clampNumber(profile?.bannerX, 0, 100, DEFAULT_PROFILE.bannerX);
  const y = clampNumber(profile?.bannerY, 0, 100, DEFAULT_PROFILE.bannerY);
  return `${x}% ${y}%`;
}

function getLocationLabelFor(profile = getViewedProfile()) {
  return [profile.country, profile.stateRegion].filter(Boolean).join(", ") || DEFAULT_PROFILE.country;
}

function normalizeUsername(value) {
  const clean = String(value || DEFAULT_PROFILE.username)
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 24);
  return clean || DEFAULT_PROFILE.username;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.round(number), min), max);
}

function upgradeProfile(profile) {
  const merged = {
    ...DEFAULT_PROFILE,
    ...(profile || {}),
  };

  if (profile?.location && !profile?.country) {
    merged.country = profile.location;
  }

  const needsResetForNewSystem = profile?.systemVersion !== PROFILE_SYSTEM_VERSION;
  merged.systemVersion = PROFILE_SYSTEM_VERSION;
  merged.id = merged.id || DEFAULT_PROFILE.id;
  merged.username = normalizeUsername(merged.username);
  merged.status = normalizeStatus(merged.status);
  merged.firstSeenAt = isReasonableFirstSeen(merged.firstSeenAt) ? merged.firstSeenAt : getFirstSeenAt();
  localStorage.setItem(FIRST_SEEN_KEY, merged.firstSeenAt);
  merged.level = needsResetForNewSystem ? 0 : clampNumber(merged.level, 0, PROFILE_MAX_LEVEL, DEFAULT_PROFILE.level);
  merged.xp = needsResetForNewSystem ? 0 : merged.xp;
  merged.tag = needsResetForNewSystem ? DEFAULT_PROFILE.tag : merged.tag;
  merged.xp = merged.level >= PROFILE_MAX_LEVEL ? 0 : clampNumber(merged.xp, 0, getXpGoal(merged.level) - 1, DEFAULT_PROFILE.xp);
  merged.onlineSeconds = clampNumber(merged.onlineSeconds, 0, 99999999, DEFAULT_PROFILE.onlineSeconds);
  merged.interactions = clampNumber(merged.interactions, 0, 99999999, DEFAULT_PROFILE.interactions);
  merged.age = clampNumber(merged.age, 1, 120, DEFAULT_PROFILE.age);
  merged.hideChatBubble = Boolean(merged.hideChatBubble);
  merged.avatarX = clampNumber(merged.avatarX, 0, 100, DEFAULT_PROFILE.avatarX);
  merged.avatarY = clampNumber(merged.avatarY, 0, 100, DEFAULT_PROFILE.avatarY);
  merged.bannerX = clampNumber(merged.bannerX, 0, 100, DEFAULT_PROFILE.bannerX);
  merged.bannerY = clampNumber(merged.bannerY, 0, 100, DEFAULT_PROFILE.bannerY);

  const unlocked = STYLE_TAGS.filter((tag) => tag.level <= merged.level).map((tag) => tag.label);
  if (!unlocked.includes(merged.tag)) {
    merged.tag = unlocked.at(-1) || DEFAULT_PROFILE.tag;
  }

  return merged;
}

function uniqueById(item, index, array) {
  return item && array.findIndex((candidate) => candidate.id === item.id) === index;
}

function findAnime(id) {
  return [
    ...state.media,
    ...state.trending,
    ...state.favorites,
    ...state.wishlist,
    ...state.history,
    ...state.completed,
    ...state.media.flatMap(getAnimeRecommendations),
    ...state.trending.flatMap(getAnimeRecommendations),
    ...state.favorites.flatMap(getAnimeRecommendations),
  ].filter(Boolean).find((item) => item.id === id);
}

function getAnimeRecommendations(anime) {
  return anime?.recommendations?.nodes?.map((node) => node.mediaRecommendation).filter(Boolean) || [];
}

async function loadCatalog({ append = false } = {}) {
  if (!append) {
    renderGridSkeleton();
  } else {
    elements.loadMoreButton.disabled = true;
    elements.loadMoreButton.textContent = "Carregando";
  }

  try {
    const animePromise = fetchAnime({
      page: state.page,
      perPage: CATALOG_PAGE_SIZE,
      search: state.filters.search,
      genre: state.filters.genre,
      seasonYear: state.filters.year ? Number(state.filters.year) : null,
      status: state.filters.status,
      sort: state.filters.sort,
    });
    const characterPromise = !append && state.filters.search
      ? fetchCharacters(state.filters.search).catch(() => ({ characters: [], total: 0 }))
      : Promise.resolve(null);
    const [data, characterData] = await Promise.all([animePromise, characterPromise]);

    state.media = append ? [...state.media, ...data.media] : data.media;
    state.total = data.total;
    state.hasNextPage = data.hasNextPage;
    if (!append) {
      state.characterResults = characterData?.characters || [];
      state.profileResults = searchProfiles(state.filters.search);
      renderCharacterSearchResults(characterData?.total || 0);
      renderProfileSearchResults();
    }
    renderGrid();
    updateCatalogMeta();
    updateCacheStatus("live");
  } catch (error) {
    console.warn(error);
    const fallback = getLocalCatalogFallback({
      page: state.page,
      perPage: CATALOG_PAGE_SIZE,
    });

    if (fallback.media.length || state.media.length) {
      state.media = append ? [...state.media, ...fallback.media] : fallback.media;
      state.total = fallback.total;
      state.hasNextPage = fallback.hasNextPage;
      if (!append) {
        state.characterResults = [];
        state.profileResults = searchProfiles(state.filters.search);
        renderCharacterSearchResults(0);
        renderProfileSearchResults();
      }
      renderGrid();
      updateCatalogMeta();
      updateCacheStatus("cache");
      showToast("AniList limitou as requisições. Usando dados locais.");
    } else {
      renderError("A busca falhou. Ajuste os filtros ou tente novamente.");
    }
  } finally {
    elements.loadMoreButton.disabled = false;
    elements.loadMoreButton.textContent = "Carregar mais";
  }
}

function getLocalCatalogFallback({ page = 1, perPage = CATALOG_PAGE_SIZE } = {}) {
  const pool = [
    ...state.media,
    ...state.trending,
    ...state.favorites,
    ...state.wishlist,
    ...state.history,
    ...state.completed,
  ]
    .filter(Boolean)
    .filter(uniqueById)
    .filter(matchesLocalFilters)
    .sort(sortLocalAnime);
  const start = Math.max(0, (Number(page) - 1) * perPage);
  const media = pool.slice(start, start + perPage);
  return {
    media,
    total: pool.length,
    hasNextPage: start + perPage < pool.length,
  };
}

function matchesLocalFilters(anime) {
  const search = normalizeMentionText(state.filters.search);
  const haystack = normalizeMentionText([
    getTitle(anime),
    anime.title?.romaji,
    anime.title?.english,
    anime.title?.native,
    anime.description,
    ...(anime.genres || []),
  ].filter(Boolean).join(" "));
  if (search && !haystack.includes(search)) return false;
  if (state.filters.genre && !(anime.genres || []).includes(state.filters.genre)) return false;
  if (state.filters.year && String(anime.seasonYear || "") !== String(state.filters.year)) return false;
  if (state.filters.status && anime.status !== state.filters.status) return false;
  return true;
}

function sortLocalAnime(a, b) {
  const sort = state.filters.sort;
  if (sort === "SCORE_DESC") return Number(b.averageScore || 0) - Number(a.averageScore || 0);
  if (sort === "START_DATE_DESC") return Number(b.seasonYear || 0) - Number(a.seasonYear || 0);
  if (sort === "POPULARITY_DESC") return Number(b.popularity || 0) - Number(a.popularity || 0);
  return Number(b.popularity || b.averageScore || 0) - Number(a.popularity || a.averageScore || 0);
}

async function fetchAnime(params) {
  const variables = {
    page: params.page || 1,
    perPage: params.perPage || CATALOG_PAGE_SIZE,
    sort: [params.sort || "TRENDING_DESC"],
  };

  if (params.search) variables.search = params.search;
  if (params.genre) variables.genre = params.genre;
  if (params.seasonYear) variables.seasonYear = params.seasonYear;
  if (params.status) variables.status = params.status;

  const data = await requestAniList(mediaQuery, variables);

  return {
    media: data.Page.media.filter(Boolean),
    total: data.Page.pageInfo.total,
    hasNextPage: data.Page.pageInfo.hasNextPage,
  };
}

async function fetchCharacters(search) {
  if (!search?.trim()) {
    return { characters: [], total: 0, hasNextPage: false };
  }

  const data = await requestAniList(characterSearchQuery, {
    page: 1,
    perPage: 12,
    search: search.trim(),
  });

  return {
    characters: data.Page.characters.filter(Boolean).map(compactCharacter),
    total: data.Page.pageInfo.total,
    hasNextPage: data.Page.pageInfo.hasNextPage,
  };
}

async function fetchAnimeCharacters(animeId) {
  const characters = [];
  let page = 1;
  let hasNextPage = true;
  let total = 0;

  while (hasNextPage && page <= DETAILS_CHARACTER_PAGE_LIMIT) {
    const data = await requestAniList(animeCharactersQuery, {
      id: animeId,
      page,
      perPage: DETAILS_CHARACTER_PAGE_SIZE,
    });

    const connection = data?.Media?.characters;
    characters.push(...(connection?.nodes || []).filter(Boolean).map(compactCharacter));
    total = connection?.pageInfo?.total || total;
    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    page += 1;
  }

  return {
    characters: characters.filter(uniqueById),
    total: total || characters.length,
  };
}

function renderSpotlight(anime) {
  if (!anime) return;
  const title = getTitle(anime);
  const description = cleanDescription(anime.description);
  const bg = anime.bannerImage ? `url("${anime.bannerImage}") center/cover` : colorBackground(anime);
  elements.spotlight.style.setProperty("--spotlight-bg", bg);
  elements.spotlight.classList.remove("is-loading");
  elements.spotlight.innerHTML = `
    <img class="spotlight-poster" src="${imageFor(anime, "extraLarge")}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high" />
    <div class="spotlight-copy">
      <h2>${escapeHtml(title)}</h2>
      <div class="meta-row">
        ${chip(anime.format || "Anime")}
        ${chip(statusLabel(anime.status))}
        ${anime.averageScore ? chip(`${anime.averageScore}%`, "score") : ""}
      </div>
      <p>${escapeHtml(description || "Sinopse indisponível.")}</p>
      <div class="spotlight-actions">
        <button class="primary-action" type="button" data-open-details="${anime.id}">Ver detalhes</button>
        <button class="secondary-action" type="button" data-toggle-favorite="${anime.id}">
          ${isFavorite(anime.id) ? "Remover favorito" : "Favoritar"}
        </button>
        <button class="secondary-action" type="button" data-toggle-wishlist="${anime.id}">
          ${isWishlisted(anime.id) ? "Remover da lista" : "Quero ver"}
        </button>
      </div>
    </div>
  `;
  wireDynamicActions(elements.spotlight);
}

function renderTrendingRail() {
  elements.trendingRail.innerHTML = state.trending
    .map(
      (anime, index) => `
      <button class="rail-card" type="button" data-spotlight-index="${index}" aria-label="${escapeHtml(getTitle(anime))}">
        <img src="${imageFor(anime)}" alt="" loading="lazy" decoding="async" />
        <span class="rail-card-content">
          <span class="rail-card-title">${escapeHtml(getTitle(anime))}</span>
        </span>
      </button>
    `,
    )
    .join("");

  elements.trendingRail.querySelectorAll("[data-spotlight-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.spotlightIndex);
      state.spotlightIndex = index;
      renderSpotlight(state.trending[index]);
    });
  });
}

function renderCharacterSearchResults(total = state.characterResults.length) {
  if (!elements.characterResultsSection || !elements.characterResults) return;

  if (!state.filters.search || !state.characterResults.length) {
    elements.characterResultsSection.hidden = true;
    elements.characterResults.innerHTML = "";
    if (elements.characterResultCount) elements.characterResultCount.textContent = "";
    return;
  }

  elements.characterResultsSection.hidden = false;
  if (elements.characterResultCount) {
    elements.characterResultCount.textContent = total ? `${Number(total).toLocaleString("pt-BR")} personagens` : "";
  }
  elements.characterResults.innerHTML = state.characterResults.slice(0, 12).map(renderCharacterResultCard).join("");
  wireDynamicActions(elements.characterResults);
}

function renderProfileSearchResults() {
  if (!elements.profileResultsSection || !elements.profileResults) return;

  if (!state.filters.search || !state.profileResults.length) {
    elements.profileResultsSection.hidden = true;
    elements.profileResults.innerHTML = "";
    if (elements.profileResultCount) elements.profileResultCount.textContent = "";
    return;
  }

  elements.profileResultsSection.hidden = false;
  if (elements.profileResultCount) {
    elements.profileResultCount.textContent = `${state.profileResults.length.toLocaleString("pt-BR")} perfil`;
  }
  elements.profileResults.innerHTML = state.profileResults.map(renderProfileResultCard).join("");
  elements.profileResults.querySelectorAll("[data-open-profile-result]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.openProfileResult;
      const profile = state.profileResults.find((item) => item.id === id);
      openProfileView(id === state.profile.id ? null : profile);
    });
  });
}

function renderProfileResultCard(profile) {
  const status = normalizeStatus(profile.status);
  return `
    <button class="profile-result-card" type="button" data-open-profile-result="${escapeHtml(profile.id)}">
      <img src="${escapeHtml(profile.avatar || DEFAULT_PROFILE_IMAGE)}" alt="" loading="lazy" decoding="async" />
      <span>
        <strong><i class="status-dot status-${status}" aria-label="${PROFILE_STATUSES[status].title}" title="${PROFILE_STATUSES[status].title}"></i>${escapeHtml(profile.name)}</strong>
        <small>@${escapeHtml(profile.username)} · ${profile.hideChatBubble ? "Chat oculto" : escapeHtml(PROFILE_STATUSES[status].label)}</small>
      </span>
    </button>
  `;
}

function bindChatEvents() {
  elements.profileChatButton?.addEventListener("click", () => openChatWithProfile(getViewedProfile()));
  elements.chatBubble?.addEventListener("click", () => {
    state.chatWindowOpen = true;
    state.chatView = "list";
    renderChatDock();
  });
  elements.chatBackButton?.addEventListener("click", () => {
    state.chatView = "list";
    renderChatDock();
  });

  document.querySelector("[data-chat-close]")?.addEventListener("click", closeChat);
  document.querySelector("[data-chat-minimize]")?.addEventListener("click", () => {
    state.chatWindowOpen = false;
    renderChatDock();
  });
  document.querySelector("[data-chat-voice]")?.addEventListener("click", startVoiceCall);
  document.querySelectorAll("[data-chat-end-call]").forEach((button) => button.addEventListener("click", endVoiceCall));
  document.querySelectorAll("[data-chat-mute]").forEach((button) => button.addEventListener("click", toggleVoiceMute));
  elements.callShareButton?.addEventListener("click", toggleScreenShare);
  elements.callShareFullscreen?.addEventListener("click", openScreenShareFullscreen);

  document.querySelector("[data-chat-attach]")?.addEventListener("click", () => {
    elements.chatFileInput?.click();
  });

  elements.chatThreadList?.addEventListener("click", (event) => {
    const publicAction = event.target.closest("[data-public-action]");
    if (publicAction) {
      handlePublicChatAction(publicAction);
      return;
    }

    const button = event.target.closest("[data-open-chat-thread]");
    if (!button) return;
    openChatThread(button.dataset.openChatThread);
  });

  elements.chatThreadList?.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-public-search-form]");
    if (!form) return;
    event.preventDefault();
    state.publicChatSearch = String(new FormData(form).get("publicSearch") || "").trim();
    renderChatList();
  });

  elements.chatFileInput?.addEventListener("change", () => handleChatFileInput(elements.chatFileInput));

  elements.chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitChatMessage();
  });

  elements.chatInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      elements.chatForm.requestSubmit();
    }
  });

  renderChatDock();
}

function openChatWithProfile(profile) {
  const target = normalizeDirectoryProfile(profile || {});
  if (!target.id || target.id === state.profile.id) {
    showToast("Abra o perfil de outro membro para iniciar um chat.");
    return;
  }
  if (target.hideChatBubble) {
    showToast("Esse usuário ocultou o chat do perfil.");
    return;
  }

  state.activeChatProfile = target;
  state.chatWindowOpen = true;
  state.chatView = "thread";
  ensureChatThread(target);
  clearThreadUnread(getChatThreadId(target));
  awardXp(8, "chat", { silent: true });
  saveChatThreads();
  renderChatDock();
}

function closeChat() {
  if (state.voiceCall?.public) {
    leavePublicCall({ silent: true });
  } else if (state.voiceCall) {
    endVoiceCall({ skipRender: true, skipFocus: true });
  } else {
    clearVoiceCall();
  }
  state.activeChatProfile = null;
  state.chatWindowOpen = false;
  state.chatView = "list";
  renderChatDock();
}

function getChatThreadId(profile = state.activeChatProfile) {
  if (isPublicChatProfile(profile)) {
    return getPublicThreadId(profile.publicChatId || getPublicChatIdFromThread(profile.id));
  }
  return String(profile?.id || profile?.username || "");
}

function getChatProfileSnapshot(profile) {
  return {
    id: profile.id,
    name: profile.name || DEFAULT_PROFILE.name,
    username: normalizeUsername(profile.username),
    status: normalizeStatus(profile.status),
    avatar: profile.avatar || DEFAULT_PROFILE_IMAGE,
    hideChatBubble: Boolean(profile.hideChatBubble),
    isPublicChat: Boolean(profile.isPublicChat),
    publicChatId: profile.publicChatId || "",
  };
}

function ensureChatThread(profile = state.activeChatProfile) {
  const threadId = getChatThreadId(profile);
  if (!threadId) return null;
  const current = state.chatThreads[threadId] || { messages: [] };
  const publicChat = isPublicThreadId(threadId) ? findPublicChat(getPublicChatIdFromThread(threadId)) : null;
  state.chatThreads[threadId] = {
    ...current,
    profile: publicChat ? getChatProfileSnapshot(publicChatToProfile(publicChat)) : getChatProfileSnapshot(profile),
    messages: Array.isArray(current.messages) ? current.messages : [],
  };
  return state.chatThreads[threadId];
}

function getActiveChatThread() {
  if (!state.activeChatProfile) return null;
  return ensureChatThread(state.activeChatProfile);
}

function getChatThreads() {
  return Object.entries(state.chatThreads)
    .map(([id, thread]) => {
      const publicChat = isPublicThreadId(id) ? findPublicChat(getPublicChatIdFromThread(id)) : null;
      return {
        id,
        ...thread,
        profile: publicChat ? getChatProfileSnapshot(publicChatToProfile(publicChat)) : thread.profile,
        publicChat,
      };
    })
    .filter((thread) => thread.profile?.id)
    .filter((thread) => !thread.publicChat || isPublicChatMember(thread.publicChat))
    .sort((a, b) => {
      const aCall = a.publicChat?.call?.active ? 1 : 0;
      const bCall = b.publicChat?.call?.active ? 1 : 0;
      if (aCall !== bCall) return bCall - aCall;
      const aTime = new Date(a.messages?.at(-1)?.createdAt || 0).getTime();
      const bTime = new Date(b.messages?.at(-1)?.createdAt || 0).getTime();
      return bTime - aTime;
    });
}

function openChatThread(threadId) {
  const thread = state.chatThreads[threadId];
  const publicChat = isPublicThreadId(threadId) ? findPublicChat(getPublicChatIdFromThread(threadId)) : null;
  if (publicChat && !isPublicChatMember(publicChat)) {
    joinPublicChat(publicChat.id);
    return;
  }
  if (!thread?.profile && !publicChat) return;
  state.activeChatProfile = publicChat ? normalizeDirectoryProfile(publicChatToProfile(publicChat)) : normalizeDirectoryProfile(thread.profile);
  state.chatWindowOpen = true;
  state.chatView = "thread";
  clearThreadUnread(threadId);
  renderChatDock();
}

function renderChatDock() {
  if (!elements.chatDock) return;
  const threads = getChatThreads();
  const profile = state.activeChatProfile || threads[0]?.profile || null;
  if ((!profile && !threads.length && !state.publicChats.length) || profile?.hideChatBubble) {
    elements.chatDock.hidden = true;
    return;
  }

  const thread = state.activeChatProfile ? ensureChatThread(state.activeChatProfile) : null;
  const listMode = state.chatView === "list" || !state.activeChatProfile;
  const hasPublicCall = state.publicChats.some((chat) => chat.call?.active && isPublicChatMember(chat));
  elements.chatDock.hidden = false;
  elements.chatWindow.hidden = !state.chatWindowOpen;
  elements.chatBubble.hidden = state.chatWindowOpen;
  elements.chatBubbleAvatar.src = profile?.avatar || DEFAULT_PROFILE_IMAGE;
  elements.chatBubble.classList.toggle("has-public-call", hasPublicCall);
  renderChatUnreadBadge();

  if (listMode) {
    renderChatList();
  } else {
    renderChatConversation(thread);
  }
  updateVoiceCallTimer();
}

function renderChatConversation(thread) {
  const profile = state.activeChatProfile;
  if (!profile) {
    renderChatList();
    return;
  }
  const publicChat = getActivePublicChat();
  elements.chatWindow.classList.remove("is-list");
  elements.chatBackButton.hidden = false;
  elements.chatVoiceButton.hidden = false;
  elements.chatAvatar.hidden = false;
  elements.chatAvatar.src = publicChat?.icon || profile.avatar || DEFAULT_PROFILE_IMAGE;
  elements.chatTitle.textContent = publicChat?.name || profile.name || DEFAULT_PROFILE.name;
  elements.chatSubtitle.textContent = publicChat
    ? `Público · ${publicChat.members.length} membros · ${publicRoleLabel(getCurrentPublicRole(publicChat))}${publicChat.call?.active ? " · call ativa" : ""}`
    : `${PROFILE_STATUSES[normalizeStatus(profile.status)].label} · @${normalizeUsername(profile.username)}`;
  elements.chatVoiceButton.setAttribute("aria-label", publicChat ? "Call do chat público" : "Ligação de voz");
  elements.chatThreadList.hidden = true;
  elements.chatMessages.hidden = false;
  elements.chatForm.hidden = false;
  elements.chatInput.disabled = false;
  elements.chatInput.readOnly = false;
  renderChatMessages(thread);
}

function renderChatList() {
  elements.chatWindow.classList.add("is-list");
  elements.chatBackButton.hidden = true;
  elements.chatVoiceButton.hidden = true;
  elements.chatAvatar.hidden = false;
  elements.chatAvatar.src = DEFAULT_PROFILE_IMAGE;
  elements.chatTitle.textContent = "Conversas";
  elements.chatSubtitle.textContent = "Escolha um chat para continuar";
  elements.chatThreadList.hidden = false;
  elements.chatMessages.hidden = true;
  elements.chatForm.hidden = true;
  const threads = getChatThreads();
  const publicHub = renderPublicChatHub();

  if (!threads.length) {
    elements.chatThreadList.innerHTML = `
      ${publicHub}
      <div class="chat-list-empty">
        <strong>Nenhuma conversa ainda.</strong>
        <span>Abra um perfil e clique em Chat para começar.</span>
      </div>
    `;
    return;
  }

  elements.chatThreadList.innerHTML = `${publicHub}${threads.map(renderChatThreadItem).join("")}`;
}

function renderChatThreadItem(thread) {
  const profile = thread.profile;
  const last = thread.messages?.at(-1);
  const unread = Number(state.unreadThreads[thread.id] || 0);
  const preview = last ? getChatPreview(last) : "Nenhuma mensagem ainda.";
  const publicChat = thread.publicChat;
  return `
    <button class="chat-thread-item ${publicChat ? "is-public" : ""} ${publicChat?.call?.active ? "has-public-call" : ""}" type="button" data-open-chat-thread="${escapeHtml(thread.id)}">
      <img src="${escapeHtml(profile.avatar || DEFAULT_PROFILE_IMAGE)}" alt="" loading="lazy" decoding="async" />
      <span>
        <strong>${publicChat ? "◇ " : ""}${escapeHtml(profile.name || "Contato")}</strong>
        <small>${publicChat?.call?.active ? "Call pública ativa · " : ""}${escapeHtml(preview)}</small>
      </span>
      <em>
        ${last ? formatChatTime(last.createdAt) : ""}
        ${unread ? `<b>${unread}</b>` : ""}
      </em>
    </button>
  `;
}

function renderPublicChatHub() {
  const query = state.publicChatSearch;
  const results = query ? searchPublicChats(query) : [];
  return `
    <section class="public-chat-hub" aria-label="Chats públicos">
      <div class="public-chat-head">
        <span>
          <strong>Chats públicos</strong>
          <small>Crie, pesquise e entre em comunidades</small>
        </span>
        <button class="secondary-action" type="button" data-public-action="create">Criar</button>
      </div>
      <form class="public-chat-search" data-public-search-form>
        <input name="publicSearch" value="${escapeHtml(query)}" placeholder="Pesquisar chat público..." autocomplete="off" />
        <button class="icon-button small" type="submit" aria-label="Pesquisar chat público">⌕</button>
      </form>
      ${
        query
          ? `<div class="public-chat-results">
              ${
                results.length
                  ? results.map(renderPublicChatResult).join("")
                  : `<div class="public-chat-empty">Nenhum chat público encontrado.</div>`
              }
            </div>`
          : `<div class="public-chat-hint">Busque pelo nome do chat ou crie um novo espaço.</div>`
      }
    </section>
  `;
}

function renderPublicChatResult(chat) {
  const joined = isPublicChatMember(chat);
  return `
    <button class="public-chat-result ${chat.call?.active ? "has-public-call" : ""}" type="button" data-public-action="${joined ? "open" : "join"}" data-public-chat-id="${escapeHtml(chat.id)}">
      <img src="${escapeHtml(chat.icon || DEFAULT_PROFILE_IMAGE)}" alt="" loading="lazy" decoding="async" />
      <span>
        <strong>${escapeHtml(chat.name)}</strong>
        <small>${chat.members.length} membros${chat.call?.active ? " · call ativa" : ""}</small>
      </span>
      <em>${joined ? "Abrir" : "Entrar"}</em>
    </button>
  `;
}

function searchPublicChats(query) {
  const needle = normalizeMentionText(query);
  if (!needle) return [];
  return state.publicChats
    .filter((chat) => !chat.banned?.includes(state.profile.id))
    .filter((chat) => normalizeMentionText(`${chat.name} ${chat.slug} ${chat.description}`).includes(needle))
    .slice(0, 8);
}

function handlePublicChatAction(button) {
  const action = button.dataset.publicAction;
  const chatId = button.dataset.publicChatId;
  if (action === "create") {
    openPublicChatCreateDialog();
    return;
  }
  if (action === "join") {
    joinPublicChat(chatId);
    return;
  }
  if (action === "open") {
    openPublicChat(chatId);
    return;
  }
}

async function openPublicChatCreateDialog() {
  const dialog = ensurePublicChatCreateDialog();
  dialog.hidden = false;
  dialog.querySelector("[name='name']")?.focus();
}

function ensurePublicChatCreateDialog() {
  let dialog = document.querySelector("#publicChatCreateDialog");
  if (dialog) return dialog;
  dialog = document.createElement("div");
  dialog.id = "publicChatCreateDialog";
  dialog.className = "public-chat-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <div class="public-chat-backdrop" data-public-create-close></div>
    <form class="public-chat-panel" data-public-create-form>
      <div class="public-chat-dialog-head">
        <span>
          <strong>Criar chat público</strong>
          <small>Você será o ADM deste chat.</small>
        </span>
        <button class="icon-button small" type="button" data-public-create-close aria-label="Fechar">×</button>
      </div>
      <label>Nome <input name="name" maxlength="42" required placeholder="Ex: Anime da madrugada" /></label>
      <label>Descrição <input name="description" maxlength="120" placeholder="Tema do chat" /></label>
      <label>Ícone por URL <input name="icon" placeholder="Cole uma URL de imagem" /></label>
      <label>Ícone do dispositivo <input name="iconFile" type="file" accept="image/*" /></label>
      <div class="public-chat-dialog-actions">
        <button class="secondary-action" type="button" data-public-create-close>Cancelar</button>
        <button class="primary-action" type="submit">Criar chat</button>
      </div>
    </form>
  `;
  document.body.appendChild(dialog);
  dialog.querySelectorAll("[data-public-create-close]").forEach((button) => {
    button.addEventListener("click", () => {
      dialog.hidden = true;
    });
  });
  dialog.querySelector("[data-public-create-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    const iconFile = form.elements.iconFile.files?.[0];
    const icon = iconFile ? await readFileAsDataUrl(iconFile) : String(data.get("icon") || "").trim();
    const chat = createPublicChat({
      name,
      description: String(data.get("description") || "").trim(),
      icon,
    });
    dialog.hidden = true;
    form.reset();
    openPublicChat(chat.id);
    showToast("Chat público criado.");
  });
  return dialog;
}

function createPublicChat({ name, description, icon }) {
  const id = createPublicChatId(name);
  const chat = normalizePublicChat({
    id,
    name,
    slug: slugify(name),
    description,
    icon: icon || DEFAULT_PROFILE_IMAGE,
    ownerId: state.profile.id,
    createdAt: new Date().toISOString(),
    call: null,
    members: [
      {
        id: state.profile.id,
        name: state.profile.name || DEFAULT_PROFILE.name,
        username: normalizeUsername(state.profile.username),
        role: "ADM",
        avatar: getProfileAvatar(),
      },
      ...PUBLIC_CHAT_FIXTURE_MEMBERS,
    ],
    banned: [],
  });
  state.publicChats = [chat, ...state.publicChats.filter((item) => item.id !== chat.id)];
  savePublicChats();
  ensurePublicChatThread(chat);
  return chat;
}

function joinPublicChat(chatId) {
  const chat = findPublicChat(chatId);
  if (!chat) return;
  if (chat.banned?.includes(state.profile.id)) {
    showToast("Você foi banido desse chat público.");
    return;
  }
  if (!chat.members.some((member) => member.id === state.profile.id)) {
    chat.members.push({
      id: state.profile.id,
      name: state.profile.name || DEFAULT_PROFILE.name,
      username: normalizeUsername(state.profile.username),
      role: "member",
      avatar: getProfileAvatar(),
    });
    savePublicChats();
    addPublicSystemMessage(chat.id, `${state.profile.name || DEFAULT_PROFILE.name} entrou no chat público.`);
  }
  openPublicChat(chat.id);
  showToast(`Você entrou em ${chat.name}.`);
}

function openPublicChat(chatId) {
  const chat = findPublicChat(chatId);
  if (!chat) return;
  ensurePublicChatThread(chat);
  state.activeChatProfile = normalizeDirectoryProfile(publicChatToProfile(chat));
  state.chatWindowOpen = true;
  state.chatView = "thread";
  clearThreadUnread(getPublicThreadId(chat.id));
  renderChatDock();
}

function ensurePublicChatThread(chat) {
  const threadId = getPublicThreadId(chat.id);
  const current = state.chatThreads[threadId] || { messages: [] };
  state.chatThreads[threadId] = {
    ...current,
    profile: getChatProfileSnapshot(publicChatToProfile(chat)),
    messages: Array.isArray(current.messages) && current.messages.length
      ? current.messages
      : [
          {
            id: `sys-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: "system",
            text: `Chat público ${chat.name} criado.`,
            createdAt: chat.createdAt || new Date().toISOString(),
          },
        ],
  };
  saveChatThreads();
  return state.chatThreads[threadId];
}

function addPublicSystemMessage(chatId, text) {
  const chat = findPublicChat(chatId);
  if (!chat) return;
  const previousActive = state.activeChatProfile;
  state.activeChatProfile = normalizeDirectoryProfile(publicChatToProfile(chat));
  addChatMessage({ type: "system", text });
  state.activeChatProfile = previousActive;
}

function publicRoleLabel(role) {
  return role === "ADM" ? "ADM" : role === "CO" ? "CO" : "Membro";
}

function openPublicChatManageDialog() {
  const chat = getActivePublicChat();
  if (!chat || !canManagePublicChat(chat)) {
    showToast("Apenas o ADM pode gerenciar este chat.");
    return;
  }
  const dialog = ensurePublicChatManageDialog();
  renderPublicChatManageDialog(chat);
  dialog.hidden = false;
}

function ensurePublicChatManageDialog() {
  let dialog = document.querySelector("#publicChatManageDialog");
  if (dialog) return dialog;
  dialog = document.createElement("div");
  dialog.id = "publicChatManageDialog";
  dialog.className = "public-chat-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <div class="public-chat-backdrop" data-public-manage-close></div>
    <section class="public-chat-panel" id="publicChatManagePanel"></section>
  `;
  document.body.appendChild(dialog);
  dialog.querySelector("[data-public-manage-close]").addEventListener("click", () => {
    dialog.hidden = true;
  });
  dialog.addEventListener("click", (event) => {
    const close = event.target.closest("[data-public-manage-close]");
    if (close) {
      dialog.hidden = true;
      return;
    }
    const action = event.target.closest("[data-public-manage-action]");
    if (action) {
      handlePublicManageAction(action);
    }
  });
  dialog.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-public-icon-form]");
    if (!form) return;
    event.preventDefault();
    const chat = getActivePublicChat();
    if (!chat || !canManagePublicChat(chat)) return;
    const data = new FormData(form);
    const iconFile = form.elements.iconFile.files?.[0];
    const icon = iconFile ? await readFileAsDataUrl(iconFile) : String(data.get("icon") || "").trim();
    if (icon) {
      chat.icon = icon;
      savePublicChats();
      ensurePublicChatThread(chat);
      state.activeChatProfile = normalizeDirectoryProfile(publicChatToProfile(chat));
      renderPublicChatManageDialog(chat);
      renderChatDock();
      showToast("Ícone do chat atualizado.");
    }
  });
  return dialog;
}

function renderPublicChatManageDialog(chat) {
  const panel = document.querySelector("#publicChatManagePanel");
  if (!panel) return;
  panel.innerHTML = `
    <div class="public-chat-dialog-head">
      <span>
        <strong>Gerenciar ${escapeHtml(chat.name)}</strong>
        <small>ADM pode mudar ícone, dar CO e banir membros.</small>
      </span>
      <button class="icon-button small" type="button" data-public-manage-close aria-label="Fechar">×</button>
    </div>
    <form class="public-icon-form" data-public-icon-form>
      <img src="${escapeHtml(chat.icon || DEFAULT_PROFILE_IMAGE)}" alt="" />
      <label>Ícone por URL <input name="icon" placeholder="Cole uma URL de imagem" /></label>
      <label>Dispositivo <input name="iconFile" type="file" accept="image/*" /></label>
      <button class="secondary-action" type="submit">Atualizar ícone</button>
    </form>
    <div class="public-member-list">
      ${chat.members.map(renderPublicManageMember).join("")}
    </div>
  `;
}

function renderPublicManageMember(member) {
  const isSelf = member.id === state.profile.id;
  return `
    <article class="public-member-row">
      <img src="${escapeHtml(member.avatar || DEFAULT_PROFILE_IMAGE)}" alt="" />
      <span>
        <strong>${escapeHtml(member.name)} ${isSelf ? "(você)" : ""}</strong>
        <small>${publicRoleLabel(member.role)} · @${escapeHtml(member.username)}</small>
      </span>
      <div>
        ${
          member.role === "ADM" || isSelf
            ? ""
            : `<button class="secondary-action" type="button" data-public-manage-action="${member.role === "CO" ? "demote" : "promote"}" data-member-id="${escapeHtml(member.id)}">${member.role === "CO" ? "Remover CO" : "Dar CO"}</button>
               <button class="secondary-action danger" type="button" data-public-manage-action="ban" data-member-id="${escapeHtml(member.id)}">Banir</button>`
        }
      </div>
    </article>
  `;
}

function handlePublicManageAction(button) {
  const chat = getActivePublicChat();
  if (!chat || !canManagePublicChat(chat)) return;
  const memberId = button.dataset.memberId;
  const member = chat.members.find((item) => item.id === memberId);
  if (!member || member.role === "ADM") return;
  if (button.dataset.publicManageAction === "promote") {
    member.role = "CO";
    addPublicSystemMessage(chat.id, `${member.name} recebeu o cargo CO.`);
  }
  if (button.dataset.publicManageAction === "demote") {
    member.role = "member";
    addPublicSystemMessage(chat.id, `${member.name} não é mais CO.`);
  }
  if (button.dataset.publicManageAction === "ban") {
    chat.members = chat.members.filter((item) => item.id !== memberId);
    chat.banned = [...new Set([...(chat.banned || []), memberId])];
    addPublicSystemMessage(chat.id, `${member.name} foi banido do chat público.`);
  }
  savePublicChats();
  renderPublicChatManageDialog(chat);
  renderChatDock();
}

function getChatPreview(message) {
  if (message.type === "image") return "Imagem";
  if (message.type === "video") return "Vídeo";
  if (message.type === "file") return message.name || "Arquivo";
  if (message.type === "system") return message.text || "Atualização";
  return message.text || "Mensagem";
}

function renderChatMessages(thread) {
  if (!elements.chatMessages || !thread) return;
  const messages = thread.messages || [];
  const publicChat = getActivePublicChat();
  const publicBanner = publicChat ? renderPublicCallBanner(publicChat) : "";
  if (!messages.length) {
    elements.chatMessages.innerHTML = `
      ${publicBanner}
      <div class="chat-empty">
        <strong>Nenhuma mensagem ainda.</strong>
        <span>Envie texto, mídia ou marque animes usando @nome.</span>
      </div>
    `;
    bindChatMessageActions();
    return;
  }

  elements.chatMessages.innerHTML = `${publicBanner}${messages.map(renderChatMessage).join("")}`;
  bindChatMessageActions();
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function bindChatMessageActions() {
  elements.chatMessages.querySelectorAll("[data-chat-anime]").forEach((button) => {
    button.addEventListener("click", () => {
      openDetails(Number(button.dataset.chatAnime));
    });
  });
  elements.chatMessages.querySelectorAll("[data-public-call-action]").forEach((button) => {
    button.addEventListener("click", () => handlePublicCallAction(button));
  });
  elements.chatMessages.querySelector("[data-public-manage]")?.addEventListener("click", openPublicChatManageDialog);
}

function renderPublicCallBanner(chat) {
  const role = getCurrentPublicRole(chat);
  const call = chat.call;
  const inCall = state.voiceCall?.publicChatId === chat.id;
  const mode = state.voiceCall?.mode;
  const canStart = canStartPublicCall(chat);
  return `
    <section class="public-call-banner ${call?.active ? "is-live" : ""}">
      <div>
        <span>${call?.active ? "Call pública ativa" : "Chat público"}</span>
        <strong>${call?.active ? `${call.participants?.length || 1} na call` : `${chat.members.length} membros`}</strong>
        <small>${publicRoleLabel(role)}${call?.active ? ` · iniciada por ${escapeHtml(call.startedBy || "ADM")}` : ""}</small>
      </div>
      <div class="public-call-actions">
        ${
          call?.active
            ? `
              ${inCall ? `<button class="secondary-action" type="button" data-public-call-action="${mode === "listener" ? "speak" : "listen"}">${mode === "listener" ? "Entrar falando" : "Só ouvir"}</button>` : ""}
              ${inCall ? `<button class="secondary-action" type="button" data-public-call-action="leave">Sair</button>` : `<button class="secondary-action" type="button" data-public-call-action="listen">Ouvir</button><button class="primary-action" type="button" data-public-call-action="speak">Falar</button>`}
              ${canStart ? `<button class="primary-action danger" type="button" data-public-call-action="end">Encerrar</button>` : ""}
            `
            : `${canStart ? `<button class="primary-action" type="button" data-public-call-action="start">Iniciar call</button>` : `<small>ADM ou CO podem iniciar call.</small>`}`
        }
        ${canManagePublicChat(chat) ? `<button class="secondary-action" type="button" data-public-manage>Gerenciar</button>` : ""}
      </div>
      ${call?.active ? renderPublicCallParticipants(chat) : ""}
    </section>
  `;
}

function renderPublicCallParticipants(chat) {
  const participants = Array.isArray(chat.call?.participants) ? chat.call.participants : [];
  if (!participants.length) return "";
  const speakers = participants.filter((participant) => participant.mode === "speaker");
  const listeners = participants.filter((participant) => participant.mode !== "speaker");
  return `
    <div class="public-call-participants" aria-label="Participantes da call">
      ${renderPublicCallParticipantGroup("Falando", speakers, chat)}
      ${renderPublicCallParticipantGroup("Escutando", listeners, chat)}
    </div>
  `;
}

function renderPublicCallParticipantGroup(label, participants, chat) {
  return `
    <section class="public-call-group">
      <div class="public-call-group-title">
        <strong>${label}</strong>
        <small>${participants.length.toLocaleString("pt-BR")}</small>
      </div>
      <div class="public-call-group-list">
        ${participants.length ? participants.map((participant) => renderPublicCallParticipant(chat, participant)).join("") : `<p>Ninguém aqui agora.</p>`}
      </div>
    </section>
  `;
}

function renderPublicCallParticipant(chat, participant) {
  const member = chat.members.find((item) => item.id === participant.id);
  const role = publicRoleLabel(normalizePublicRole(member?.role));
  const isSpeaker = participant.mode === "speaker";
  const muted = isSpeaker && Boolean(participant.muted);
  const canDrop = canDropPublicCallParticipant(chat, participant.id);
  return `
    <article class="public-call-participant ${isSpeaker ? "is-speaking" : "is-listening"} ${muted ? "is-muted" : ""}">
      <span class="public-call-avatar">
        <img src="${escapeHtml(participant.avatar || member?.avatar || DEFAULT_PROFILE_IMAGE)}" alt="" loading="lazy" decoding="async" />
        ${muted ? `<i aria-label="Microfone silenciado" title="Microfone silenciado">⌧</i>` : ""}
      </span>
      <span>
        <strong>${escapeHtml(participant.name || member?.name || "Membro")}</strong>
        <small>${role} · ${isSpeaker ? muted ? "Silenciado" : "Falando" : "Ouvindo"}</small>
      </span>
      ${canDrop ? `<button class="secondary-action" type="button" data-public-call-action="drop-speaker" data-public-participant-id="${escapeHtml(participant.id)}">Descer</button>` : ""}
    </article>
  `;
}

function handlePublicCallAction(source) {
  const chat = getActivePublicChat();
  if (!chat) return;
  const action = typeof source === "string" ? source : source?.dataset?.publicCallAction;
  const participantId = typeof source === "string" ? "" : source?.dataset?.publicParticipantId;
  if (action === "start") startPublicCall(chat.id);
  if (action === "listen") joinPublicCall(chat.id, "listener");
  if (action === "speak") joinPublicCall(chat.id, "speaker");
  if (action === "leave") leavePublicCall({ silent: false });
  if (action === "end") endPublicCall(chat.id);
  if (action === "drop-speaker") dropPublicCallParticipant(chat.id, participantId);
}

function renderChatMessage(message) {
  const time = formatChatTime(message.createdAt);
  const mine = message.from === "me";
  if (message.type === "system") {
    return `<p class="chat-system">${escapeHtml(message.text)} <span>${time}</span></p>`;
  }
  const profile = state.activeChatProfile || getActiveChatThread()?.profile || {};
  const senderName = mine ? state.profile.name || DEFAULT_PROFILE.name : profile.name || "Contato";
  const senderAvatar = mine ? getProfileAvatar() : profile.avatar || DEFAULT_PROFILE_IMAGE;
  return `
    <article class="chat-message ${mine ? "is-me" : "is-them"}">
      ${mine ? "" : `<img class="chat-sender-avatar" src="${escapeHtml(senderAvatar)}" alt="" loading="lazy" decoding="async" />`}
      <div class="chat-message-stack">
        ${mine ? "" : `<span class="chat-sender-name">${escapeHtml(senderName)}</span>`}
        <div class="chat-message-bubble">
          ${renderChatMessageBody(message)}
          <time>${time}${mine ? "<span>✓</span>" : ""}</time>
        </div>
      </div>
    </article>
  `;
}

function renderChatMessageBody(message) {
  const source = resolveChatMedia(message.src);
  if (message.type === "image") {
    if (!source) return renderChatMediaPlaceholder(message);
    return `<img class="chat-media" src="${escapeHtml(source)}" alt="${escapeHtml(message.name || "Imagem enviada")}" />`;
  }
  if (message.type === "video") {
    if (!source) return renderChatMediaPlaceholder(message);
    return `<video class="chat-media" src="${escapeHtml(source)}" controls preload="metadata"></video>`;
  }
  if (message.type === "audio") {
    if (!source) return renderChatMediaPlaceholder(message);
    return `<audio class="chat-audio" src="${escapeHtml(source)}" controls></audio>`;
  }
  if (message.type === "file") {
    if (!source) return renderChatMediaPlaceholder(message);
    return `<a class="chat-file-link" href="${escapeHtml(source)}" download="${escapeHtml(message.name || "arquivo")}">⌘ ${escapeHtml(message.name || "Arquivo")}</a>`;
  }
  return `<p>${renderChatText(message.text || "")}</p>`;
}

function renderChatMediaPlaceholder(message) {
  if (isChatMediaRef(message.src)) loadChatMediaAsset(message.src);
  return `<div class="chat-media-placeholder">${escapeHtml(message.name || "Mídia salva no dispositivo")}</div>`;
}

function renderChatText(text) {
  return escapeHtml(text).replace(/@\[([^\]]{1,80})\]|@([a-zA-Z0-9À-ÿ_.:-]{2,80})/g, (match, bracketLabel, simpleLabel) => {
    const label = String(bracketLabel || simpleLabel || "").replaceAll("_", " ");
    const anime = findAnimeByMention(label);
    if (!anime) return match;
    return `<button class="chat-mention" type="button" data-chat-anime="${anime.id}">@${escapeHtml(getTitle(anime))}</button>`;
  });
}

function submitChatMessage() {
  recoverActiveChatForSending();
  const text = elements.chatInput.value.trim();
  if (!text) return;
  if (!state.activeChatProfile) {
    showToast("Escolha uma conversa para enviar mensagem.");
    state.chatView = "list";
    renderChatDock();
    return;
  }
  addChatMessage({
    type: "text",
    text,
  });
  queueBotReply({ type: "text", text });
  elements.chatInput.value = "";
  awardXp(10, "mensagem", { silent: true });
}

function recoverActiveChatForSending() {
  if (state.activeChatProfile) return;
  const threads = getChatThreads();
  if (threads.length === 1) {
    state.activeChatProfile = normalizeDirectoryProfile(threads[0].profile);
    state.chatView = "thread";
    state.chatWindowOpen = true;
    return;
  }
  const visibleTitle = elements.chatTitle?.textContent?.trim();
  const visibleThread = threads.find((thread) => thread.profile?.name === visibleTitle);
  if (visibleThread) {
    state.activeChatProfile = normalizeDirectoryProfile(visibleThread.profile);
    state.chatView = "thread";
    state.chatWindowOpen = true;
  }
}

async function handleChatFileInput(input) {
  const file = input.files?.[0];
  input.value = "";
  if (!file || !state.activeChatProfile) return;
  if (String(file.type || "").startsWith("audio/")) {
    showToast("Envio de áudio removido. Use a chamada de voz.");
    return;
  }
  if (file.size > CHAT_ATTACHMENT_LIMIT_BYTES) {
    showToast("Arquivo grande demais para o modo local. Use até 40 MB.");
    return;
  }

  try {
    const type = getChatFileType(file);
    const src = await saveChatMediaFile(file);
    addChatMessage({
      type,
      src,
      name: file.name,
      mime: file.type,
    });
    queueBotReply({ type, name: file.name });
    awardXp(12, "mídia no chat", { silent: true });
  } catch {
    showToast("Não consegui anexar esse arquivo.");
  }
}

function getChatFileType(file) {
  const mime = String(file?.type || "");
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

function addChatMessage(partial) {
  const thread = getActiveChatThread();
  if (!thread) return;
  const threadId = getChatThreadId();
  thread.messages.push({
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    from: partial.from || "me",
    createdAt: new Date().toISOString(),
    ...partial,
  });
  if ((partial.from || "me") !== "me") {
    const isReadingThread = state.chatWindowOpen && state.chatView === "thread" && getChatThreadId(state.activeChatProfile) === threadId;
    if (!isReadingThread) {
      state.unreadThreads[threadId] = Number(state.unreadThreads[threadId] || 0) + 1;
      writeStore("anipulse:chatUnread", state.unreadThreads);
      showToast(`Nova mensagem de ${thread.profile?.name || "um contato"}`);
    }
  }
  saveChatThreads();
  renderChatDock();
}

function clearThreadUnread(threadId) {
  if (!threadId || !state.unreadThreads[threadId]) return;
  delete state.unreadThreads[threadId];
  writeStore("anipulse:chatUnread", state.unreadThreads);
  renderChatUnreadBadge();
}

function getTotalUnreadChats() {
  return Object.values(state.unreadThreads).reduce((total, count) => total + Number(count || 0), 0);
}

function renderChatUnreadBadge() {
  const total = getTotalUnreadChats();
  if (elements.chatUnreadBadge) {
    elements.chatUnreadBadge.hidden = total <= 0;
    elements.chatUnreadBadge.textContent = total > 99 ? "99+" : String(total);
  }
  document.querySelector("[data-show-notifications]")?.classList.toggle("has-chat-unread", total > 0);
}

function queueBotReply(message) {
  if (!isBotProfile(state.activeChatProfile)) return;
  const target = state.activeChatProfile;
  window.setTimeout(() => {
    if (!target || state.chatThreads[getChatThreadId(target)]?.profile?.id !== BOT_PROFILE_ID) return;
    const previousActive = state.activeChatProfile;
    state.activeChatProfile = target;
    addChatMessage({
      from: "bot",
      type: "text",
      text: getBotReply(message),
    });
    state.activeChatProfile = previousActive;
    renderChatDock();
  }, 520);
}

function getBotReply(message) {
  if (message.type && message.type !== "text") {
    return `Recebi o arquivo ${message.name || "enviado"}. Anexo funcionando por aqui.`;
  }

  const anime = state.trending[0] || state.media[0] || state.favorites[0];
  if (anime) {
    return `Mensagem recebida. Para testar menção clicável, tenta abrir @[${getTitle(anime)}].`;
  }
  return "Mensagem recebida. Quando o catálogo terminar de carregar, eu também consigo sugerir um anime por menção.";
}

function saveChatThreads() {
  try {
    writeStore(CHAT_THREADS_KEY, state.chatThreads);
  } catch {
    showToast("O navegador não conseguiu salvar esse chat localmente.");
  }
}

async function saveChatMediaFile(file) {
  const ref = `${CHAT_MEDIA_REF_PREFIX}${Date.now()}-${Math.random().toString(16).slice(2)}`;
  setChatMediaObjectUrl(ref, file);
  const db = await openProfileMediaDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(PROFILE_MEDIA_STORE, "readwrite");
    transaction.objectStore(PROFILE_MEDIA_STORE).put({
      id: ref,
      blob: file,
      type: file.type || "application/octet-stream",
      name: file.name,
      updatedAt: new Date().toISOString(),
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  return ref;
}

async function loadChatMediaAsset(ref) {
  if (!isChatMediaRef(ref) || state.chatMedia[ref] || pendingChatMediaLoads.has(ref)) return;
  pendingChatMediaLoads.add(ref);
  try {
    const db = await openProfileMediaDb();
    const item = await new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILE_MEDIA_STORE, "readonly");
      const request = transaction.objectStore(PROFILE_MEDIA_STORE).get(ref);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (item?.blob) {
      setChatMediaObjectUrl(ref, item.blob);
      renderChatDock();
    }
  } catch (error) {
    console.error(error);
  } finally {
    pendingChatMediaLoads.delete(ref);
  }
}

function setChatMediaObjectUrl(ref, blob) {
  if (state.chatMedia[ref]) {
    URL.revokeObjectURL(state.chatMedia[ref]);
  }
  state.chatMedia[ref] = URL.createObjectURL(blob);
}

function isChatMediaRef(value) {
  return String(value || "").startsWith(CHAT_MEDIA_REF_PREFIX);
}

function resolveChatMedia(value) {
  if (isChatMediaRef(value)) {
    return state.chatMedia[value] || "";
  }
  return String(value || "");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function startVoiceCall() {
  if (!state.activeChatProfile) return;
  if (isPublicChatProfile(state.activeChatProfile)) {
    const chat = getActivePublicChat();
    if (!chat) return;
    if (chat.call?.active) {
      joinPublicCall(chat.id, "listener");
      return;
    }
    if (!canStartPublicCall(chat)) {
      showToast("Apenas ADM ou CO podem iniciar call pública.");
      return;
    }
    startPublicCall(chat.id);
    return;
  }
  if (state.voiceCall) return;
  state.voiceCall = {
    startedAt: Date.now(),
    muted: false,
  };
  renderCallScreen();
  addChatMessage({
    type: "system",
    text: `Chamada de voz iniciada com ${state.activeChatProfile.name || DEFAULT_PROFILE.name}.`,
  });
  voiceCallInterval = window.setInterval(updateVoiceCallTimer, 1000);
  await setupCallAudio();
  startRemoteVoiceSimulation();
  renderScreenShareState();
  showToast("Chamada de voz iniciada.");
  renderChatDock();
}

function toggleVoiceMute() {
  if (!state.voiceCall) return;
  if (state.voiceCall.public && state.voiceCall.mode === "listener") {
    joinPublicCall(state.voiceCall.publicChatId, "speaker");
    return;
  }
  state.voiceCall.muted = !state.voiceCall.muted;
  syncPublicCallParticipantMute();
  if (state.callStream) {
    state.callStream.getAudioTracks().forEach((track) => {
      track.enabled = !state.voiceCall.muted;
    });
  }
  document.querySelectorAll("[data-chat-mute]").forEach((button) => {
    button.textContent = state.voiceCall.muted ? "Ativar áudio" : "Silenciar";
    button.setAttribute("aria-label", state.voiceCall.muted ? "Ativar microfone" : "Silenciar microfone");
  });
  updateVoiceCallTimer();
  if (state.voiceCall.public) renderChatDock();
}

function endVoiceCall(options = {}) {
  if (options instanceof Event) options = {};
  if (!state.voiceCall) return;
  if (state.voiceCall.public) {
    const chat = findPublicChat(state.voiceCall.publicChatId);
    if (chat && canStartPublicCall(chat)) {
      endPublicCall(chat.id, options);
    } else {
      leavePublicCall({ silent: options.skipRender });
    }
    return;
  }
  const seconds = Math.max(1, Math.round((Date.now() - state.voiceCall.startedAt) / 1000));
  const endedProfileName = state.activeChatProfile?.name || DEFAULT_PROFILE.name;
  clearVoiceCall();
  addChatMessage({
    type: "system",
    text: `Chamada com ${endedProfileName} encerrada. Duração: ${formatCallDuration(seconds)}.`,
  });
  if (!options.skipRender) renderChatDock();
  if (elements.chatInput && !options.skipFocus) {
    elements.chatInput.disabled = false;
    elements.chatInput.readOnly = false;
    elements.chatInput.focus();
  }
}

function clearVoiceCall() {
  stopScreenShare({ silent: true });
  state.voiceCall = null;
  if (voiceCallInterval) {
    window.clearInterval(voiceCallInterval);
    voiceCallInterval = null;
  }
  if (state.callVoiceFrame) {
    window.cancelAnimationFrame(state.callVoiceFrame);
    state.callVoiceFrame = 0;
  }
  if (state.callVoiceTimeout) {
    window.clearTimeout(state.callVoiceTimeout);
    state.callVoiceTimeout = 0;
  }
  if (state.remoteVoiceFrame) {
    window.cancelAnimationFrame(state.remoteVoiceFrame);
    state.remoteVoiceFrame = 0;
  }
  if (state.remoteVoiceTimeout) {
    window.clearTimeout(state.remoteVoiceTimeout);
    state.remoteVoiceTimeout = 0;
  }
  if (state.callStream) {
    state.callStream.getTracks().forEach((track) => track.stop());
    state.callStream = null;
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
  state.callAnalyser = null;
  state.callMicLevel = 0;
  state.callNoiseFloor = 0.018;
  state.callSpeakingFrames = 0;
  if (elements.callScreen) elements.callScreen.hidden = true;
  elements.callMeRing?.classList.remove("is-speaking");
  elements.callThemRing?.classList.remove("is-speaking");
  document.querySelectorAll("[data-chat-mute]").forEach((button) => {
    button.textContent = "Silenciar";
    button.setAttribute("aria-label", "Silenciar microfone");
  });
  if (elements.chatInput) {
    elements.chatInput.disabled = false;
    elements.chatInput.readOnly = false;
  }
}

function updateVoiceCallTimer() {
  if (!state.voiceCall) return;
  const startedAt = state.voiceCall.public
    ? findPublicChat(state.voiceCall.publicChatId)?.call?.startedAt || state.voiceCall.startedAt
    : state.voiceCall.startedAt;
  const seconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
  if (elements.callStatus) {
    if (state.voiceCall.public) {
      elements.callStatus.textContent = state.voiceCall.mode === "listener" ? "Ouvindo a call" : state.voiceCall.muted ? "Você silenciou" : "Falando na call";
    } else {
      elements.callStatus.textContent = state.screenSharing ? "Vendo sua tela" : state.voiceCall.muted ? "Você silenciou" : "Conectado";
    }
  }
  if (elements.callTimer) elements.callTimer.textContent = formatCallDuration(seconds);
}

function renderCallScreen() {
  if (state.voiceCall?.public) {
    renderPublicCallScreen();
    return;
  }
  const profile = state.activeChatProfile || {};
  if (!elements.callScreen) return;
  elements.callScreen.hidden = false;
  elements.callMeAvatar.src = getProfileAvatar();
  elements.callThemAvatar.src = profile.avatar || DEFAULT_PROFILE_IMAGE;
  elements.callMeName.textContent = state.profile.name || DEFAULT_PROFILE.name;
  elements.callThemName.textContent = profile.name || "Contato";
  renderScreenShareState();
  updateVoiceCallTimer();
}

function startPublicCall(chatId) {
  const chat = findPublicChat(chatId);
  if (!chat || !canStartPublicCall(chat)) return;
  const startedAt = new Date().toISOString();
  chat.call = {
    active: true,
    startedAt,
    startedBy: state.profile.name || DEFAULT_PROFILE.name,
    participants: createPublicCallDemoParticipants(chat, startedAt),
  };
  savePublicChats();
  addPublicSystemMessage(chat.id, `${state.profile.name || DEFAULT_PROFILE.name} iniciou uma call pública.`);
  joinPublicCall(chat.id, "speaker", { silent: true });
  showToast("Call pública iniciada.");
}

function createPublicCallDemoParticipants(chat, startedAt) {
  const botMember = chat.members.find((member) => member.id === BOT_PROFILE_ID && member.id !== state.profile.id);
  if (!botMember) return [];
  return [
    {
      id: botMember.id,
      name: botMember.name,
      avatar: botMember.avatar || DEFAULT_PROFILE_IMAGE,
      mode: "speaker",
      muted: false,
      joinedAt: startedAt,
    },
  ];
}

async function joinPublicCall(chatId, mode = "listener", options = {}) {
  const chat = findPublicChat(chatId);
  if (!chat?.call?.active) return;
  const safeMode = mode === "speaker" ? "speaker" : "listener";
  if (safeMode === "listener") releaseCallAudio();
  upsertPublicCallParticipant(chat, safeMode);
  savePublicChats();
  state.activeChatProfile = normalizeDirectoryProfile(publicChatToProfile(chat));
  state.voiceCall = {
    public: true,
    publicChatId: chat.id,
    startedAt: new Date(chat.call.startedAt).getTime(),
    muted: safeMode !== "speaker",
    mode: safeMode,
  };
  renderCallScreen();
  if (safeMode === "speaker") {
    await setupCallAudio();
  }
  startRemoteVoiceSimulation();
  renderChatDock();
  if (!options.silent) showToast(safeMode === "speaker" ? "Você entrou falando na call." : "Você entrou ouvindo a call.");
}

function releaseCallAudio() {
  if (state.callVoiceFrame) {
    window.cancelAnimationFrame(state.callVoiceFrame);
    state.callVoiceFrame = 0;
  }
  if (state.callVoiceTimeout) {
    window.clearTimeout(state.callVoiceTimeout);
    state.callVoiceTimeout = 0;
  }
  if (state.callStream) {
    state.callStream.getTracks().forEach((track) => track.stop());
    state.callStream = null;
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
  state.callAnalyser = null;
  state.callMicLevel = 0;
  state.callSpeakingFrames = 0;
  elements.callMeRing?.classList.remove("is-speaking");
}

function upsertPublicCallParticipant(chat, mode) {
  const member = getCurrentPublicMember(chat);
  if (!member) return;
  const participants = Array.isArray(chat.call.participants) ? chat.call.participants : [];
  chat.call.participants = [
    ...participants.filter((participant) => participant.id !== state.profile.id),
    {
      id: state.profile.id,
      name: state.profile.name || member.name,
      avatar: getProfileAvatar(),
      mode,
      muted: mode === "speaker" && Boolean(state.voiceCall?.publicChatId === chat.id && state.voiceCall.muted),
      joinedAt: new Date().toISOString(),
    },
  ];
}

function syncPublicCallParticipantMute() {
  if (!state.voiceCall?.public) return;
  const chat = findPublicChat(state.voiceCall.publicChatId);
  const participant = chat?.call?.participants?.find((item) => item.id === state.profile.id);
  if (!participant) return;
  participant.muted = participant.mode === "speaker" && Boolean(state.voiceCall.muted);
  savePublicChats();
}

function dropPublicCallParticipant(chatId, participantId) {
  const chat = findPublicChat(chatId);
  if (!chat?.call?.active || !canDropPublicCallParticipant(chat, participantId)) {
    showToast("Você não pode descer esse participante.");
    return;
  }
  const participant = chat.call.participants.find((item) => item.id === participantId);
  participant.mode = "listener";
  participant.muted = false;
  savePublicChats();

  if (state.voiceCall?.publicChatId === chat.id && participantId === state.profile.id) {
    state.voiceCall.mode = "listener";
    state.voiceCall.muted = true;
    releaseCallAudio();
    renderPublicCallScreen();
  }

  addPublicSystemMessage(chat.id, `${participant.name || "Participante"} foi movido para ouvinte por ${state.profile.name || DEFAULT_PROFILE.name}.`);
  renderChatDock();
  showToast(`${participant.name || "Participante"} agora só está ouvindo.`);
}

function leavePublicCall(options = {}) {
  const call = state.voiceCall;
  if (!call?.public) return;
  const chat = findPublicChat(call.publicChatId);
  if (chat?.call) {
    chat.call.participants = (chat.call.participants || []).filter((participant) => participant.id !== state.profile.id);
    savePublicChats();
  }
  clearVoiceCall();
  if (!options.silent) showToast("Você saiu da call pública.");
  renderChatDock();
}

function endPublicCall(chatId, options = {}) {
  const chat = findPublicChat(chatId);
  if (!chat?.call) return;
  const seconds = Math.max(1, Math.round((Date.now() - new Date(chat.call.startedAt).getTime()) / 1000));
  chat.call = null;
  savePublicChats();
  clearVoiceCall();
  addPublicSystemMessage(chat.id, `Call pública encerrada. Duração: ${formatCallDuration(seconds)}.`);
  if (!options.skipRender) renderChatDock();
}

function renderPublicCallScreen() {
  const chat = findPublicChat(state.voiceCall.publicChatId);
  if (!chat || !elements.callScreen) return;
  elements.callScreen.hidden = false;
  elements.callMeAvatar.src = getProfileAvatar();
  elements.callThemAvatar.src = chat.icon || DEFAULT_PROFILE_IMAGE;
  elements.callMeName.textContent = state.profile.name || DEFAULT_PROFILE.name;
  elements.callThemName.textContent = chat.name;
  document.querySelectorAll("[data-chat-mute]").forEach((button) => {
    button.textContent = state.voiceCall.mode === "listener" ? "Falar" : state.voiceCall.muted ? "Ativar áudio" : "Silenciar";
    button.setAttribute("aria-label", state.voiceCall.mode === "listener" ? "Entrar falando" : "Silenciar microfone");
  });
  document.querySelectorAll("[data-chat-end-call]").forEach((button) => {
    button.textContent = canStartPublicCall(chat) ? "Encerrar" : "Sair";
  });
  renderScreenShareState();
  updateVoiceCallTimer();
}

async function toggleScreenShare() {
  if (state.screenSharing) {
    stopScreenShare();
    return;
  }
  await startScreenShare();
}

async function startScreenShare() {
  if (!state.voiceCall) {
    showToast("Inicie uma chamada antes de transmitir a tela.");
    return;
  }
  if (!navigator.mediaDevices?.getDisplayMedia) {
    showToast("Seu navegador não liberou transmissão de tela.");
    return;
  }

  const preset = getScreenSharePreset(elements.callShareQuality?.value);
  const fps = getScreenShareFps(elements.callShareFps?.value);

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: preset.width },
        height: { ideal: preset.height },
        frameRate: { ideal: fps, max: fps },
      },
      audio: false,
    });
    state.screenStream = stream;
    state.screenSharing = true;
    stream.getVideoTracks().forEach((track) => {
      track.addEventListener("ended", () => stopScreenShare());
    });
    if (elements.callShareVideo) {
      elements.callShareVideo.srcObject = stream;
      elements.callShareVideo.play?.().catch(() => {});
    }
    addChatMessage({
      type: "system",
      text: `Transmissão de tela solicitada em ${preset.label} a ${fps} FPS.`,
    });
    awardXp(14, "transmissão de tela", { silent: true });
    renderScreenShareState();
    updateVoiceCallTimer();
    showToast("Transmissão de tela iniciada.");
  } catch {
    showToast("Transmissão cancelada ou não permitida.");
  }
}

function stopScreenShare(options = {}) {
  if (state.screenStream) {
    state.screenStream.getTracks().forEach((track) => track.stop());
  }
  const wasSharing = state.screenSharing;
  state.screenStream = null;
  state.screenSharing = false;
  if (elements.callShareVideo) {
    elements.callShareVideo.pause?.();
    elements.callShareVideo.srcObject = null;
  }
  renderScreenShareState();
  updateVoiceCallTimer();
  if (wasSharing && !options.silent) {
    addChatMessage({
      type: "system",
      text: "Transmissão de tela encerrada.",
    });
    showToast("Transmissão encerrada.");
  }
}

function renderScreenShareState() {
  const sharing = Boolean(state.screenSharing);
  if (elements.callSharePreview) elements.callSharePreview.hidden = !sharing;
  if (elements.callShareFullscreen) elements.callShareFullscreen.hidden = !sharing;
  if (elements.callShareButton) {
    elements.callShareButton.textContent = sharing ? "Parar tela" : "Transmitir tela";
    elements.callShareButton.classList.toggle("is-sharing", sharing);
  }
  if (elements.callShareQuality) elements.callShareQuality.disabled = sharing;
  if (elements.callShareFps) elements.callShareFps.disabled = sharing;
  if (elements.callShareLabel) {
    const preset = getScreenSharePreset(elements.callShareQuality?.value);
    const fps = getScreenShareFps(elements.callShareFps?.value);
    elements.callShareLabel.textContent = sharing ? `${preset.label} · ${fps} FPS` : "Transmitindo tela";
  }
}

function openScreenShareFullscreen() {
  if (!state.screenSharing) {
    showToast("Inicie uma transmissão de tela primeiro.");
    return;
  }
  const target = elements.callShareVideo || elements.callSharePreview;
  const requestFullscreen =
    target?.requestFullscreen ||
    target?.webkitRequestFullscreen ||
    target?.msRequestFullscreen;
  if (!requestFullscreen) {
    showToast("Tela cheia não disponível neste navegador.");
    return;
  }
  requestFullscreen.call(target).catch?.(() => {
    showToast("Não consegui abrir em tela cheia.");
  });
}

function getScreenSharePreset(value) {
  const presets = {
    sd: { label: "480P", width: 854, height: 480 },
    balanced: { label: "720P", width: 1280, height: 720 },
    hd: { label: "1080P", width: 1920, height: 1080 },
    qhd: { label: "1440P", width: 2560, height: 1440 },
    uhd: { label: "2160P", width: 3840, height: 2160 },
  };
  return presets[value] || presets.hd;
}

function getScreenShareFps(value) {
  const fps = Number(value) || 30;
  return [25, 30, 60, 120, 144].includes(fps) ? fps : 30;
}

async function setupCallAudio() {
  if (!navigator.mediaDevices?.getUserMedia) {
    startLocalVoiceSimulation();
    return;
  }

  try {
    state.callStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextConstructor({ latencyHint: "interactive" });
    if (audioContext.state === "suspended") {
      await audioContext.resume().catch(() => {});
    }
    const source = audioContext.createMediaStreamSource(state.callStream);
    state.callAnalyser = audioContext.createAnalyser();
    state.callAnalyser.fftSize = 1024;
    state.callAnalyser.smoothingTimeConstant = 0.72;
    source.connect(state.callAnalyser);
    watchLocalVoiceLevel();
  } catch {
    showToast("Microfone não liberado. A chamada continua em modo visual.");
    startLocalVoiceSimulation();
  }
}

function watchLocalVoiceLevel() {
  if (!state.callAnalyser || !state.voiceCall) return;
  const data = new Float32Array(state.callAnalyser.fftSize);
  const tick = () => {
    if (!state.callAnalyser || !state.voiceCall) return;
    state.callAnalyser.getFloatTimeDomainData(data);
    const rms = Math.sqrt(data.reduce((total, value) => total + value * value, 0) / data.length);
    state.callMicLevel = state.callMicLevel * 0.78 + rms * 0.22;
    state.callNoiseFloor = Math.min(0.05, state.callNoiseFloor * 0.985 + rms * 0.015);
    const threshold = Math.max(0.028, state.callNoiseFloor * 2.6);
    if (state.callMicLevel > threshold && !state.voiceCall.muted) {
      state.callSpeakingFrames = Math.min(10, state.callSpeakingFrames + 2);
    } else {
      state.callSpeakingFrames = Math.max(0, state.callSpeakingFrames - 1);
    }
    elements.callMeRing?.classList.toggle("is-speaking", state.callSpeakingFrames > 1);
    state.callVoiceFrame = window.requestAnimationFrame(tick);
  };
  tick();
}

function startLocalVoiceSimulation() {
  const tick = () => {
    if (!state.voiceCall) return;
    elements.callMeRing?.classList.toggle("is-speaking", !state.voiceCall.muted && Math.random() > 0.58);
    state.callVoiceTimeout = window.setTimeout(tick, 220);
  };
  tick();
}

function startRemoteVoiceSimulation() {
  const tick = () => {
    if (!state.voiceCall) return;
    elements.callThemRing?.classList.toggle("is-speaking", Math.random() > 0.54);
    state.remoteVoiceTimeout = window.setTimeout(tick, 260);
  };
  tick();
}

function formatCallDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatChatTime(value) {
  const date = isValidDate(value) ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function findAnimeByMention(label) {
  const needle = normalizeMentionText(label);
  if (!needle) return null;
  const candidates = getKnownAnimeCollection();
  return candidates.find((anime) => getTitleVariants(anime).some((title) => normalizeMentionText(title) === needle))
    || candidates.find((anime) => getTitleVariants(anime).some((title) => normalizeMentionText(title).includes(needle)));
}

function getKnownAnimeCollection() {
  return [
    ...state.media,
    ...state.trending,
    ...state.favorites,
    ...state.wishlist,
    ...state.history,
    ...state.completed,
    ...state.media.flatMap(getAnimeRecommendations),
    ...state.trending.flatMap(getAnimeRecommendations),
    ...state.favorites.flatMap(getAnimeRecommendations),
  ].filter(Boolean).filter(uniqueById);
}

function getTitleVariants(anime) {
  return [anime?.title?.english, anime?.title?.romaji, anime?.title?.native, getTitle(anime)].filter(Boolean);
}

function normalizeMentionText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function renderCharacterResultCard(character) {
  const favorite = isCharacterFavorite(character.id);
  return `
    <article class="character-result-card">
      <img src="${characterImage(character)}" alt="" loading="lazy" decoding="async" />
      <div>
        <h3>${escapeHtml(getCharacterName(character))}</h3>
        <p>${getCharacterAnimeLabel(character)}</p>
      </div>
      <button class="action-button character-fav-button ${favorite ? "is-favorite" : ""}" type="button" data-toggle-character-favorite="${character.id}">
        ${favorite ? "Favorito" : "Favoritar"}
      </button>
    </article>
  `;
}

function renderGrid() {
  if (!state.media.length) {
    elements.animeGrid.innerHTML = `<div class="empty-state">Nenhum anime encontrado.</div>`;
    elements.loadMoreButton.hidden = true;
    return;
  }

  elements.animeGrid.innerHTML = state.media.map(renderAnimeCard).join("");
  wireDynamicActions(elements.animeGrid);
  elements.loadMoreButton.hidden = !state.hasNextPage;
}

function renderAnimeCard(anime) {
  const title = getTitle(anime);
  const favorite = isFavorite(anime.id);
  const completed = isCompleted(anime.id);
  const wishlisted = isWishlisted(anime.id);
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "";
  const genres = (anime.genres || []).slice(0, 2).join(" / ");
  return `
    <article class="anime-card">
      <div class="anime-card-poster">
        <button class="poster-open" type="button" data-open-details="${anime.id}" aria-label="Abrir ${escapeHtml(title)}">
          <img src="${imageFor(anime)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" />
          <span>Ver detalhes</span>
        </button>
        <div class="poster-badges">
          ${score ? `<span class="poster-score">★ ${score}</span>` : ""}
          ${anime.seasonYear ? `<span>${anime.seasonYear}</span>` : ""}
        </div>
        <button
          class="icon-button favorite-toggle ${favorite ? "is-favorite" : ""}"
          type="button"
          data-toggle-favorite="${anime.id}"
          aria-label="${favorite ? "Remover favorito" : "Favoritar"}"
        >♥</button>
      </div>
      <div class="anime-card-body">
        <h3>${escapeHtml(title)}</h3>
        <p class="anime-card-kicker">${escapeHtml(genres || anime.format || "Anime")}</p>
        <div class="card-meta">
          ${chip(anime.format || "Anime")}
          ${chip(statusLabel(anime.status))}
        </div>
        <div class="card-actions">
          <button class="action-button card-primary-action" type="button" data-open-details="${anime.id}">Abrir</button>
          <button class="action-button complete-button ${completed ? "is-completed" : ""}" type="button" data-toggle-completed="${anime.id}">
            ${completed ? "Completo" : "Concluir"}
          </button>
          <button class="action-button wishlist-button ${wishlisted ? "is-wishlisted" : ""}" type="button" data-toggle-wishlist="${anime.id}">
            ${wishlisted ? "Na lista" : "Quero ver"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function wireDynamicActions(root) {
  root.querySelectorAll("[data-open-details]").forEach((button) => {
    button.addEventListener("click", () => openDetails(Number(button.dataset.openDetails)));
  });

  root.querySelectorAll("[data-toggle-favorite]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(Number(button.dataset.toggleFavorite));
    });
  });

  root.querySelectorAll("[data-add-history]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      addHistory(Number(button.dataset.addHistory));
      showToast("Adicionado ao histórico");
    });
  });

  root.querySelectorAll("[data-toggle-completed]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      await toggleCompleted(Number(button.dataset.toggleCompleted));
    });
  });

  root.querySelectorAll("[data-toggle-wishlist]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleWishlist(Number(button.dataset.toggleWishlist));
    });
  });

  root.querySelectorAll("[data-toggle-character-favorite]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleCharacterFavorite(Number(button.dataset.toggleCharacterFavorite));
    });
  });
}

function openDetails(id) {
  const anime = findAnime(id);
  if (!anime) return;

  state.activeDetailsId = anime.id;
  awardXp(12, "detalhes", { silent: true });
  addHistory(id, { silent: true });
  const title = getTitle(anime);
  const description = cleanDescription(anime.description);
  const bg = anime.bannerImage ? `url("${anime.bannerImage}") center/cover` : colorBackground(anime);
  const trailerUrl = getTrailerUrl(anime);
  const episodes = createEpisodeButtons(anime.episodes || 12);
  const recommendations = anime.recommendations?.nodes
    ?.map((node) => node.mediaRecommendation)
    ?.filter(Boolean)
    ?.slice(0, 6);
  const characters = getAnimeCharacters(anime);

  elements.detailsContent.innerHTML = `
    <div class="details-hero" style='--details-bg: ${bg}'>
      <img class="details-cover" src="${imageFor(anime, "extraLarge")}" alt="${escapeHtml(title)}" decoding="async" fetchpriority="high" />
      <div class="details-copy">
        <div class="details-meta">
          ${chip(anime.format || "Anime")}
          ${chip(statusLabel(anime.status))}
          ${anime.episodes ? chip(`${anime.episodes} eps`) : ""}
          ${anime.duration ? chip(`${anime.duration} min`) : ""}
          ${anime.averageScore ? chip(`${anime.averageScore}%`, "score") : ""}
        </div>
        <h2 id="detailsTitle">${escapeHtml(title)}</h2>
        <p>${escapeHtml(description || "Sinopse indisponível.")}</p>
        <div class="details-actions">
          <button class="primary-action" type="button" data-play-trailer="${anime.id}">
            ${trailerUrl ? "Assistir trailer" : "Trailer indisponível"}
          </button>
          <button class="secondary-action" type="button" data-toggle-favorite="${anime.id}">
            ${isFavorite(anime.id) ? "Remover favorito" : "Favoritar"}
          </button>
          <button class="secondary-action" type="button" data-toggle-completed="${anime.id}">
            ${isCompleted(anime.id) ? "Remover completo" : "Marcar completo"}
          </button>
          <button class="secondary-action" type="button" data-toggle-wishlist="${anime.id}">
            ${isWishlisted(anime.id) ? "Remover da lista" : "Lista de desejos"}
          </button>
        </div>
      </div>
    </div>

    <div class="details-body">
      <div class="player-section">
        <h3>Player</h3>
        <div class="player-shell" id="playerShell" style='--player-bg: ${bg}'>
          <div class="player-poster">
            <div>
              <div class="section-kicker">${trailerUrl ? "Trailer oficial" : "Sem vídeo"}</div>
              <h3>${escapeHtml(title)}</h3>
            </div>
          </div>
        </div>
        <div class="player-actions">
          <button class="episode-button" type="button" data-source="official">Oficial</button>
          <button class="episode-button" type="button" data-quality="720p">720p</button>
          <button class="episode-button" type="button" data-quality="1080p">1080p</button>
        </div>

        <h3>Episódios</h3>
        <div class="episode-grid">${episodes}</div>
      </div>

      <aside class="details-side">
        <div>
          <h3>Gêneros</h3>
          <div class="details-meta">
            ${(anime.genres || []).map((genre) => chip(genre)).join("")}
          </div>
        </div>

        <div>
          <h3 class="details-subheading">Personagens <span id="detailsCharacterCount">${characters.length ? `${characters.length}+` : "carregando"}</span></h3>
          <div class="character-grid details-character-grid" id="detailsCharacterGrid" aria-live="polite">
            ${characters.length ? renderMiniCards(characters, "character") : `<div class="empty-state">Carregando personagens...</div>`}
          </div>
        </div>

        <div>
          <h3>Recomendações</h3>
          <div class="recommendation-grid">
            ${renderMiniCards(recommendations, "recommendation")}
          </div>
        </div>

        <div class="ad-slot ad-rectangle"><span>Publicidade</span></div>
      </aside>
    </div>
  `;

  wireDynamicActions(elements.detailsContent);
  const playButton = elements.detailsContent.querySelector("[data-play-trailer]");
  playButton.disabled = !trailerUrl;
  playButton.addEventListener("click", () => startTrailer(anime, trailerUrl));

  elements.detailsContent.querySelectorAll("[data-quality], [data-source]").forEach((button) => {
    button.addEventListener("click", () => showToast("Fonte ajustada para trailer oficial"));
  });

  elements.detailsContent.querySelectorAll("[data-episode]").forEach((button) => {
    button.addEventListener("click", () => showToast(`Episódio ${button.dataset.episode} marcado no histórico`));
  });

  elements.detailsShell.hidden = false;
  document.body.style.overflow = "hidden";
  window.requestAnimationFrame(() => loadDetailsCharacters(anime.id, characters));
}

async function loadDetailsCharacters(animeId, fallback = []) {
  const cached = state.detailsCharacterCache.get(animeId);
  if (cached?.length) {
    renderDetailsCharacters(animeId, cached, cached.length);
    return;
  }

  updateDetailsCharacterLoading(fallback.length ? `${fallback.length}+` : "carregando");

  try {
    const data = await fetchAnimeCharacters(animeId);
    state.detailsCharacterCache.set(animeId, data.characters);
    renderDetailsCharacters(animeId, data.characters, data.total);
  } catch (error) {
    console.warn(error);
    renderDetailsCharacters(animeId, fallback, fallback.length);
    showToast("Não foi possível carregar todos os personagens agora.");
  }
}

function renderDetailsCharacters(animeId, characters, total = characters.length) {
  if (state.activeDetailsId !== animeId || elements.detailsShell.hidden) return;
  const grid = elements.detailsContent.querySelector("#detailsCharacterGrid");
  if (!grid) return;

  const items = characters.filter(Boolean);
  const token = `${animeId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  state.detailsCharacterRenderToken = token;
  grid.innerHTML = "";
  wireDetailsCharacterGrid(grid);

  if (!items.length) {
    grid.innerHTML = `<div class="empty-state">Sem personagens encontrados.</div>`;
    updateDetailsCharacterLoading("0 personagens");
    return;
  }

  renderDetailsCharacterChunk(grid, animeId, items, total || items.length, 0, token);
}

function renderDetailsCharacterChunk(grid, animeId, characters, total, start, token) {
  if (state.activeDetailsId !== animeId || state.detailsCharacterRenderToken !== token || elements.detailsShell.hidden) return;

  const end = Math.min(start + DETAILS_CHARACTER_RENDER_CHUNK, characters.length);
  grid.insertAdjacentHTML("beforeend", renderMiniCards(characters.slice(start, end), "character"));

  const totalLabel = Number(total || characters.length).toLocaleString("pt-BR");
  if (end < characters.length) {
    updateDetailsCharacterLoading(`${totalLabel} personagens · exibindo ${end}`);
    scheduleIdleTask(() => renderDetailsCharacterChunk(grid, animeId, characters, total, end, token));
    return;
  }

  updateDetailsCharacterLoading(`${totalLabel} ${Number(total || characters.length) === 1 ? "personagem" : "personagens"}`);
}

function wireDetailsCharacterGrid(grid) {
  if (grid.dataset.detailsWired) return;
  grid.dataset.detailsWired = "true";
  grid.addEventListener("click", (event) => {
    const characterButton = event.target.closest("[data-toggle-character-favorite]");
    if (characterButton) {
      event.stopPropagation();
      toggleCharacterFavorite(Number(characterButton.dataset.toggleCharacterFavorite));
      return;
    }

    const detailsButton = event.target.closest("[data-open-details]");
    if (detailsButton) {
      event.stopPropagation();
      openDetails(Number(detailsButton.dataset.openDetails));
    }
  });
}

function scheduleIdleTask(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 160 });
    return;
  }
  window.setTimeout(callback, 16);
}

function updateDetailsCharacterLoading(label) {
  const count = elements.detailsContent.querySelector("#detailsCharacterCount");
  if (count) count.textContent = label;
}

function startTrailer(anime, trailerUrl) {
  const shell = elements.detailsContent.querySelector("#playerShell");
  if (!shell || !trailerUrl) return;
  addHistory(anime.id, { silent: true });

  const iframe = `<iframe src="${trailerUrl}" title="Trailer oficial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;

  if (state.adMode === "high") {
    shell.innerHTML = `
      <div class="preroll">
        <div class="preroll-content">
          <div class="section-kicker">Publicidade</div>
          <h3>Seu vídeo começa em <span id="adCountdown">6</span>s</h3>
          <div class="progress-track"><div class="progress-fill" id="adProgress"></div></div>
          <button class="secondary-action" id="skipAdButton" type="button" disabled>Pular em 3s</button>
        </div>
      </div>
    `;
    runPreroll(shell, iframe);
  } else {
    shell.innerHTML = iframe;
  }
}

function runPreroll(shell, iframe) {
  let remaining = 6;
  const countdown = shell.querySelector("#adCountdown");
  const progress = shell.querySelector("#adProgress");
  const skipButton = shell.querySelector("#skipAdButton");
  const finish = () => {
    window.clearInterval(timer);
    shell.innerHTML = iframe;
  };

  skipButton.addEventListener("click", finish);

  const timer = window.setInterval(() => {
    remaining -= 1;
    countdown.textContent = String(Math.max(remaining, 0));
    progress.style.width = `${((6 - remaining) / 6) * 100}%`;
    if (remaining <= 3) {
      skipButton.disabled = false;
      skipButton.textContent = "Pular anúncio";
    }
    if (remaining <= 0) {
      finish();
    }
  }, 1000);
}

function closeDetails() {
  state.activeDetailsId = null;
  state.detailsCharacterRenderToken = "";
  elements.detailsShell.hidden = true;
  elements.detailsContent.innerHTML = "";
  document.body.style.overflow = "";
}

function renderMiniCards(items, type) {
  if (!items?.length) {
    return `<div class="empty-state">Sem dados.</div>`;
  }
  return items
    .map((item) => {
      if (type === "character") {
        const character = compactCharacter(item);
        const title = getCharacterName(character);
        return `
          <button class="mini-card mini-card-button ${isCharacterFavorite(character.id) ? "is-favorite" : ""}" type="button" data-toggle-character-favorite="${character.id}">
            <img src="${characterImage(character)}" alt="" loading="lazy" decoding="async" />
            <span>${escapeHtml(title)}<small>${isCharacterFavorite(character.id) ? "Favorito" : "Favoritar"}</small></span>
          </button>
        `;
      }

      const title = item.title?.english || item.title?.romaji || "Anime";
      const image = item.coverImage?.large;
      return `
        <button class="mini-card mini-card-button" type="button" data-open-details="${item.id}">
          <img src="${image || ""}" alt="" loading="lazy" decoding="async" />
          <span>${escapeHtml(title)}</span>
        </button>
      `;
    })
    .join("");
}

function createEpisodeButtons(count) {
  const safeCount = Math.min(Math.max(Number(count) || 12, 1), 24);
  return Array.from({ length: safeCount }, (_, index) => {
    const episode = index + 1;
    return `<button class="episode-button" type="button" data-episode="${episode}">EP ${episode}</button>`;
  }).join("");
}

function toggleFavorite(id) {
  const anime = findAnime(id);
  if (!anime) return;

  if (isFavorite(id)) {
    state.favorites = state.favorites.filter((item) => item.id !== id);
    showToast("Removido dos favoritos");
  } else {
    state.favorites = [compactAnime(anime), ...state.favorites.filter((item) => item.id !== id)];
    awardXp(18, "favorito", { silent: true });
    showToast("Adicionado aos favoritos");
  }

  writeStore("anipulse:favorites", state.favorites);
  renderLocalLists();
  renderGrid();
  renderSpotlight(state.trending[state.spotlightIndex] || state.trending[0]);
  if (!elements.detailsShell.hidden) openDetails(id);
}

async function toggleCompleted(id) {
  const anime = findAnime(id);
  if (!anime) return;

  if (isCompleted(id)) {
    state.completed = state.completed.filter((item) => item.id !== id);
    showToast("Removido dos completos");
  } else {
    const userRating = await requestAnimeRating(anime);
    if (userRating === null) return;

    const watchMinutes = getAnimeWatchMinutes(anime);
    state.completed = [
      {
        ...compactAnime(anime),
        completedAt: new Date().toISOString(),
        watchMinutes,
        userRating,
      },
      ...state.completed.filter((item) => item.id !== id),
    ];
    addHistory(id, { silent: true });
    awardXp(Math.max(35, Math.round(watchMinutes / 6)), "anime completo", { silent: true });
    showToast(`${formatHours(watchMinutes)} somadas ao perfil · Nota ${userRating}/10`);
  }

  writeStore("anipulse:completed", state.completed);
  renderLocalLists();
  renderGrid();
  renderSpotlight(state.trending[state.spotlightIndex] || state.trending[0]);
  if (!elements.detailsShell.hidden) {
    openDetails(id);
  }
}

function toggleWishlist(id) {
  const anime = findAnime(id);
  if (!anime) return;

  if (isWishlisted(id)) {
    state.wishlist = state.wishlist.filter((item) => item.id !== id);
    showToast("Removido da lista de desejos");
  } else {
    state.wishlist = [compactAnime(anime), ...state.wishlist.filter((item) => item.id !== id)];
    awardXp(14, "lista de desejos", { silent: true });
    showToast("Adicionado à lista de desejos");
  }

  writeStore("anipulse:wishlist", state.wishlist);
  renderLocalLists();
  renderGrid();
  renderSpotlight(state.trending[state.spotlightIndex] || state.trending[0]);
  if (!elements.detailsShell.hidden) openDetails(id);
}

function addHistory(id, options = {}) {
  const anime = findAnime(id);
  if (!anime) return;
  state.history = [compactAnime(anime), ...state.history.filter((item) => item.id !== id)].slice(0, 18);
  if (!options.silent) awardXp(12, "histórico", { silent: true });
  writeStore("anipulse:history", state.history);
  renderLocalLists();
  if (!options.silent) showToast("Histórico atualizado");
}

function isCompleted(id) {
  return state.completed.some((item) => item.id === id);
}

function getCompletionRating(anime) {
  const rating = Number(anime?.userRating);
  if (!Number.isFinite(rating)) return null;
  return Math.min(10, Math.max(0, Math.round(rating)));
}

function renderRatingStars(rating) {
  const safeRating = Math.min(10, Math.max(0, Math.round(Number(rating) || 0)));
  return `<span class="rating-stars">${Array.from({ length: 10 }, (_, index) => (index < safeRating ? "★" : "☆")).join("")}</span>`;
}

function requestAnimeRating(anime) {
  const title = getTitle(anime);
  const dialog = ensureRatingDialog();
  const titleElement = dialog.querySelector("#ratingAnimeTitle");
  const valueElement = dialog.querySelector("#ratingValue");
  const buttons = dialog.querySelectorAll("[data-rating-value]");
  const cancelButton = dialog.querySelector("[data-rating-cancel]");
  const backdrop = dialog.querySelector("[data-rating-backdrop]");
  let selected = 10;

  titleElement.textContent = title;
  valueElement.textContent = `${selected}/10`;
  buttons.forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.ratingValue) === selected);
  });
  dialog.hidden = false;
  document.body.style.overflow = "hidden";

  return new Promise((resolve) => {
    const cleanup = (value) => {
      dialog.hidden = true;
      document.body.style.overflow = elements.detailsShell.hidden ? "" : "hidden";
      buttons.forEach((button) => {
        button.removeEventListener("click", onChoose);
        button.removeEventListener("mouseover", onPreview);
      });
      cancelButton.removeEventListener("click", onCancel);
      backdrop.removeEventListener("click", onCancel);
      document.removeEventListener("keydown", onKeydown);
      resolve(value);
    };

    const onChoose = (event) => {
      cleanup(Number(event.currentTarget.dataset.ratingValue));
    };

    const onPreview = (event) => {
      selected = Number(event.currentTarget.dataset.ratingValue);
      valueElement.textContent = `${selected}/10`;
      buttons.forEach((button) => {
        button.classList.toggle("is-selected", Number(button.dataset.ratingValue) <= selected);
      });
    };

    const onCancel = () => cleanup(null);

    const onKeydown = (event) => {
      if (event.key === "Escape") onCancel();
    };

    buttons.forEach((button) => {
      button.addEventListener("click", onChoose);
      button.addEventListener("mouseover", onPreview);
    });
    cancelButton.addEventListener("click", onCancel);
    backdrop.addEventListener("click", onCancel);
    document.addEventListener("keydown", onKeydown);
  });
}

function ensureRatingDialog() {
  let dialog = document.querySelector("#ratingDialog");
  if (dialog) return dialog;

  dialog = document.createElement("div");
  dialog.id = "ratingDialog";
  dialog.className = "rating-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <div class="rating-backdrop" data-rating-backdrop></div>
    <section class="rating-panel" role="dialog" aria-modal="true" aria-labelledby="ratingTitle">
      <div>
        <div class="section-kicker">Anime assistido</div>
        <h2 id="ratingTitle">Dar nota</h2>
        <p id="ratingAnimeTitle"></p>
      </div>
      <strong id="ratingValue" class="rating-value">10/10</strong>
      <div class="rating-options" aria-label="Escolha uma nota de 0 a 10">
        ${Array.from({ length: 11 }, (_, index) => `<button type="button" data-rating-value="${index}">${index}</button>`).join("")}
      </div>
      <div class="rating-actions">
        <button class="secondary-action" type="button" data-rating-cancel>Cancelar</button>
      </div>
    </section>
  `;
  document.body.appendChild(dialog);
  return dialog;
}

function isWishlisted(id) {
  return state.wishlist.some((item) => item.id === id);
}

function toggleCharacterFavorite(id) {
  const character = findCharacter(id);
  if (!character) return;

  if (isCharacterFavorite(id)) {
    state.favoriteCharacters = state.favoriteCharacters.filter((item) => item.id !== id);
    showToast("Personagem removido dos favoritos");
  } else {
    state.favoriteCharacters = [compactCharacter(character), ...state.favoriteCharacters.filter((item) => item.id !== id)];
    awardXp(12, "personagem favorito", { silent: true });
    showToast("Personagem favoritado");
  }

  writeStore("anipulse:favoriteCharacters", state.favoriteCharacters);
  renderCharacterSearchResults();
  renderProfileFavoriteCharacters();
  if (!elements.detailsShell.hidden) {
    const title = elements.detailsContent.querySelector("[data-toggle-completed]")?.dataset.toggleCompleted;
    if (title) openDetails(Number(title));
  }
}

function isCharacterFavorite(id) {
  return state.favoriteCharacters.some((item) => item.id === id);
}

function findCharacter(id) {
  return [
    ...state.favoriteCharacters,
    ...state.characterResults,
    ...state.media.flatMap(getAnimeCharacters),
    ...state.trending.flatMap(getAnimeCharacters),
    ...state.favorites.flatMap(getAnimeCharacters),
    ...state.wishlist.flatMap(getAnimeCharacters),
    ...state.completed.flatMap(getAnimeCharacters),
    ...state.history.flatMap(getAnimeCharacters),
    ...Array.from(state.detailsCharacterCache.values()).flat(),
  ].find((item) => item.id === id);
}

function getAnimeCharacters(anime) {
  return anime?.characters?.nodes?.filter(Boolean) || [];
}

function renderLocalLists() {
  elements.favoriteCount.textContent = String(state.favorites.length);
  elements.wishlistCount.textContent = String(state.wishlist.length);
  elements.historyCount.textContent = String(state.history.length);
  updateProfileCounters();
  elements.favoritesList.innerHTML = renderCompactList(state.favorites, "Nenhum favorito.");
  elements.wishlistList.innerHTML = renderCompactList(state.wishlist, "Nada na lista de desejos.");
  elements.historyList.innerHTML = renderCompactList(state.history, "Nada assistido ainda.");
  wireCompactList(elements.favoritesList);
  wireCompactList(elements.wishlistList);
  wireCompactList(elements.historyList);
  if (!elements.profileView.hidden) renderProfileView();
}

function renderCompactList(items, emptyText) {
  if (!items.length) {
    return `<div class="empty-state">${emptyText}</div>`;
  }
  return items
    .slice(0, 5)
    .map(
      (item) => `
      <button class="compact-item" type="button" data-open-details="${item.id}">
        <img src="${imageFor(item)}" alt="" loading="lazy" decoding="async" />
        <span>${escapeHtml(getTitle(item))}</span>
      </button>
    `,
    )
    .join("");
}

function wireCompactList(root) {
  root.querySelectorAll("[data-open-details]").forEach((button) => {
    button.addEventListener("click", () => openDetails(Number(button.dataset.openDetails)));
  });
}

function renderGridSkeleton() {
  elements.animeGrid.innerHTML = Array.from({ length: 20 }, () => {
    return `
      <article class="anime-card">
        <div class="anime-card-poster skeleton"></div>
        <div class="anime-card-body">
          <div class="skeleton line wide"></div>
          <div class="skeleton line short"></div>
          <div class="skeleton line"></div>
        </div>
      </article>
    `;
  }).join("");
}

function renderError(message) {
  elements.animeGrid.innerHTML = `<div class="error-state">${escapeHtml(message)}</div>`;
  elements.loadMoreButton.hidden = true;
}

function updateCatalogMeta() {
  const label = state.filters.search ? `Resultado para "${state.filters.search}"` : "Explorar animes";
  elements.catalogTitle.textContent = label;
  elements.resultCount.textContent = state.total ? `${state.total.toLocaleString("pt-BR")} títulos` : "";
}

function updateCacheStatus(source) {
  if (!elements.cacheStatus) return;
  if (source === "live") {
    elements.cacheStatus.textContent = "Dados ao vivo";
    return;
  }
  if (state.cacheGeneratedAt) {
    const date = new Date(state.cacheGeneratedAt);
    elements.cacheStatus.textContent = `Cache ${date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    return;
  }
  elements.cacheStatus.textContent = "";
}

function setAdMode(mode) {
  state.adMode = mode;
  localStorage.setItem("anipulse:ads", mode);
  document.body.dataset.adMode = mode;
  document.querySelectorAll("[data-ad-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adMode === mode);
  });
  elements.stickyAd.classList.toggle("is-hidden", mode !== "high");
}

function hydrateProfile() {
  if (state.profileName && !storedProfile) {
    state.profile.name = state.profileName;
  }
  saveProfile();
}

function populateYears() {
  const currentYear = new Date().getFullYear();
  for (let year = currentYear + 1; year >= 1980; year -= 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    elements.yearFilter.appendChild(option);
  }
}

function getTrailerUrl(anime) {
  if (!anime.trailer?.id || anime.trailer.site !== "youtube") return "";
  return `https://www.youtube.com/embed/${anime.trailer.id}?autoplay=1&rel=0`;
}

function compactAnime(anime) {
  return {
    id: anime.id,
    title: anime.title,
    coverImage: anime.coverImage,
    bannerImage: anime.bannerImage,
    description: anime.description,
    episodes: anime.episodes,
    duration: anime.duration,
    status: anime.status,
    season: anime.season,
    seasonYear: anime.seasonYear,
    genres: anime.genres,
    averageScore: anime.averageScore,
    popularity: anime.popularity,
    format: anime.format,
    trailer: anime.trailer,
    recommendations: anime.recommendations,
    characters: anime.characters,
  };
}

function compactProfileAnime(anime) {
  return {
    id: anime.id,
    title: anime.title,
    coverImage: anime.coverImage,
    bannerImage: anime.bannerImage,
    episodes: anime.episodes,
    duration: anime.duration,
    seasonYear: anime.seasonYear,
    averageScore: anime.averageScore,
    format: anime.format,
    userRating: anime.userRating,
    watchMinutes: anime.watchMinutes,
  };
}

function compactCharacter(character) {
  return {
    id: character.id,
    name: character.name,
    image: character.image,
    favourites: character.favourites,
    media: character.media,
  };
}

function isFavorite(id) {
  return state.favorites.some((item) => item.id === id);
}

function getTitle(anime) {
  return anime?.title?.english || anime?.title?.romaji || anime?.title?.native || "Anime";
}

function getCharacterName(character) {
  return character?.name?.full || character?.name?.native || "Personagem";
}

function characterImage(character) {
  return character?.image?.large || DEFAULT_PROFILE_IMAGE;
}

function getCharacterAnimeLabel(character) {
  const titles = character?.media?.nodes
    ?.map((anime) => anime.title?.english || anime.title?.romaji)
    ?.filter(Boolean);
  if (titles?.length) return titles.slice(0, 2).join(", ");
  const fans = Number(character?.favourites || 0);
  return fans ? `${fans.toLocaleString("pt-BR")} fãs na AniList` : "Personagem de anime";
}

function imageFor(anime, size = "large") {
  return anime?.coverImage?.[size] || anime?.coverImage?.large || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='420'%3E%3Crect width='100%25' height='100%25' fill='%2329271f'/%3E%3C/svg%3E";
}

function cleanDescription(description = "") {
  return description
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

function statusLabel(status) {
  const labels = {
    FINISHED: "Finalizado",
    RELEASING: "Lançando",
    NOT_YET_RELEASED: "Em breve",
    CANCELLED: "Cancelado",
    HIATUS: "Pausado",
  };
  return labels[status] || "Anime";
}

function colorBackground(anime) {
  const color = anime?.coverImage?.color || "#29271f";
  return `linear-gradient(135deg, ${color}, #11110f)`;
}

function chip(value, className = "") {
  if (!value) return "";
  return `<span class="chip ${className}">${escapeHtml(String(value))}</span>`;
}

function showToast(message) {
  elements.toast.textContent = message;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.textContent = "";
  }, 2600);
}

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
