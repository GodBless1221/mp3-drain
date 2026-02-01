(function() {
  // 3D transform on mouse move
  const main = document.querySelector('main');

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    main.style.transform = `perspective(1000px) rotate3d(${-y}, ${x}, 0, ${Math.sqrt(x*x + y*y) * 5}deg)`;
  });

  // swing on hover
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => link.classList.add('swing'));
    link.addEventListener('mouseleave', () => link.classList.remove('swing'));
  });

  // PLAYER
  const tracks = document.querySelectorAll('.track');
  const titleEl = document.querySelector('.player-title');
  const statusEl = document.querySelector('.player-status');
  const timeEl = document.querySelector('.player-time');
  const progressBar = document.querySelector('.player-progress-bar');
  const playBtn = document.getElementById('play');
  const stopBtn = document.getElementById('stop');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  let currentTrack = -1;
  let isPlaying = false;
  let timer = null;
  let currentTime = 0;
  let totalTime = 0;

  const trackNames = [
    'Suiren', 'Kakashi', 'Kono Yoni Yomeri (Sono 1)',
    'Semi Tori No Hi', 'Kono Yoni Yomeri (Sono 2)',
    'Yume Dewa', 'Umi No Ue Kara', 'Utsukushiki Tennen'
  ];

  function parseDuration(str) {
    const [m, s] = str.split(':').map(Number);
    return m * 60 + s;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateDisplay() {
    if (currentTrack >= 0) {
      titleEl.textContent = `${String(currentTrack + 1).padStart(2, '0')}. ${trackNames[currentTrack]}`;
      timeEl.textContent = `${formatTime(currentTime)} / ${formatTime(totalTime)}`;
      progressBar.style.width = `${(currentTime / totalTime) * 100}%`;
    } else {
      titleEl.textContent = '- - -';
      timeEl.textContent = '00:00 / 00:00';
      progressBar.style.width = '0%';
    }
  }

  function selectTrack(index) {
    tracks.forEach(t => t.classList.remove('active', 'playing'));
    currentTrack = index;
    const track = tracks[index];
    track.classList.add('active');
    totalTime = parseDuration(track.dataset.duration);
    currentTime = 0;
    updateDisplay();
    if (isPlaying) {
      track.classList.add('playing');
    }
  }

  function play() {
    if (currentTrack === -1) selectTrack(0);
    isPlaying = true;
    statusEl.textContent = 'playing';
    playBtn.textContent = 'pause';
    tracks[currentTrack].classList.add('playing');
    tracks[currentTrack].classList.remove('active');

    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      currentTime++;
      updateDisplay();
      if (currentTime >= totalTime) {
        next();
      }
    }, 1000);
  }

  function pause() {
    isPlaying = false;
    statusEl.textContent = 'paused';
    playBtn.textContent = 'play';
    tracks[currentTrack].classList.remove('playing');
    tracks[currentTrack].classList.add('active');
    if (timer) clearInterval(timer);
  }

  function stop() {
    isPlaying = false;
    statusEl.textContent = 'stopped';
    playBtn.textContent = 'play';
    if (timer) clearInterval(timer);
    currentTime = 0;
    updateDisplay();
    tracks.forEach(t => t.classList.remove('playing'));
    if (currentTrack >= 0) {
      tracks[currentTrack].classList.add('active');
    }
  }

  function next() {
    const wasPlaying = isPlaying;
    const nextIndex = (currentTrack + 1) % tracks.length;
    selectTrack(nextIndex);
    if (wasPlaying) play();
  }

  function prev() {
    const wasPlaying = isPlaying;
    const prevIndex = (currentTrack - 1 + tracks.length) % tracks.length;
    selectTrack(prevIndex);
    if (wasPlaying) play();
  }

  playBtn.addEventListener('click', () => {
    if (isPlaying) pause();
    else play();
  });

  stopBtn.addEventListener('click', stop);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  tracks.forEach((track, i) => {
    track.addEventListener('click', () => {
      selectTrack(i);
      play();
    });
  });

  // PHOTOS - распределены по всему экрану с воздухом
  const photos = document.querySelectorAll('.photo');
  const sources = [
    'photo/220ae00a9952c0d229ef74ed2f50277e.jpg',
    'photo/73de252c60e3aacaed223c6b7339d777.jpg',
    'photo/b59c1a252380e39639c78fa2d8cf7c2e.jpg',
    'photo/f87697a229e2c0738557e6fae28d394e.jpg'
  ];

  // Позиции с хорошим распределением по экрану
  const positions = [
    { x: -8, y: 5, w: 22, r: -2 },      // левый верх (частично за экраном)
    { x: 75, y: 8, w: 18, r: 3 },       // правый верх
    { x: 70, y: 55, w: 26, r: -1 },     // правый низ
    { x: 2, y: 65, w: 20, r: 4 },       // левый низ
  ];

  const state = [];

  photos.forEach((photo, i) => {
    const pos = positions[i];
    photo.style.left = pos.x + 'vw';
    photo.style.top = pos.y + 'vh';
    photo.style.width = pos.w + 'vw';
    photo.style.transform = `rotate(${pos.r}deg)`;

    state.push({
      el: photo,
      baseX: pos.x,
      baseY: pos.y,
      baseR: pos.r,
      glitching: false,
      visible: true
    });
  });

  // jitter
  function jitter() {
    state.forEach(s => {
      if (s.glitching) return;
      const intensity = Math.random() > 0.92 ? 10 : 1.5;
      const tx = (Math.random() - 0.5) * intensity;
      const ty = (Math.random() - 0.5) * intensity;
      const r = s.baseR + (Math.random() - 0.5) * 1;
      s.el.style.transform = `translate(${tx}px, ${ty}px) rotate(${r}deg)`;
    });
  }

  // glitch
  function glitch(s) {
    if (s.glitching) return;
    s.glitching = true;
    const effects = [
      () => { s.el.style.filter = 'drop-shadow(2px 0 0 red) drop-shadow(-2px 0 0 cyan)'; },
      () => { s.el.style.filter = 'contrast(1.8) brightness(1.1)'; },
      () => { s.el.style.filter = 'invert(1)'; },
      () => { s.el.style.filter = 'blur(1px)'; },
      () => { s.el.style.filter = 'hue-rotate(90deg)'; },
      () => { s.el.style.transform = `translate(${(Math.random()-0.5)*30}px, ${(Math.random()-0.5)*15}px) rotate(${s.baseR + (Math.random()-0.5)*6}deg) skewX(${(Math.random()-0.5)*2}deg)`; }
    ];
    effects[Math.floor(Math.random() * effects.length)]();
    setTimeout(() => {
      s.el.style.filter = '';
      s.el.style.transform = `rotate(${s.baseR}deg)`;
      s.glitching = false;
    }, 50 + Math.random() * 80);
  }

  // flicker
  function flicker(s) {
    s.el.style.opacity = Math.random() * 0.2 + 0.1;
    setTimeout(() => { s.el.style.opacity = 0.8; }, 30 + Math.random() * 50);
  }

  // disappear/reappear с новой позицией
  function disappear(s) {
    if (!s.visible) return;
    s.visible = false;
    s.el.style.transition = 'opacity 0.3s';
    s.el.style.opacity = 0;

    setTimeout(() => {
      // Новая позиция с сохранением распределения
      const side = Math.random();
      if (side < 0.25) {
        // левая сторона
        s.baseX = -10 + Math.random() * 15;
        s.baseY = Math.random() * 70;
      } else if (side < 0.5) {
        // правая сторона
        s.baseX = 65 + Math.random() * 20;
        s.baseY = Math.random() * 70;
      } else if (side < 0.75) {
        // верх
        s.baseX = Math.random() * 80;
        s.baseY = -5 + Math.random() * 20;
      } else {
        // низ
        s.baseX = Math.random() * 80;
        s.baseY = 55 + Math.random() * 30;
      }

      s.baseR = (Math.random() - 0.5) * 8;
      s.el.style.left = s.baseX + 'vw';
      s.el.style.top = s.baseY + 'vh';
      s.el.style.width = (15 + Math.random() * 15) + 'vw';
      s.el.style.transform = `rotate(${s.baseR}deg)`;

      if (Math.random() > 0.5) {
        s.el.src = sources[Math.floor(Math.random() * sources.length)];
      }

      setTimeout(() => {
        s.el.style.opacity = 0.8;
        s.visible = true;
        setTimeout(() => { s.el.style.transition = ''; }, 300);
      }, 100);
    }, 500);
  }

  // slice
  function slice(s) {
    const n = 3 + Math.floor(Math.random() * 3);
    let clip = 'polygon(';
    for (let i = 0; i < n; i++) {
      const y1 = (i / n) * 100;
      const y2 = ((i + 1) / n) * 100;
      const off = (Math.random() - 0.5) * 12;
      clip += `${off}% ${y1}%, ${100+off}% ${y1}%, ${100+off}% ${y2}%, ${off}% ${y2}%`;
      if (i < n - 1) clip += ', ';
    }
    clip += ')';
    s.el.style.clipPath = clip;
    setTimeout(() => { s.el.style.clipPath = ''; }, 60 + Math.random() * 60);
  }

  setInterval(jitter, 80);
  setInterval(() => { if (Math.random() > 0.55) glitch(state[Math.floor(Math.random() * state.length)]); }, 180);
  setInterval(() => { if (Math.random() > 0.65) flicker(state[Math.floor(Math.random() * state.length)]); }, 250);
  setInterval(() => { if (Math.random() > 0.75) disappear(state[Math.floor(Math.random() * state.length)]); }, 5000);
  setInterval(() => { if (Math.random() > 0.7) slice(state[Math.floor(Math.random() * state.length)]); }, 500);

  // burst
  setInterval(() => {
    if (Math.random() > 0.88) {
      let c = 0;
      const b = setInterval(() => {
        state.forEach(s => { if (Math.random() > 0.5) glitch(s); });
        if (++c > 4) clearInterval(b);
      }, 40);
    }
  }, 7000);

})();
