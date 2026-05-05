/* ═══════════════════════════════════════════
   letterboxdAR — App JavaScript (SPA)
   ═══════════════════════════════════════════ */

const API = 'http://localhost:8080';

// ── API Service ──────────────────────────

const api = {
    async get(path) {
        const res = await fetch(API + path);
        if (!res.ok) return null;
        return res.json();
    },
    async post(path, body) {
        const res = await fetch(API + path, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) return null;
        return res.json();
    },
    async put(path, body) {
        const opts = { method: 'PUT', headers: {} };
        if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
        const res = await fetch(API + path, opts);
        if (!res.ok) return null;
        return res.json();
    },
    async del(path) {
        const res = await fetch(API + path, { method: 'DELETE' });
        return res.ok;
    }
};

// ── State ────────────────────────────────

function getUserId() { return localStorage.getItem('letterboxdar_user_id'); }
function setUserId(id) { localStorage.setItem('letterboxdar_user_id', id); }
function clearUser() { localStorage.removeItem('letterboxdar_user_id'); }

// ── Helpers ──────────────────────────────

function $(sel) { return document.querySelector(sel); }
function show(id) { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(html) {
    $('#modal-content').innerHTML = html;
    $('#modal-overlay').classList.add('active');
    $('#modal-overlay').setAttribute('aria-hidden', 'false');
}

function closeModal() {
    $('#modal-overlay').classList.remove('active');
    $('#modal-overlay').setAttribute('aria-hidden', 'true');
}

function starsHtml(rating, size) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) s += '<span class="star filled">★</span>';
        else if (rating >= i - 0.5) s += '<span class="star half-filled">★</span>';
        else s += '<span class="star">★</span>';
    }
    return `<span class="${size === 'sm' ? 'star-rating-display' : 'star-rating'}">${s}</span>`;
}

function interactiveStars(currentRating, onChange) {
    const id = 'star-r-' + Date.now();
    setTimeout(() => {
        const container = document.getElementById(id);
        if (!container) return;
        container.querySelectorAll('.star').forEach((star, idx) => {
            star.addEventListener('click', (e) => {
                const rect = star.getBoundingClientRect();
                const half = e.clientX < rect.left + rect.width / 2;
                const val = half ? idx + 0.5 : idx + 1;
                onChange(val);
                updateStarDisplay(container, val);
            });
        });
        updateStarDisplay(container, currentRating);
    }, 50);
    let s = '';
    for (let i = 1; i <= 5; i++) s += '<span class="star" data-i="' + i + '">★</span>';
    return `<div class="star-rating" id="${id}">${s}</div>`;
}

function updateStarDisplay(container, rating) {
    container.querySelectorAll('.star').forEach((star, idx) => {
        const i = idx + 1;
        star.className = 'star';
        if (rating >= i) star.classList.add('filled');
        else if (rating >= i - 0.5) star.classList.add('half-filled');
    });
}

function genreClass(genre) {
    if (!genre) return '';
    const g = genre.toLowerCase().replace(/[^a-z]/g, '');
    const map = {scifi:'poster-scifi',sci:'poster-scifi',drama:'poster-drama',comedy:'poster-comedy',
        thriller:'poster-thriller',musical:'poster-musical',romance:'poster-romance',
        crime:'poster-crime',animation:'poster-animation',action:'poster-action',horror:'poster-horror'};
    return map[g] || '';
}

function movieCardHtml(movie) {
    const initial = movie.title ? movie.title[0].toUpperCase() : '?';
    const gc = genreClass(movie.genre);
    return `<div class="movie-card" onclick="navigateTo('/films/${movie.id}')" tabindex="0" role="button" aria-label="${movie.title}">
        <div class="movie-card-poster ${gc}">${initial}</div>
        <div class="movie-card-info">
            <div class="movie-card-title">${esc(movie.title)}</div>
            <div class="movie-card-director">${esc(movie.director || '')}</div>
            <div class="movie-card-meta">${movie.year || ''} ${movie.genre ? '<span class="genre-pill">' + esc(movie.genre) + '</span>' : ''}</div>
        </div>
    </div>`;
}

function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function formatDateForApi(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    if (Array.isArray(dateStr)) {
        const [y, m, d] = dateStr;
        return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
    }
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }
    return dateStr;
}

// ── Router ───────────────────────────────

function navigateTo(path) {
    window.location.hash = path;
}

function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

