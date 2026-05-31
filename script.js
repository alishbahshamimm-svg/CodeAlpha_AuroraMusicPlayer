/* ============================================================
   AURORA MUSIC PLAYER — script.js
   Full-featured vanilla JS audio player
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   PLAYLIST DATA
   Using royalty-free / creative-commons
   placeholder art from picsum.photos
   Real songs would need src URLs.
   We simulate playback state without audio.
────────────────────────────────────────── */
const PLAYLIST = [
  {
    id: 1,
    title: 'Neon Horizon',
    artist: 'Synthwave Collective',
    album: 'Electric Dreams Vol.1',
    genre: 'Synthwave',
    duration: 214,
    art: 'https://picsum.photos/seed/aurora1/400/400',
    color: ['#8B5CF6','#06B6D4'],
    src: ''
  },
  {
    id: 2,
    title: 'Midnight Protocol',
    artist: 'Cyber Drift',
    album: 'Dark Matter EP',
    genre: 'Electronic',
    duration: 188,
    art: 'https://picsum.photos/seed/aurora2/400/400',
    color: ['#EC4899','#8B5CF6'],
    src: ''
  },
  {
    id: 3,
    title: 'Aurora Flux',
    artist: 'Stellar Echo',
    album: 'Orbital Sessions',
    genre: 'Ambient',
    duration: 251,
    art: 'https://picsum.photos/seed/aurora3/400/400',
    color: ['#06B6D4','#10B981'],
    src: ''
  },
  {
    id: 4,
    title: 'Digital Bloom',
    artist: 'Phase Array',
    album: 'Frequency',
    genre: 'Chillwave',
    duration: 197,
    art: 'https://picsum.photos/seed/aurora4/400/400',
    color: ['#F59E0B','#EC4899'],
    src: ''
  },
  {
    id: 5,
    title: 'Void Walker',
    artist: 'Static Pulse',
    album: 'Deep Space Mix',
    genre: 'Darkwave',
    duration: 223,
    art: 'https://picsum.photos/seed/aurora5/400/400',
    color: ['#6366F1','#8B5CF6'],
    src: ''
  },
  {
    id: 6,
    title: 'Crystal Rain',
    artist: 'Echo Chamber',
    album: 'Reflections',
    genre: 'Indie Electronic',
    duration: 176,
    art: 'https://picsum.photos/seed/aurora6/400/400',
    color: ['#06B6D4','#8B5CF6'],
    src: ''
  },
  {
    id: 7,
    title: 'Hypernova',
    artist: 'Quantum Beat',
    album: 'Supernova Sessions',
    genre: 'Techno',
    duration: 305,
    art: 'https://picsum.photos/seed/aurora7/400/400',
    color: ['#EF4444','#F59E0B'],
    src: ''
  },
  {
    id: 8,
    title: 'Silhouette City',
    artist: 'Neon Roads',
    album: 'Urban Legends',
    genre: 'Retrowave',
    duration: 241,
    art: 'https://picsum.photos/seed/aurora8/400/400',
    color: ['#EC4899','#06B6D4'],
    src: ''
  }
];

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
const state = {
  currentIndex:    0,
  isPlaying:       false,
  shuffle:         false,
  repeat:          false,  // 'off' | 'all' | 'one'
  repeatMode:      'off',
  volume:          70,
  muted:           false,
  favorites:       [],
  recentlyPlayed:  [],
  progress:        0,
  duration:        0,
  theme:           'dark',
  simulatedTime:   0,
  simulatedTimer:  null
};

