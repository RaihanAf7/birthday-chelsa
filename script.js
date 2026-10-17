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
   SECURITY & AUTHENTICATION (6 DIGIT + DEV BYPASS)
   ========================================================= */
const USER_PIN = "191026"; // PIN 6 Digit untuk Chelsa (mengikuti countdown)
const DEV_PIN  = "200522"; // PIN Khusus Dev Raihan (langsung tembus ke index.html)

let enteredPin = "";

function pressNum(num) {
  if (enteredPin.length < 6) {
    enteredPin += num;
    updatePinDots();
  }
  if (enteredPin.length === 6) {
    setTimeout(verifyPin, 150);
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
    // PIN User Biasa: Lolos kunci, masuk ke countdown
    sessionStorage.setItem('unlocked', 'true');
    sessionStorage.setItem('should_play_audio', 'true');
    sessionStorage.removeItem('dev_bypass');
    window.location.href = "countdown.html";
  } else if (enteredPin === DEV_PIN) {
    // PIN Khusus Dev: Tembus langsung ke index.html tanpa nunggu 19 Oktober
    sessionStorage.setItem('unlocked', 'true');
    sessionStorage.setItem('should_play_audio', 'true');
    sessionStorage.setItem('dev_bypass', 'true');
    window.location.href = "index.html";
  } else {
    // PIN Salah
    const card = document.querySelector('.app-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => {
        card.classList.remove('shake');
        clearPin();
      }, 500);
    }
  }
}

function checkAuth() {
  if (sessionStorage.getItem('unlocked') !== 'true') {
    window.location.href = "lock.html";
  }
}

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

/* Klik tombol buka di halaman countdown */
function handleOpenClick() {
  const now = new Date().getTime();
  const isDev = sessionStorage.getItem('dev_bypass') === 'true';

  // Jika waktu sudah tiba ATAU menggunakan Dev Bypass
  if (now >= globalTargetTime || isTimeReached || isDev) {
    window.location.href = "index.html";
  } else {
    showModal();
  }
}

/* Modal Pop-up Control */
function showModal() {
  const modal = document.getElementById('notice-modal');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('notice-modal');
  if (modal) modal.classList.remove('active');
}

/* =========================================================
   FLOATING AUDIO PLAYER LOGIC & AUTOPLAY
   ========================================================= */
function toggleAudio() {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('play-icon');
  
  if (!audio) return;

  if (audio.paused) {
    audio.play().then(() => {
      if (btn) btn.textContent = '⏸';
    }).catch(err => {
      console.log("Autoplay dicegah oleh browser:", err);
    });
  } else {
    audio.pause();
    if (btn) btn.textContent = '▶';
  }
}

// Fungsi Autoplay saat masuk ke Halaman Utama
function autoPlayAudioOnLoad() {
  const audio = document.getElementById('bg-audio');
  const shouldPlay = sessionStorage.getItem('should_play_audio');

  if (audio && shouldPlay === 'true') {
    audio.play().then(() => {
      const btn = document.getElementById('play-icon');
      if (btn) btn.textContent = '⏸';
      sessionStorage.removeItem('should_play_audio');
    }).catch(err => {
      console.log("Autoplay terhalang interaksi pengguna:", err);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  autoPlayAudioOnLoad();
});