async function router() {
    const route = getRoute();
    const app = $('#app');
    app.innerHTML = '<div class="loading">Loading…</div>';
    app.classList.remove('page-enter');
    void app.offsetWidth;
    app.classList.add('page-enter');

    updateNav(route);

    if (route === '/' || route === '') {
        await renderHome(app);
    } else if (route === '/films') {
        await renderCatalog(app);
    } else if (route.startsWith('/films/')) {
        const id = route.split('/')[2];
        await renderDetail(app, id);
    } else if (route === '/profile') {
        await renderProfile(app);
    } else if (route === '/signup') {
        renderSignup(app);
    } else {
        app.innerHTML = `<div class="not-found"><h1>This page doesn't exist</h1><p>The page you're looking for can't be found.</p><a href="#/">Go home →</a></div>`;
    }
}

function updateNav(route) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const uid = getUserId();
    if (uid) { show('nav-profile-link'); hide('nav-signup-link'); }
    else { hide('nav-profile-link'); show('nav-signup-link'); }

    if (route === '/' || route === '') $('[data-page="home"]')?.classList.add('active');
    else if (route.startsWith('/films')) $('[data-page="films"]')?.classList.add('active');
    else if (route === '/profile') $('[data-page="profile"]')?.classList.add('active');
    else if (route === '/signup') $('[data-page="signup"]')?.classList.add('active');
}

// ── Page: Home ───────────────────────────

async function renderHome(app) {
    const movies = await api.get('/movies') || [];
    const cards = movies.slice(0, 10).map(movieCardHtml).join('');
    const uid = getUserId();
    app.innerHTML = `
        <div class="home-hero">
            <h1>letterboxdAR</h1>
            <p class="tagline">Your personal film journal.</p>
            ${uid ? '<a href="#/profile" class="cta-link">My profile →</a>' : '<a href="#/signup" class="cta-link">Start tracking →</a>'}
        </div>
        ${movies.length ? `
            <h2 class="home-section-title">Browse films</h2>
            <div class="home-movies-row">${cards}</div>
        ` : '<div class="empty-state">No films yet. <a href="#/films">Add some →</a></div>'}
    `;
}

// ── Page: Catalog ────────────────────────

async function renderCatalog(app) {
    const movies = await api.get('/movies') || [];
    app.innerHTML = `
        <div class="catalog-header">
            <h1>Films</h1>
            <div class="catalog-actions">
                <button class="add-btn" id="add-movie-btn" aria-label="Add a new movie">+ Add film</button>
            </div>
        </div>
        <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="search-input" placeholder="Search by title…" aria-label="Search films">
        </div>
        <div class="movies-grid" id="movies-grid"></div>
    `;

    function renderGrid(list) {
        const grid = $('#movies-grid');
        if (!list.length) {
            grid.innerHTML = '<div class="empty-state">No films found.<a href="#/films">Clear search</a></div>';
            return;
        }
        grid.innerHTML = list.map(movieCardHtml).join('');
    }

    renderGrid(movies);

    let timeout;
    $('#search-input').addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const q = e.target.value.toLowerCase().trim();
            renderGrid(q ? movies.filter(m => m.title.toLowerCase().includes(q)) : movies);
        }, 300);
    });

    $('#add-movie-btn').addEventListener('click', () => {
        openModal(`
            <h2>Add a film</h2>
            <form id="add-movie-form">
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="m-title" required placeholder="Film title"></div>
                <div class="form-group"><label class="form-label">Director</label><input class="form-input" id="m-director" required placeholder="Director name"></div>
                <div class="form-group"><label class="form-label">Year</label><input class="form-input" id="m-year" type="number" required placeholder="2024"></div>
                <div class="form-group"><label class="form-label">Genre</label><input class="form-input" id="m-genre" placeholder="Drama, Sci-Fi…"></div>
                <button type="submit" class="btn-primary">Add film</button>
            </form>
        `);
        $('#add-movie-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const movie = {
                title: $('#m-title').value, director: $('#m-director').value,
                year: parseInt($('#m-year').value), genre: $('#m-genre').value
            };
            const result = await api.post('/movies', movie);
            if (result) { closeModal(); toast('Film added!'); router(); }
            else toast('Error adding film');
        });
    });
}

// ── Page: Movie Detail ───────────────────