/* ──────────────────────────────────────────
   DOM REFERENCES
────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const DOM = {
  loadingScreen:  $('loading-screen'),
  albumArt:       $('album-art'),
  albumCard:      $('album-card'),
  albumGlow:      $('album-glow'),
  vinylDisc:      $('vinyl-disc'),
  songTitle:      $('song-title'),
  songArtist:     $('song-artist'),
  songAlbum:      $('song-album'),
  songGenre:      $('song-genre'),
  songNumber:     $('song-number'),
  timeCurrent:    $('time-current'),
  timeTotal:      $('time-total'),
  progressFill:   $('progress-fill'),
  progressThumb:  $('progress-thumb'),
  progressWrap:   $('progress-bar-wrap'),
  btnPlay:        $('btn-play'),
  playIcon:       $('play-icon'),
  btnPrev:        $('btn-prev'),
  btnNext:        $('btn-next'),
  btnShuffle:     $('btn-shuffle'),
  btnRepeat:      $('btn-repeat'),
  btnFav:         $('btn-fav'),
  btnMute:        $('btn-mute'),
  btnAdd:         $('btn-add'),
  volumeSlider:   $('volume-slider'),
  volumeIcon:     $('volume-icon'),
  volumeValue:    $('volume-value'),
  visualizer:     $('visualizer'),
  vizBars:        document.querySelectorAll('.viz-bar'),
  queueList:      $('queue-list'),
  recentList:     $('recent-list'),
  favList:        $('fav-list'),
  favCount:       $('fav-count'),
  themeToggle:    $('theme-toggle'),
  themeIcon:      $('theme-icon'),
  sidebar:        $('sidebar'),
  sidebarToggle:  $('sidebar-toggle'),
  sidebarOverlay: $('sidebar-overlay'),
  toastContainer: $('toast-container'),
  searchInput:    $('search-input'),
  navItems:       document.querySelectorAll('.nav-item'),
  btnClearQueue:  $('btn-clear-queue'),
  particlesCanvas:$('particles-canvas'),
  audioPlayer:    $('audio-player')
};

/* ──────────────────────────────────────────
   LOCAL STORAGE HELPERS
────────────────────────────────────────── */
function saveState() {
  try {
    localStorage.setItem('aurora_index',    state.currentIndex);
    localStorage.setItem('aurora_volume',   state.volume);
    localStorage.setItem('aurora_theme',    state.theme);
    localStorage.setItem('aurora_favorites',JSON.stringify(state.favorites));
    localStorage.setItem('aurora_recent',   JSON.stringify(state.recentlyPlayed));
    localStorage.setItem('aurora_shuffle',  state.shuffle);
    localStorage.setItem('aurora_repeat',   state.repeatMode);
  } catch(e) {}
}

function loadState() {
  try {
    const idx  = localStorage.getItem('aurora_index');
    const vol  = localStorage.getItem('aurora_volume');
    const theme= localStorage.getItem('aurora_theme');
    const favs = localStorage.getItem('aurora_favorites');
    const rec  = localStorage.getItem('aurora_recent');
    const shuf = localStorage.getItem('aurora_shuffle');
    const rep  = localStorage.getItem('aurora_repeat');

    if (idx  !== null) state.currentIndex  = parseInt(idx)       || 0;
    if (vol  !== null) state.volume        = parseInt(vol)        || 70;
    if (theme!== null) state.theme         = theme;
    if (favs !== null) state.favorites     = JSON.parse(favs)    || [];
    if (rec  !== null) state.recentlyPlayed= JSON.parse(rec)     || [];
    if (shuf !== null) state.shuffle       = shuf === 'true';
    if (rep  !== null) state.repeatMode    = rep || 'off';
  } catch(e) {
    state.currentIndex = 0;
  }
}

