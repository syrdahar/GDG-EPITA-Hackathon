import Redis from "ioredis";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

/**
 * Store clé→valeur servant de source de vérité partagée par les agents
 * (cf. architecture : Redis est la source de vérité intermédiaire).
 *
 * - Si REDIS_URL est défini et joignable -> Redis.
 * - Sinon -> fallback automatique en mémoire, persisté sur disque (data/store.json)
 *   afin que la démo fonctionne même sans serveur Redis installé.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const FALLBACK_FILE = path.join(DATA_DIR, "store.json");

const NS = "eduquest";
const key = (...parts) => [NS, ...parts].join(":");
const INDEX_KEY = key("games"); // set des ids de jeux

let redis = null;
let usingRedis = false;
const mem = new Map(); // fallback en mémoire

function loadFallback() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = JSON.parse(fs.readFileSync(FALLBACK_FILE, "utf-8"));
      for (const [k, v] of Object.entries(raw)) mem.set(k, v);
    }
  } catch (err) {
    console.warn("[store] Impossible de charger le fallback disque:", err.message);
  }
}

let saveTimer = null;
function persistFallback() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(Object.fromEntries(mem)), "utf-8");
    } catch (err) {
      console.warn("[store] Échec de persistance disque:", err.message);
    }
  }, 200);
}

export async function initStore() {
  if (config.redisUrl) {
    try {
      redis = new Redis(config.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // pas de boucle de reconnexion infinie au boot
      });
      redis.on("error", () => {}); // évite les logs spam si Redis tombe
      await redis.connect();
      await redis.ping();
      usingRedis = true;
      console.log("[store] Connecté à Redis:", config.redisUrl);
      return;
    } catch (err) {
      console.warn(`[store] Redis injoignable (${err.message}) -> fallback mémoire+disque.`);
      redis = null;
    }
  } else {
    console.log("[store] REDIS_URL absent -> fallback mémoire+disque.");
  }
  loadFallback();
}

export function storeMode() {
  return usingRedis ? "redis" : "memory";
}

export async function setJSON(k, value) {
  const data = JSON.stringify(value);
  if (usingRedis) {
    await redis.set(k, data);
  } else {
    mem.set(k, data);
    persistFallback();
  }
}

export async function getJSON(k) {
  let raw;
  if (usingRedis) raw = await redis.get(k);
  else raw = mem.get(k);
  return raw ? JSON.parse(raw) : null;
}

export async function delKey(k) {
  if (usingRedis) await redis.del(k);
  else {
    mem.delete(k);
    persistFallback();
  }
}

async function addToIndex(id) {
  if (usingRedis) {
    await redis.sadd(INDEX_KEY, id);
  } else {
    const set = new Set(JSON.parse(mem.get(INDEX_KEY) || "[]"));
    set.add(id);
    mem.set(INDEX_KEY, JSON.stringify([...set]));
    persistFallback();
  }
}

async function listIndex() {
  if (usingRedis) return await redis.smembers(INDEX_KEY);
  return JSON.parse(mem.get(INDEX_KEY) || "[]");
}

// ─── Helpers métier ──────────────────────────────────────────────────────

export const keys = {
  knowledge: (id) => key("knowledge", id),
  story: (id) => key("story", id),
  game: (id) => key("game", id),
  meta: (id) => key("meta", id),
};

export async function saveKnowledge(id, knowledge) {
  await setJSON(keys.knowledge(id), knowledge);
}
export const getKnowledge = (id) => getJSON(keys.knowledge(id));

export async function saveStory(id, story) {
  await setJSON(keys.story(id), story);
}
export const getStory = (id) => getJSON(keys.story(id));

export async function saveGame(id, game) {
  await setJSON(keys.game(id), game);
  await addToIndex(id);
}
export const getGame = (id) => getJSON(keys.game(id));

export async function saveMeta(id, meta) {
  const existing = (await getJSON(keys.meta(id))) || {};
  await setJSON(keys.meta(id), { ...existing, ...meta, id });
}
export const getMeta = (id) => getJSON(keys.meta(id));

export async function listGames() {
  const ids = await listIndex();
  const metas = await Promise.all(ids.map((id) => getMeta(id)));
  return metas
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
