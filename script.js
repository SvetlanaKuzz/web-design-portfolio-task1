(function () {
      'use strict';

      const $  = (s, c = document) => c.querySelector(s);
      const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

      /* 1. ТЕМА */
      const root = document.documentElement;
      const THEME_KEY = 'portfolio-theme-v2';

      function applyTheme(t) {
        root.setAttribute('data-theme', t);
        const m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute('content', t === 'dark' ? '#07080b' : '#f6f7fa');
      }

      const saved = localStorage.getItem(THEME_KEY);
      const sysLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(saved || (sysLight ? 'light' : 'dark'));

      $('#themeBtn').addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
      });

      /* 2. КАСТОМНЫЙ КУРСОР */
      if (!isTouch && !reduce) {
        const cross = $('#cursorCross');

        document.addEventListener('mousemove', (e) => {
          cross.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          cross.classList.add('is-visible');
        });

        document.addEventListener('mouseleave', () => {
          cross.classList.remove('is-visible');
        });

        const hoverables = 'a, button, input, textarea, .chips li, [data-tilt], .row, .stat, .contact-list a';
        document.addEventListener('mouseover', (e) => {
          if (e.target.closest(hoverables)) cross.classList.add('is-hover');
        });
        document.addEventListener('mouseout', (e) => {
          if (e.target.closest(hoverables)) cross.classList.remove('is-hover');
        });
      }

      /* 3. МОБИЛЬНОЕ МЕНЮ */
      const burger = $('#burger');
      const nav = $('#nav');

      function closeMenu() {
        nav.classList.remove('nav--open');
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Открыть меню');
      }

      burger.addEventListener('click', () => {
        const open = nav.classList.toggle('nav--open');
        burger.classList.toggle('is-active', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      });

      $$('.nav__link').forEach((l) => l.addEventListener('click', closeMenu));
      document.addEventListener('click', (e) => {
        if (!nav.classList.contains('nav--open')) return;
        if (!nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
      window.addEventListener('resize', () => { if (window.innerWidth >= 900) closeMenu(); });

      /* 4. ПРОКРУТКА */
      const progressBar = $('#progress');
      const header = $('#header');
      const toTop = $('#toTop');

      function onScroll() {
        const d = document.documentElement;
        const st = d.scrollTop;
        const max = d.scrollHeight - d.clientHeight;
        progressBar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';
        header.classList.toggle('is-scrolled', st > 10);
        toTop.classList.toggle('is-visible', st > 500);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });

      /* 5. REVEAL */
      const revealEls = $$('.reveal');
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.classList.add('is-visible');
            obs.unobserve(en.target);
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el) => io.observe(el));
      } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
      }

      /* 6. ШКАЛЫ НАВЫКОВ */
      const bars = $$('.bar');
      if ('IntersectionObserver' in window && bars.length) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const lvl = en.target.dataset.level || 0;
            const fill = en.target.querySelector('.bar__fill');
            if (fill) fill.style.width = lvl + '%';
            en.target.classList.add('is-animated');
            obs.unobserve(en.target);
          });
        }, { threshold: 0.4 });
        bars.forEach((b) => io.observe(b));
      } else {
        bars.forEach((b) => {
          const fill = b.querySelector('.bar__fill');
          if (fill) fill.style.width = (b.dataset.level || 0) + '%';
        });
      }

      /* 7. ПЕЧАТАЮЩИЙСЯ ТЕКСТ */
      const typed = $('#typed');
      const roles = ['Frontend-разработчик', 'Веб-дизайнер', 'Студентка ИТ-направления'];

      if (typed) {
        if (reduce) {
          typed.textContent = roles[0];
        } else {
          let ri = 0, ci = 0, del = false;
          const TYPE = 80, DEL = 38, PAUSE_END = 1800, PAUSE_START = 350;

          (function tick() {
            const cur = roles[ri];
            ci += del ? -1 : 1;
            typed.textContent = cur.slice(0, ci);

            let d = del ? DEL : TYPE;
            if (!del && ci === cur.length) { del = true; d = PAUSE_END; }
            else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; d = PAUSE_START; }
            setTimeout(tick, d);
          })();
        }
      }

      /* 8. SCRAMBLE ЗАГОЛОВКОВ */
      const scrambleChars = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ';

      function scramble(el, duration = 800) {
        const final = el.dataset.scrambleText || el.textContent;
        el.dataset.scrambleText = final;
        const len = final.length;
        const start = performance.now();

        function frame(now) {
          const p = Math.min((now - start) / duration, 1);
          const revealed = Math.floor(p * len);
          let out = '';
          for (let i = 0; i < len; i++) {
            const ch = final[i];
            if (i < revealed || ch === ' ') out += ch;
            else out += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }
          el.textContent = out;
          if (p < 1) requestAnimationFrame(frame);
          else el.textContent = final;
        }
        requestAnimationFrame(frame);
      }

      const scrambleEls = $$('[data-scramble]');
      if (!reduce && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            scramble(en.target, 750);
            obs.unobserve(en.target);
          });
        }, { threshold: 0.6 });
        scrambleEls.forEach((el) => io.observe(el));
      }

      /* 9. СЧЁТЧИКИ */
      const counters = $$('[data-count]');
      if (!reduce && 'IntersectionObserver' in window && counters.length) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target;
            const target = parseFloat(el.dataset.count);
            const dec = parseInt(el.dataset.decimals || 0, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1400;
            const start = performance.now();

            function frame(now) {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = (target * eased).toFixed(dec) + suffix;
              if (p < 1) requestAnimationFrame(frame);
              else el.textContent = target.toFixed(dec) + suffix;
            }
            requestAnimationFrame(frame);
            obs.unobserve(el);
          });
        }, { threshold: 0.5 });
        counters.forEach((c) => io.observe(c));
      } else {
        counters.forEach((el) => {
          el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.decimals || 0, 10)) + (el.dataset.suffix || '');
        });
      }

      /* 10. 3D-НАКЛОН + СПОТЛАЙТ */
      if (!isTouch && !reduce) {
        $$('[data-tilt]').forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;

            const maxTilt = 7;
            card.style.setProperty('--rx', ((0.5 - py) * maxTilt) + 'deg');
            card.style.setProperty('--ry', ((px - 0.5) * maxTilt) + 'deg');
            card.style.setProperty('--mx', (px * 100) + '%');
            card.style.setProperty('--my', (py * 100) + '%');
          });
          card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
          });
        });
      }

      /* 11. АКТИВНАЯ ССЫЛКА В МЕНЮ */
      const sections = $$('main section[id]');
      const navLinks = $$('.nav__link');

      function setActive(id) {
        navLinks.forEach((l) => {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
        });
      }

      if ('IntersectionObserver' in window && sections.length) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach((s) => io.observe(s));
      }

      /* 12. ВАЛИДАЦИЯ ФОРМЫ */
      const form = $('#contactForm');
      const status = $('#formStatus');
      const submitBtn = $('#submitBtn');
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/;

      function setError(input, msg) {
        const field = input.closest('.field');
        const err = field.querySelector('.field__error');
        field.classList.toggle('has-error', Boolean(msg));
        if (err) err.textContent = msg || '';
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }

      function vName() {
        const i = $('#name'); const v = i.value.trim();
        if (!v) { setError(i, 'Укажите имя'); return false; }
        if (v.length < 2) { setError(i, 'Имя слишком короткое'); return false; }
        setError(i, ''); return true;
      }
      function vEmail() {
        const i = $('#email'); const v = i.value.trim();
        if (!v) { setError(i, 'Укажите e-mail'); return false; }
        if (!EMAIL_RE.test(v)) { setError(i, 'Некорректный e-mail'); return false; }
        setError(i, ''); return true;
      }
      function vMessage() {
        const i = $('#message'); const v = i.value.trim();
        if (!v) { setError(i, 'Напишите сообщение'); return false; }
        if (v.length < 10) { setError(i, 'Минимум 10 символов'); return false; }
        setError(i, ''); return true;
      }

      if (form) {
        $('#name').addEventListener('blur', vName);
        $('#email').addEventListener('blur', vEmail);
        $('#message').addEventListener('blur', vMessage);

        ['name', 'email', 'message'].forEach((id) => {
          $('#' + id).addEventListener('input', (e) => {
            if (e.target.closest('.field').classList.contains('has-error')) setError(e.target, '');
          });
        });

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const ok = vName() && vEmail() && vMessage();

          if (!ok) {
            status.textContent = 'Проверьте выделенные поля.';
            status.className = 'form__status is-error';
            const firstErr = form.querySelector('.field.has-error input, .field.has-error textarea');
            if (firstErr) firstErr.focus();
            return;
          }

          submitBtn.disabled = true;
          const original = submitBtn.innerHTML;
          submitBtn.textContent = 'Отправляем…';
          status.textContent = '';
          status.className = 'form__status';

          setTimeout(() => {
            status.textContent = 'Спасибо! Сообщение отправлено — отвечу в течение дня.';
            status.className = 'form__status is-success';
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = original;
          }, 900);
        });
      }

      /* 13. ГОД */
      const yearEl = $('#year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    })();