/* ──────────────────────────────────────────
   TOAST NOTIFICATIONS
────────────────────────────────────────── */
function showToast(msg, iconClass = 'fa-music', colorClass = 'purple') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon ${colorClass}"></i>
    <span class="toast-msg">${msg}</span>
  `;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ──────────────────────────────────────────
   TIME FORMATTER
────────────────────────────────────────── */
function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* ──────────────────────────────────────────
   ALBUM GLOW
────────────────────────────────────────── */
function updateGlow(song) {
  const [c1, c2] = song.color;
  DOM.albumGlow.style.background = `radial-gradient(circle, ${c1}, ${c2})`;
}

/* ──────────────────────────────────────────
   LOAD SONG
────────────────────────────────────────── */
function loadSong(index, autoPlay = false) {
  const song = PLAYLIST[index];
  state.currentIndex = index;
  state.simulatedTime = 0;

  // Update DOM
  DOM.albumArt.src         = song.art;
  DOM.albumArt.alt         = `${song.title} by ${song.artist}`;
  DOM.songTitle.textContent  = song.title;
  DOM.songArtist.textContent = song.artist;
  DOM.songAlbum.textContent  = song.album;
  DOM.songGenre.textContent  = song.genre;
  DOM.songNumber.textContent = `${String(index+1).padStart(2,'0')} / ${String(PLAYLIST.length).padStart(2,'0')}`;
  DOM.timeTotal.textContent  = formatTime(song.duration);
  DOM.timeCurrent.textContent= '0:00';

  // Reset progress
  setProgress(0, song.duration);

  // Update glow
  updateGlow(song);

  // Favorite icon
  updateFavBtn();

  // Queue highlight
  renderQueue();
  renderRecent();
  renderFavorites();

  saveState();

  if (autoPlay) {
    startPlayback();
  } else {
    stopPlayback();
  }
}

/* ──────────────────────────────────────────
   PLAYBACK SIMULATION
   (Real audio needs src URLs; we simulate time)
────────────────────────────────────────── */
function startPlayback() {
  state.isPlaying = true;
  updatePlayBtn();
  startVisualizer();
  DOM.albumArt.classList.add('spinning');
  DOM.vinylDisc.classList.add('playing');

  clearInterval(state.simulatedTimer);
  const song = PLAYLIST[state.currentIndex];

  state.simulatedTimer = setInterval(() => {
    state.simulatedTime += 0.5;
    if (state.simulatedTime >= song.duration) {
      onTrackEnd();
    } else {
      setProgress(state.simulatedTime, song.duration);
      DOM.timeCurrent.textContent = formatTime(state.simulatedTime);
    }
  }, 500);
}

function stopPlayback() {
  state.isPlaying = false;
  updatePlayBtn();
  stopVisualizer();
  DOM.albumArt.classList.remove('spinning');
  DOM.vinylDisc.classList.remove('playing');
  clearInterval(state.simulatedTimer);
}

function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    // Add to recently played
    addToRecent(state.currentIndex);
    startPlayback();
  }
}

function onTrackEnd() {
  if (state.repeatMode === 'one') {
    state.simulatedTime = 0;
    startPlayback();
  } else {
    nextTrack(true);
  }
}

function updatePlayBtn() {
  if (state.isPlaying) {
    DOM.playIcon.className = 'fa-solid fa-pause';
    DOM.btnPlay.style.boxShadow = '0 0 40px rgba(139,92,246,0.6), 0 12px 32px rgba(0,0,0,0.5)';
  } else {
    DOM.playIcon.className = 'fa-solid fa-play';
    DOM.btnPlay.style.boxShadow = '';
  }
}

/* ──────────────────────────────────────────
   PROGRESS
────────────────────────────────────────── */
function setProgress(current, total) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  DOM.progressFill.style.width = pct + '%';
  DOM.progressThumb.style.right = '0';
  DOM.timeCurrent.textContent = formatTime(current);
}

DOM.progressWrap.addEventListener('click', e => {
  const rect = DOM.progressWrap.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  const song = PLAYLIST[state.currentIndex];
  state.simulatedTime = pct * song.duration;
  setProgress(state.simulatedTime, song.duration);
});

/* ──────────────────────────────────────────
   PREV / NEXT
────────────────────────────────────────── */
function prevTrack() {
  if (state.simulatedTime > 3) {
    state.simulatedTime = 0;
    setProgress(0, PLAYLIST[state.currentIndex].duration);
    if (state.isPlaying) startPlayback();
    return;
  }
  let idx = state.currentIndex - 1;
  if (idx < 0) idx = PLAYLIST.length - 1;
  loadSong(idx, state.isPlaying);
  showToast(`Now playing: ${PLAYLIST[idx].title}`, 'fa-backward-step', 'purple');
}

function nextTrack(auto = false) {
  let idx;
  if (state.shuffle) {
    do { idx = Math.floor(Math.random() * PLAYLIST.length); }
    while (idx === state.currentIndex && PLAYLIST.length > 1);
  } else {
    idx = (state.currentIndex + 1) % PLAYLIST.length;
  }
  addToRecent(state.currentIndex);
  loadSong(idx, state.isPlaying || auto);
  if (!auto) showToast(`Now playing: ${PLAYLIST[idx].title}`, 'fa-forward-step', 'cyan');
}

/* ──────────────────────────────────────────
   SHUFFLE & REPEAT
────────────────────────────────────────── */
function toggleShuffle() {
  state.shuffle = !state.shuffle;
  DOM.btnShuffle.classList.toggle('active', state.shuffle);
  saveState();
  showToast(state.shuffle ? 'Shuffle ON' : 'Shuffle OFF', 'fa-shuffle', 'cyan');
}

function cycleRepeat() {
  const modes = ['off','all','one'];
  const next  = modes[(modes.indexOf(state.repeatMode) + 1) % 3];
  state.repeatMode = next;
  DOM.btnRepeat.classList.toggle('active', next !== 'off');
  const icon = DOM.btnRepeat.querySelector('i');
  icon.className = next === 'one' ? 'fa-solid fa-repeat-1' : 'fa-solid fa-repeat';
  saveState();
  const labels = { off:'Repeat OFF', all:'Repeat ALL', one:'Repeat ONE' };
  showToast(labels[next], 'fa-repeat', 'purple');
}

/* ──────────────────────────────────────────
   VOLUME
────────────────────────────────────────── */
function setVolume(val) {
  state.volume = Math.max(0, Math.min(100, val));
  DOM.volumeSlider.value = state.volume;
  DOM.volumeValue.textContent = state.volume;
  updateVolumeIcon();
  updateVolumeSliderStyle();
  saveState();
}

function updateVolumeSliderStyle() {
  const pct = state.volume;
  DOM.volumeSlider.style.background =
    `linear-gradient(to right, var(--purple) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
}

