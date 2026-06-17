// Petite couche d'accès à l'API backend.

async function handle(res) {
  if (!res.ok && res.status !== 202) {
    let msg = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  health: () => fetch("/api/health").then(handle),

  generate: (file) => {
    const fd = new FormData();
    if (file) fd.append("pdf", file);
    return fetch("/api/generate", { method: "POST", body: fd }).then(handle);
  },

  status: (id) => fetch(`/api/games/${id}/status`).then(handle),

  game: (id) => fetch(`/api/games/${id}`).then(handle),

  list: () => fetch("/api/games").then(handle),

  edit: (id, command) =>
    fetch(`/api/games/${id}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    }).then(handle),
};