async function renderDetail(app, id) {
    const movie = await api.get('/movies/' + id);
    if (!movie) {
        app.innerHTML = '<div class="not-found"><h1>Film not found</h1><a href="#/films">Browse films →</a></div>';
        return;
    }
    const initial = movie.title ? movie.title[0].toUpperCase() : '?';
    const uid = getUserId();
    const gc = genreClass(movie.genre);

    app.innerHTML = `
        <div class="detail-layout">
            <div class="detail-poster ${gc}">${initial}</div>
            <div class="detail-info">
                <h1>${esc(movie.title)}</h1>
                <div class="detail-director">${esc(movie.director || '')}</div>
                <div class="detail-meta">${movie.year || ''}<span class="dot">·</span>${esc(movie.genre || '')}</div>
                <div class="detail-actions">
                    ${uid ? `<button class="detail-action-link" id="btn-watchlist">＋ Add to watchlist</button>` : ''}
                    ${uid ? `<button class="detail-action-link" id="btn-log">✎ Log this film</button>` : ''}
                    ${!uid ? `<p style="color:var(--text-light);font-size:0.9rem;font-style:italic"><a href="#/signup">Sign up</a> to track this film</p>` : ''}
                </div>
                <div class="detail-secondary">
                    <a href="#" id="btn-edit">Edit</a>
                    <a href="#" id="btn-delete">Delete</a>
                </div>
            </div>
        </div>
    `;

    if (uid) {
        $('#btn-watchlist')?.addEventListener('click', async () => {
            const r = await api.put('/users/' + uid + '/watchlist?movieTitle=' + encodeURIComponent(movie.title));
            if (r) toast('Added to watchlist!');
            else toast('Could not add to watchlist');
        });

        $('#btn-log')?.addEventListener('click', () => {
            let selectedRating = 0;
            openModal(`
                <h2>Log "${esc(movie.title)}"</h2>
                <form id="log-form">
                    <div class="form-group"><label class="form-label">Rating</label>
                        ${interactiveStars(0, (v) => { selectedRating = v; })}
                    </div>
                    <div class="form-group"><label class="form-label">Your thoughts</label>
                        <textarea class="form-input" id="log-review" placeholder="Write your thoughts…"></textarea>
                    </div>
                    <div class="form-group"><label class="form-label">Date watched</label>
                        <input type="date" class="form-input-date" id="log-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <button type="submit" class="btn-primary">Save entry</button>
                </form>
            `);
            $('#log-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const body = {
                    review: $('#log-review').value,
                    rating: selectedRating || null,
                    watchedDate: formatDateForApi($('#log-date').value)
                };
                const r = await api.put('/users/' + uid + '/watchedfilms?movieTitle=' + encodeURIComponent(movie.title), body);
                if (r) { closeModal(); toast('Film logged!'); }
                else toast('Error logging film');
            });
        });
    }

    $('#btn-edit')?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(`
            <h2>Edit film</h2>
            <form id="edit-movie-form">
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="e-title" value="${esc(movie.title)}" required></div>
                <div class="form-group"><label class="form-label">Director</label><input class="form-input" id="e-director" value="${esc(movie.director || '')}"></div>
                <div class="form-group"><label class="form-label">Year</label><input class="form-input" id="e-year" type="number" value="${movie.year || ''}"></div>
                <div class="form-group"><label class="form-label">Genre</label><input class="form-input" id="e-genre" value="${esc(movie.genre || '')}"></div>
                <button type="submit" class="btn-primary">Save changes</button>
            </form>
        `);
        $('#edit-movie-form').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const updated = {
                title: $('#e-title').value, director: $('#e-director').value,
                year: parseInt($('#e-year').value), genre: $('#e-genre').value
            };
            const r = await api.put('/movies/' + id, updated);
            if (r) { closeModal(); toast('Film updated!'); router(); }
            else toast('Error updating film');
        });
    });

    $('#btn-delete')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Delete this film?')) return;
        const ok = await api.del('/movies/' + id);
        if (ok) { toast('Film deleted'); navigateTo('/films'); }
        else toast('Error deleting film');
    });
}

// ── Page: Profile ────────────────────────