function updateVolumeIcon() {
  const v = state.muted ? 0 : state.volume;
  if (v === 0)      DOM.volumeIcon.className = 'fa-solid fa-volume-xmark';
  else if (v < 40)  DOM.volumeIcon.className = 'fa-solid fa-volume-low';
  else if (v < 70)  DOM.volumeIcon.className = 'fa-solid fa-volume';
  else              DOM.volumeIcon.className = 'fa-solid fa-volume-high';
}

function toggleMute() {
  state.muted = !state.muted;
  DOM.volumeSlider.style.opacity = state.muted ? '0.4' : '1';
  updateVolumeIcon();
}

DOM.volumeSlider.addEventListener('input', () => {
  setVolume(parseInt(DOM.volumeSlider.value));
});
DOM.btnMute.addEventListener('click', toggleMute);

/* ──────────────────────────────────────────
   FAVORITES
────────────────────────────────────────── */
function toggleFavorite() {
  const id = PLAYLIST[state.currentIndex].id;
  const idx = state.favorites.indexOf(id);
  if (idx === -1) {
    state.favorites.push(id);
    showToast('Added to Favorites', 'fa-heart', 'pink');
  } else {
    state.favorites.splice(idx, 1);
    showToast('Removed from Favorites', 'fa-heart-crack', 'pink');
  }
  updateFavBtn();
  renderFavorites();
  updateFavCount();
  saveState();
}

function updateFavBtn() {
  const id      = PLAYLIST[state.currentIndex].id;
  const isFav   = state.favorites.includes(id);
  DOM.btnFav.classList.toggle('active', isFav);
  DOM.btnFav.querySelector('i').className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

function updateFavCount() {
  DOM.favCount.textContent = state.favorites.length;
}

/* ──────────────────────────────────────────
   RECENTLY PLAYED
────────────────────────────────────────── */
function addToRecent(index) {
  const id = PLAYLIST[index].id;
  state.recentlyPlayed = [id, ...state.recentlyPlayed.filter(i => i !== id)].slice(0, 5);
  renderRecent();
  saveState();
}

/* ──────────────────────────────────────────
   VISUALIZER
────────────────────────────────────────── */
let vizInterval = null;

function startVisualizer() {
  DOM.vizBars.forEach(bar => bar.classList.add('active'));
  clearInterval(vizInterval);
  vizInterval = setInterval(() => {
    DOM.vizBars.forEach(bar => {
      const h = Math.random() * 80 + 8;
      bar.style.height = h + '%';
    });
  }, 150);
}

function stopVisualizer() {
  DOM.vizBars.forEach(bar => {
    bar.classList.remove('active');
    bar.style.height = '8%';
  });
  clearInterval(vizInterval);
}

/* ──────────────────────────────────────────
   RENDER — QUEUE
────────────────────────────────────────── */
function renderQueue() {
  DOM.queueList.innerHTML = '';
  PLAYLIST.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = 'track-item' + (i === state.currentIndex ? ' active' : '');
    li.innerHTML = `
      <img class="track-thumb" src="${song.art}" alt="${song.title}" loading="lazy" />
      <div class="track-info">
        <div class="track-name">${song.title}</div>
        <div class="track-artist">${song.artist}</div>
      </div>
      ${i === state.currentIndex && state.isPlaying
        ? '<i class="fa-solid fa-volume-high track-playing-icon"></i>'
        : `<span class="track-duration">${formatTime(song.duration)}</span>`
      }
    `;
    li.addEventListener('click', () => {
      loadSong(i, true);
      addToRecent(i);
      showToast(`Now playing: ${song.title}`, 'fa-music', 'purple');
    });
    DOM.queueList.appendChild(li);
  });
}

