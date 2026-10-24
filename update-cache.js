const fs = require("fs/promises");
const path = require("path");

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const CACHE_PATH = path.join(__dirname, "data", "anime-cache.json");
const CATALOG_PAGE_SIZE = 50;

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

  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: mediaQuery, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((item) => item.message).join(", ") || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return {
    media: payload.data.Page.media.filter(Boolean),
    total: payload.data.Page.pageInfo.total,
    hasNextPage: payload.data.Page.pageInfo.hasNextPage,
  };
}

async function fetchGenres() {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: genreQuery }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((item) => item.message).join(", ") || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload.data.GenreCollection.filter(Boolean);
}

async function fetchAnimePages(params, pages = 4) {
  const first = await fetchAnime({ ...params, page: 1, perPage: CATALOG_PAGE_SIZE });
  const results = [first];
  let page = 2;

  while (page <= pages && results.at(-1).hasNextPage) {
    results.push(await fetchAnime({ ...params, page, perPage: CATALOG_PAGE_SIZE }));
    page += 1;
  }

  return {
    media: results.flatMap((result) => result.media),
    total: first.total,
    hasNextPage: results.at(-1).hasNextPage,
  };
}

async function buildCache() {
  const [genres, trending, catalog, popular, recent, releasing] = await Promise.all([
    fetchGenres(),
    fetchAnime({ sort: "TRENDING_DESC", page: 1, perPage: 30 }),
    fetchAnimePages({ sort: "TRENDING_DESC" }, 4),
    fetchAnimePages({ sort: "POPULARITY_DESC" }, 3),
    fetchAnimePages({ sort: "START_DATE_DESC" }, 3),
    fetchAnimePages({ sort: "TRENDING_DESC", status: "RELEASING" }, 2),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    source: "AniList GraphQL",
    genres,
    collections: {
      trending,
      catalog,
      popular,
      recent,
      releasing,
    },
  };
}

async function runOnce() {
  const startedAt = new Date();
  console.log(`[${startedAt.toLocaleString("pt-BR")}] Atualizando cache da AniList...`);
  const cache = await buildCache();
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  console.log(
    `[${new Date().toLocaleString("pt-BR")}] Cache salvo em ${CACHE_PATH} com ${cache.collections.catalog.media.length} animes.`,
  );
}

function getIntervalMs() {
  const equalArg = process.argv.find((arg) => arg.startsWith("--interval-minutes="));
  const nextArgIndex = process.argv.indexOf("--interval-minutes");
  const value = equalArg?.split("=")[1] || (nextArgIndex >= 0 ? process.argv[nextArgIndex + 1] : "");
  const minutes = Number(value || process.env.ANIPULSE_INTERVAL_MINUTES || 30);
  return Math.max(minutes, 5) * 60 * 1000;
}

async function main() {
  const watch = process.argv.includes("--watch");
  await runOnce();

  if (!watch) return;

  const intervalMs = getIntervalMs();
  console.log(`Modo contínuo ativo. Próxima atualização em ${Math.round(intervalMs / 60000)} minutos.`);
  setInterval(() => {
    runOnce().catch((error) => {
      console.error(`[${new Date().toLocaleString("pt-BR")}] Falha ao atualizar: ${error.message}`);
    });
  }, intervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
