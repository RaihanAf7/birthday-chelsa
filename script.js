/* =========================================================
   THEME SWITCHER (Dark/Light)
   ========================================================= */
function initTheme() {
  const savedTheme = localStorage.getItem('site-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('site-theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('theme-icon');
  if (themeBtn) {
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/* =========================================================
   SECURITY & AUTHENTICATION (STRICT LOCK FIX)
   ========================================================= */
const USER_PIN = "191026"; // PIN 6 Digit untuk Chelsa
const DEV_PIN  = "200522"; // PIN Khusus Dev Raihan

let enteredPin = "";
let isNavigating = false; // Penanda agar tidak terkunci saat pindah halaman internal

function pressNum(num) {
  if (enteredPin.length < 6) {
    enteredPin += num;
    updatePinDots();
  }
  if (enteredPin.length === 6) {
    setTimeout(verifyPin, 100);
  }
}

function clearPin() {
  enteredPin = "";
  updatePinDots();
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, idx) => {
    if (idx < enteredPin.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function verifyPin() {
  if (enteredPin === USER_PIN) {
    isNavigating = true; // Tandai navigasi resmi
    sessionStorage.setItem('unlocked', 'true');
    localStorage.setItem('audio_playing', 'true');
    localStorage.setItem('audio_current_time', '0'); // Reset musik mulai dari awal (detik 0)
    sessionStorage.removeItem('dev_bypass');
    window.location.href = "countdown.html";
  } else if (enteredPin === DEV_PIN) {
    isNavigating = true; // Tandai navigasi resmi
    sessionStorage.setItem('unlocked', 'true');
    localStorage.setItem('audio_playing', 'true');
    localStorage.setItem('audio_current_time', '0'); // Reset musik mulai dari awal (detik 0)
    sessionStorage.setItem('dev_bypass', 'true');
    window.location.href = "index.html";
  } else {
    const card = document.querySelector('.app-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => {
        card.classList.remove('shake');
        clearPin();
      }, 400);
    }
  }
}

function checkAuth() {
  if (sessionStorage.getItem('unlocked') !== 'true') {
    window.location.href = "lock.html";
  }
}

function relockPage() {
  sessionStorage.removeItem('unlocked');
  sessionStorage.removeItem('dev_bypass');
  window.location.href = "lock.html";
}

/* KUNCI KETAT SAAT REFRESH / DITUTUP (TAPI AMAN SAAT PINDAH HALAMAN) */
window.addEventListener('beforeunload', () => {
  if (!isNavigating) {
    sessionStorage.removeItem('unlocked');
  }
});

// Setiap klik link internal, izinkan navigasi tanpa mengunci
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link) {
    isNavigating = true;
  }
});

/* =========================================================
   COUNTDOWN TIMER & LOCK LOGIC
   ========================================================= */
let isTimeReached = false;
let globalTargetTime = 0;

function startCountdown(targetDateStr) {
  globalTargetTime = new Date(targetDateStr).getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const diff = globalTargetTime - now;

    if (diff <= 0) {
      isTimeReached = true;
      if (document.getElementById('days')) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
      }
      return;
    }

    isTimeReached = false;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (document.getElementById('days')) {
      document.getElementById('days').innerText = days < 10 ? '0' + days : days;
      document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
      document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
      document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function handleOpenClick() {
  const now = new Date().getTime();
  const isDev = sessionStorage.getItem('dev_bypass') === 'true';

  if (now >= globalTargetTime || isTimeReached || isDev) {
    isNavigating = true;
    window.location.href = "index.html";
  } else {
    showModal();
  }
}

function showModal() {
  const modal = document.getElementById('notice-modal');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('notice-modal');
  if (modal) modal.classList.remove('active');
}

/* =========================================================
   AUDIO PLAYER (CONTINUOUS PLAYBACK)
   ========================================================= */
function toggleAudio() {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('play-icon');
  
  if (!audio) return;

  if (audio.paused) {
    audio.play().then(() => {
      if (btn) btn.textContent = '⏸';
      localStorage.setItem('audio_playing', 'true');
    }).catch(err => {
      console.log("Autoplay terhalang:", err);
    });
  } else {
    audio.pause();
    if (btn) btn.textContent = '▶';
    localStorage.setItem('audio_playing', 'false');
  }
}

function initContinuousAudio() {
  const audio = document.getElementById('bg-audio');
  if (!audio) return;

  const savedTime = localStorage.getItem('audio_current_time');
  if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
  }

  const isAudioPlaying = localStorage.getItem('audio_playing');

  if (isAudioPlaying !== 'false') {
    audio.play().then(() => {
      const btn = document.getElementById('play-icon');
      if (btn) btn.textContent = '⏸';
      localStorage.setItem('audio_playing', 'true');
    }).catch(() => {
      const playOnClick = () => {
        audio.play().then(() => {
          const btn = document.getElementById('play-icon');
          if (btn) btn.textContent = '⏸';
          localStorage.setItem('audio_playing', 'true');
        });
      };
      document.body.addEventListener('click', playOnClick, { once: true });
    });
  } else {
    const btn = document.getElementById('play-icon');
    if (btn) btn.textContent = '▶';
  }

  audio.addEventListener('timeupdate', () => {
    localStorage.setItem('audio_current_time', audio.currentTime);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initContinuousAudio();
});