/* ──────────────────────────────────────────
   RENDER — RECENTLY PLAYED
────────────────────────────────────────── */
function renderRecent() {
  DOM.recentList.innerHTML = '';
  if (state.recentlyPlayed.length === 0) {
    DOM.recentList.innerHTML = '<li style="color:var(--text-muted);font-size:0.78rem;padding:8px 10px;">No recent tracks yet.</li>';
    return;
  }
  state.recentlyPlayed.forEach(id => {
    const song = PLAYLIST.find(s => s.id === id);
    if (!song) return;
    const li = createTrackItem(song);
    DOM.recentList.appendChild(li);
  });
}

/* ──────────────────────────────────────────
   RENDER — FAVORITES
────────────────────────────────────────── */
function renderFavorites() {
  DOM.favList.innerHTML = '';
  if (state.favorites.length === 0) {
    DOM.favList.innerHTML = '<li style="color:var(--text-muted);font-size:0.78rem;padding:8px 10px;">No favorites yet.</li>';
    return;
  }
  state.favorites.forEach(id => {
    const song = PLAYLIST.find(s => s.id === id);
    if (!song) return;
    const li = createTrackItem(song);
    DOM.favList.appendChild(li);
  });
}

function createTrackItem(song) {
  const idx = PLAYLIST.findIndex(s => s.id === song.id);
  const li  = document.createElement('li');
  li.className = 'track-item' + (idx === state.currentIndex ? ' active' : '');
  li.innerHTML = `
    <img class="track-thumb" src="${song.art}" alt="${song.title}" loading="lazy" />
    <div class="track-info">
      <div class="track-name">${song.title}</div>
      <div class="track-artist">${song.artist}</div>
    </div>
    <span class="track-duration">${formatTime(song.duration)}</span>
  `;
  li.addEventListener('click', () => {
    loadSong(idx, true);
    addToRecent(idx);
    showToast(`Now playing: ${song.title}`, 'fa-music', 'cyan');
  });
  return li;
}

/* ──────────────────────────────────────────
   THEME
────────────────────────────────────────── */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  DOM.themeIcon.className = theme === 'dark'
    ? 'fa-solid fa-moon theme-icon'
    : 'fa-solid fa-sun theme-icon';
  saveState();
}

DOM.themeToggle.addEventListener('click', () => {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(`${next === 'dark' ? 'Dark' : 'Light'} mode activated`, 'fa-palette', 'purple');
});

/* ──────────────────────────────────────────
   SIDEBAR (MOBILE)
────────────────────────────────────────── */
DOM.sidebarToggle.addEventListener('click', () => {
  DOM.sidebar.classList.toggle('open');
  DOM.sidebarOverlay.classList.toggle('active');
});
DOM.sidebarOverlay.addEventListener('click', () => {
  DOM.sidebar.classList.remove('open');
  DOM.sidebarOverlay.classList.remove('active');
});

/* ──────────────────────────────────────────
   NAV ITEMS
────────────────────────────────────────── */
DOM.navItems.forEach(item => {
  item.addEventListener('click', () => {
    DOM.navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    // Ensure active bar exists
    if (!item.querySelector('.nav-active-bar')) {
      const bar = document.createElement('span');
      bar.className = 'nav-active-bar';
      item.prepend(bar);
    }
    DOM.navItems.forEach(n => {
      if (n !== item) {
        const bar = n.querySelector('.nav-active-bar');
        if (bar) bar.remove();
      }
    });
    // Close mobile sidebar
    DOM.sidebar.classList.remove('open');
    DOM.sidebarOverlay.classList.remove('active');
  });
});