async function renderProfile(app) {
    const uid = getUserId();
    if (!uid) { navigateTo('/signup'); return; }

    const user = await api.get('/users/' + uid);
    if (!user) { clearUser(); navigateTo('/signup'); return; }

    const watchlist = await api.get('/users/' + uid + '/watchlist') || [];
    const diary = await api.get('/users/' + uid + '/watchedfilms') || [];

    const initial = user.username ? user.username[0].toUpperCase() : '?';
    const avgRating = diary.length ? (diary.reduce((a, d) => a + (d.rating || 0), 0) / diary.filter(d => d.rating).length).toFixed(1) : '–';

    app.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">${initial}</div>
            <div>
                <h1 class="profile-username">${esc(user.username)}</h1>
                <div class="profile-email">${esc(user.email)}</div>
            </div>
        </div>
        <div class="profile-stats">${diary.length} watched · ${watchlist.length} in watchlist · avg ${avgRating !== 'NaN' ? '★ ' + avgRating : '–'}</div>
        <a class="profile-edit-link" id="profile-edit-btn">Edit profile</a>
        <span style="margin:0 0.5rem;color:var(--text-light)">·</span>
        <a class="profile-edit-link" id="profile-logout-btn" style="color:var(--accent)">Log out</a>
        <div id="profile-edit-area"></div>
        <div class="tabs">
            <button class="tab-link active" data-tab="watchlist">Watchlist</button>
            <button class="tab-link" data-tab="diary">Diary</button>
        </div>
        <div id="tab-content"></div>
    `;

    function renderWatchlistTab() {
        const c = $('#tab-content');
        if (!watchlist.length) {
            c.innerHTML = '<div class="empty-state">Nothing here yet.<a href="#/films">Explore films →</a></div>';
            return;
        }
        c.innerHTML = watchlist.map(m => `
            <div class="watchlist-item">
                <div class="watchlist-thumb">${m.title ? m.title[0].toUpperCase() : '?'}</div>
                <span class="watchlist-title">${esc(m.title)}</span>
                <a class="watchlist-action" href="#/films/${m.id}">log it →</a>
            </div>
        `).join('');
    }

    function renderDiaryTab() {
        const c = $('#tab-content');
        if (!diary.length) {
            c.innerHTML = '<div class="empty-state">Nothing here yet.<a href="#/films">Explore films →</a></div>';
            return;
        }
        const sorted = [...diary].sort((a, b) => {
            const da = Array.isArray(a.watchedDate) ? new Date(a.watchedDate[0], a.watchedDate[1]-1, a.watchedDate[2]) : new Date(a.watchedDate);
            const db = Array.isArray(b.watchedDate) ? new Date(b.watchedDate[0], b.watchedDate[1]-1, b.watchedDate[2]) : new Date(b.watchedDate);
            return db - da;
        });
        c.innerHTML = sorted.map(d => `
            <div class="diary-entry">
                <span class="diary-date">${formatDateDisplay(d.watchedDate)}</span>
                <div>
                    <span class="diary-title">${esc(d.movie?.title || '?')}</span>
                    ${d.rating ? '<span class="diary-stars">' + starsHtml(d.rating, 'sm') + '</span>' : ''}
                    ${d.review ? `<div class="diary-review">${esc(d.review)}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Tab switching
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'watchlist') renderWatchlistTab();
            else renderDiaryTab();
        });
    });

    renderWatchlistTab();

    // Edit profile
    $('#profile-edit-btn').addEventListener('click', () => {
        const area = $('#profile-edit-area');
        if (area.innerHTML) { area.innerHTML = ''; return; }
        area.innerHTML = `
            <form class="inline-edit" id="edit-profile-form">
                <div class="form-group"><label class="form-label">Username</label><input class="form-input" id="ep-user" value="${esc(user.username)}"></div>
                <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="ep-email" value="${esc(user.email)}"></div>
                <button type="submit" class="btn-primary">Save</button>
            </form>
        `;
        $('#edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const r = await api.put('/users/' + uid, { username: $('#ep-user').value, email: $('#ep-email').value });
            if (r) { toast('Profile updated!'); router(); }
            else toast('Error updating profile');
        });
    });

    // Logout
    $('#profile-logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        clearUser();
        toast('Logged out');
        navigateTo('/');
    });
}

// ── Page: Signup ─────────────────────────

function renderSignup(app) {
    if (getUserId()) { navigateTo('/profile'); return; }
    app.innerHTML = `
        <div class="signup-wrapper">
            <h1>Join letterboxdAR</h1>
            <form id="signup-form">
                <div class="form-group"><label class="form-label">Username</label><input class="form-input" id="s-user" required placeholder="Your name"></div>
                <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="s-email" type="email" required placeholder="you@example.com"></div>
                <button type="submit" class="btn-primary">Create account</button>
            </form>
        </div>
    `;
    $('#signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = await api.post('/users', { username: $('#s-user').value, email: $('#s-email').value });
        if (user && user.id) {
            setUserId(user.id);
            toast('Welcome to letterboxdAR!');
            navigateTo('/profile');
        } else {
            toast('Error creating account');
        }
    });
}

// ── Init ─────────────────────────────────

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', async () => {
    // Auto-login as seeded user 1 if no user is stored
    if (!getUserId()) {
        const user = await api.get('/users/1');
        if (user && user.id) {
            setUserId(user.id);
        }
    }
    router();

    // Modal close handlers
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-overlay').addEventListener('click', (e) => {
        if (e.target === $('#modal-overlay')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Mobile menu toggle
    $('#nav-menu-toggle').addEventListener('click', () => {
        $('#nav-links').classList.toggle('open');
    });
});
