import axios from 'axios';

// Détecter le mode GitHub Pages ou forcer via variable d'env
const isGithubPages = typeof window !== 'undefined' && /\.github\.io$/.test(window.location.hostname);
const STATIC_MODE = (process.env.REACT_APP_STATIC_DATA === '1') || isGithubPages;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = (process.env.PUBLIC_URL || '') + '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data = {}, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url, data = {}, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch(url, data = {}, config = {}) {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Service statique pour GitHub Pages (utilise localStorage + un seed JSON)
class StaticApiService {
  constructor() {
    this.stateKey = 'pb_static_state_v1';
    this.basePath = (process.env.PUBLIC_URL || '') + '/data/seed.json';
    this.ready = this.#ensureState();
  }

  async #ensureState() {
    const existing = localStorage.getItem(this.stateKey);
    let data;
    if (!existing) {
      const res = await fetch(this.basePath);
      data = await res.json();
    } else {
      try { data = JSON.parse(existing); } catch { data = {}; }
    }
    if (!Array.isArray(data.binders)) data.binders = [];
    if (!Array.isArray(data.user_cards)) data.user_cards = [];
    if (!data.user) data.user = { id: 'demo-user', email: 'demo@example.com' };
    localStorage.setItem(this.stateKey, JSON.stringify(data));
  }

  #load() {
    return JSON.parse(localStorage.getItem(this.stateKey));
  }

  #save(data) {
    localStorage.setItem(this.stateKey, JSON.stringify(data));
    return data;
  }

  #slotsForSize(size) {
    switch (size) {
      case '4x4': return 16;
      case '5x5': return 25;
      case '3x3':
      default: return 9;
    }
  }

  #emptyPage(size) {
    const n = this.#slotsForSize(size);
    return { slots: Array.from({ length: n }, () => ({ card_id: null, user_card_id: null })) };
  }

  async get(url) {
    await this.ready;
    const state = this.#load();

    if (url === '/auth/me') {
      const token = localStorage.getItem('token');
      if (!token) {
        const err = new Error('Unauthorized');
        err.response = { status: 401 };
        throw err;
      }
      return state.user;
    }

    if (url === '/user/binders/') {
      return state.binders;
    }

    if (url === '/user/cards') {
      return state.user_cards;
    }

    const userCardGet = url.match(/^\/user\/cards\/(.+)$/);
    if (userCardGet) {
      const id = userCardGet[1];
      const card = state.user_cards.find(c => c.id === id);
      if (!card) throw new Error('User card not found');
      return card;
    }

    const binderMatch = url.match(/^\/user\/binders\/(.+)$/);
    if (binderMatch) {
      const id = binderMatch[1];
      const binder = state.binders.find(b => b.id === id);
      if (!binder) throw new Error('Binder not found');
      return binder;
    }

    throw new Error(`GET non géré en mode statique: ${url}`);
  }

  async post(url, data = {}) {
    await this.ready;
    const state = this.#load();

    if (url === '/auth/login') {
      const token = 'static-token';
      localStorage.setItem('token', token);
      if (data?.email) state.user.email = data.email;
      this.#save(state);
      return { access_token: token };
    }

    if (url === '/auth/signup') {
      return { success: true };
    }

    if (url === '/user/binders/') {
      const id = `b_${Date.now()}`;
      const size = data.size || '3x3';
      const pages = [this.#emptyPage(size)];
      const now = new Date().toISOString();
      const binder = {
        id,
        name: data.name || 'Nouveau binder',
        description: data.description || '',
        is_public: !!data.is_public,
        size,
        pages,
        total_pages: pages.length,
        total_cards: 0,
        preview_cards: [],
        created_at: now,
        updated_at: now
      };
      state.binders.unshift(binder);
      this.#save(state);
      return binder;
    }

    if (url === '/user/cards') {
      const id = `uc_${Date.now()}`;
      const now = new Date().toISOString();
      const card = {
        id,
        card_id: data.card_id,
        card_name: data.card_name || 'Carte',
        card_image: data.card_image || null,
        set_id: data.set_id || null,
        set_name: data.set_name || null,
        quantity: data.quantity || 1,
        condition: data.condition || 'Near Mint',
        rarity: data.rarity || null,
        local_id: data.local_id || null,
        created_at: now,
        updated_at: now
      };
      state.user_cards.unshift(card);
      this.#save(state);
      return card;
    }

    const addPageMatch = url.match(/^\/user\/binders\/(.+)\/pages$/);
    if (addPageMatch) {
      const id = addPageMatch[1];
      const binder = state.binders.find(b => b.id === id);
      if (!binder) throw new Error('Binder not found');
      binder.pages.push(this.#emptyPage(binder.size));
      binder.total_pages = binder.pages.length;
      binder.updated_at = new Date().toISOString();
      this.#save(state);
      return binder;
    }

    const addCardMatch = url.match(/^\/user\/binders\/(.+)\/cards$/);
    if (addCardMatch) {
      const id = addCardMatch[1];
      const binder = state.binders.find(b => b.id === id);
      if (!binder) throw new Error('Binder not found');
      const pageNum = data?.page_number || 1;
      const page = binder.pages[pageNum - 1] || binder.pages[0];
      let pos = data?.position;
      if (pos == null) {
        pos = page.slots.findIndex(s => !s.card_id);
        if (pos === -1) pos = 0;
      }
      page.slots[pos] = {
        card_id: data?.card_id || 'sv1-1',
        card_name: data?.card_name || 'Carte démo',
        user_card_id: `uc_${Date.now()}`
      };
      binder.total_cards = binder.pages.reduce((acc, p) => acc + p.slots.filter(s => s.card_id).length, 0);
      binder.preview_cards = binder.pages.flatMap(p => p.slots.filter(s => s.card_id).map(s => ({ card_id: s.card_id })));
      binder.updated_at = new Date().toISOString();
      this.#save(state);
      return binder;
    }

    throw new Error(`POST non géré en mode statique: ${url}`);
  }

  async patch(url, data = {}) {
    await this.ready;
    const state = this.#load();

    const updateMatch = url.match(/^\/user\/binders\/(.+)$/);
    if (updateMatch && !/\/cards\//.test(url)) {
      const id = updateMatch[1];
      const binder = state.binders.find(b => b.id === id);
      if (!binder) throw new Error('Binder not found');
      Object.assign(binder, data || {});
      binder.updated_at = new Date().toISOString();
      this.#save(state);
      return binder;
    }

    const moveMatch = url.match(/^\/user\/binders\/(.+)\/cards\/move$/);
    if (moveMatch) {
      const id = moveMatch[1];
      const binder = state.binders.find(b => b.id === id);
      if (!binder) throw new Error('Binder not found');
      const { source_page, source_position, destination_page, destination_position } = data;
      const src = binder.pages[source_page - 1].slots[source_position];
      const dst = binder.pages[destination_page - 1].slots[destination_position];
      binder.pages[source_page - 1].slots[source_position] = dst?.card_id ? dst : { card_id: null, user_card_id: null };
      binder.pages[destination_page - 1].slots[destination_position] = src;
      binder.updated_at = new Date().toISOString();
      this.#save(state);
      return binder;
    }

    const userCardPatch = url.match(/^\/user\/cards\/(.+)$/);
    if (userCardPatch) {
      const id = userCardPatch[1];
      const card = state.user_cards.find(c => c.id === id);
      if (!card) throw new Error('User card not found');
      Object.assign(card, data || {});
      card.updated_at = new Date().toISOString();
      this.#save(state);
      return card;
    }

    throw new Error(`PATCH non géré en mode statique: ${url}`);
  }

  async delete(url, config = {}) {
    await this.ready;
    const state = this.#load();

    const delCardMatch = url.match(/^\/user\/binders\/(.+)\/cards$/);
    if (delCardMatch) {
      const id = delCardMatch[1];
      const binder = state.binders.find(b => b.id === id);
      if (!binder) throw new Error('Binder not found');
      const { page_number, position } = (config && config.data) || {};
      if (page_number == null || position == null) throw new Error('Paramètres manquants');
      const page = binder.pages[page_number - 1];
      if (!page) throw new Error('Page invalide');
      page.slots[position] = { card_id: null, user_card_id: null };
      binder.total_cards = binder.pages.reduce((acc, p) => acc + p.slots.filter(s => s.card_id).length, 0);
      binder.preview_cards = binder.pages.flatMap(p => p.slots.filter(s => s.card_id).map(s => ({ card_id: s.card_id })));
      binder.updated_at = new Date().toISOString();
      this.#save(state);
      return binder;
    }

    const delBinderMatch = url.match(/^\/user\/binders\/(.+)$/);
    if (delBinderMatch) {
      const id = delBinderMatch[1];
      const next = state.binders.filter(b => b.id !== id);
      state.binders = next;
      this.#save(state);
      return { success: true };
    }

    const delUserCard = url.match(/^\/user\/cards\/(.+)$/);
    if (delUserCard) {
      const id = delUserCard[1];
      state.user_cards = state.user_cards.filter(c => c.id !== id);
      this.#save(state);
      return { success: true };
    }

    throw new Error(`DELETE non géré en mode statique: ${url}`);
  }
}

export const apiService = STATIC_MODE ? new StaticApiService() : new ApiService();