/* ──────────────────────────────────────────
   SEARCH / FILTER
────────────────────────────────────────── */
DOM.searchInput.addEventListener('input', () => {
  const q = DOM.searchInput.value.toLowerCase().trim();
  if (!q) { renderQueue(); return; }
  DOM.queueList.innerHTML = '';
  PLAYLIST.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    s.album.toLowerCase().includes(q) ||
    s.genre.toLowerCase().includes(q)
  ).forEach((song) => {
    const idx = PLAYLIST.findIndex(s => s.id === song.id);
    const li  = document.createElement('li');
    li.className = 'track-item' + (idx === state.currentIndex ? ' active' : '');
    li.innerHTML = `
      <img class="track-thumb" src="${song.art}" alt="${song.title}" loading="lazy" />
      <div class="track-info">
        <div class="track-name">${song.title}</div>
        <div class="track-artist">${song.artist}</div>
      </div>
      <span class="track-duration">${formatTime(song.duration)}</span>
    `;
    li.addEventListener('click', () => { loadSong(idx, true); DOM.searchInput.value = ''; renderQueue(); });
    DOM.queueList.appendChild(li);
  });
});

/* ──────────────────────────────────────────
   CLEAR QUEUE (scroll to current)
────────────────────────────────────────── */
DOM.btnClearQueue.addEventListener('click', () => {
  const active = DOM.queueList.querySelector('.track-item.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ──────────────────────────────────────────
   BUTTON RIPPLE
────────────────────────────────────────── */
function addRipple(btn, e) {
  const ripple = document.createElement('span');
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  ripple.className = 'ripple-effect';
  ripple.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('.ctrl-btn').forEach(btn => {
  btn.addEventListener('click', e => addRipple(btn, e));
});

/* ──────────────────────────────────────────
   KEYBOARD SHORTCUTS
────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  // Ignore if typing in input
  if (e.target.tagName === 'INPUT') return;

  switch(e.code) {
    case 'Space':       e.preventDefault(); togglePlayback(); break;
    case 'ArrowRight':  e.preventDefault(); nextTrack();      break;
    case 'ArrowLeft':   e.preventDefault(); prevTrack();      break;
    case 'ArrowUp':     e.preventDefault(); setVolume(state.volume + 5); break;
    case 'ArrowDown':   e.preventDefault(); setVolume(state.volume - 5); break;
    case 'KeyS':        toggleShuffle();    break;
    case 'KeyR':        cycleRepeat();      break;
    case 'KeyF':        toggleFavorite();   break;
    case 'KeyM':        toggleMute();       break;
  }
});

/* ──────────────────────────────────────────
   PARTICLES BACKGROUND
────────────────────────────────────────── */
(function initParticles() {
  const canvas = DOM.particlesCanvas;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = Math.random() * 1.5 + 0.3;
    this.vx   = (Math.random() - 0.5) * 0.3;
    this.vy   = (Math.random() - 0.5) * 0.3;
    this.life = Math.random();
    const colors = ['rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(236,72,153,'];
    this.color= colors[Math.floor(Math.random()*colors.length)];
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.life += 0.003;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  Particle.prototype.draw = function() {
    const opacity = 0.4 + Math.sin(this.life) * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + opacity + ')';
    ctx.fill();
  };

  resize();
  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener('resize', resize);
})();

/* ──────────────────────────────────────────
   EVENT BINDINGS
────────────────────────────────────────── */
DOM.btnPlay.addEventListener('click',    togglePlayback);
DOM.btnPrev.addEventListener('click',    prevTrack);
DOM.btnNext.addEventListener('click',    nextTrack);
DOM.btnShuffle.addEventListener('click', toggleShuffle);
DOM.btnRepeat.addEventListener('click',  cycleRepeat);
DOM.btnFav.addEventListener('click',     toggleFavorite);
DOM.btnAdd.addEventListener('click', () => showToast('Added to playlist!', 'fa-circle-plus', 'cyan'));

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
function init() {
  loadState();

  // Clamp index
  if (state.currentIndex >= PLAYLIST.length) state.currentIndex = 0;

  // Apply saved theme
  applyTheme(state.theme);

  // Apply saved volume
  setVolume(state.volume);
  updateVolumeSliderStyle();

  // Shuffle / Repeat states
  DOM.btnShuffle.classList.toggle('active', state.shuffle);
  DOM.btnRepeat.classList.toggle('active', state.repeatMode !== 'off');

  // Load song (not auto-play on init)
  loadSong(state.currentIndex, false);

  // Render sidebar lists
  updateFavCount();
  renderRecent();
  renderFavorites();

  // Dismiss loading screen
  setTimeout(() => {
    DOM.loadingScreen.classList.add('hidden');
  }, 2000);

  // Welcome toast
  setTimeout(() => {
    showToast('Welcome back to Aurora 🎵', 'fa-waveform-lines', 'purple');
  }, 2400);
}

// Kick off
init();
