document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 768px)');

  // شريط تقدّم القراءة، وتكبير هادئ للافتتاحية على الشاشات العريضة وحدها
  const bar = document.querySelector('.progress span');
  const heroImg = document.querySelector('.hero-img');
  let ticking = false;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) {
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    if (heroImg && !calm.matches && wide.matches && window.scrollY < window.innerHeight) {
      heroImg.style.transform = `scale(${1 + window.scrollY * 0.00035})`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // ظهور الفصول عند التمرير
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !calm.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // إعداد روابط المشاركة
  const shareTitle = 'هوليوود الجنوب · عشرة أفلام ومسلسل خيال علمي... على حساب حقيقة واحدة';
  const shareUrl = window.location.href.split('#')[0] || 'https://kakramah.github.io/hollywood-south/';
  const status = document.getElementById('share-status');

  const targets = {
    'share-whatsapp': `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`,
    'share-telegram': `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    'share-x': `https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    'share-facebook': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  };

  Object.entries(targets).forEach(([id, href]) => {
    const link = document.getElementById(id);
    if (link) link.href = href;
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (status) status.textContent = 'نُسخ الرابط. انشره لمن يتابع شأن الجنوب.';
    } catch {
      if (status) status.textContent = 'تعذّر النسخ تلقائياً. انسخ عنوان الصفحة من شريط المتصفح.';
    }
  };

  document.getElementById('share-native')?.addEventListener('click', async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: shareTitle,
        text: 'الجنوب ليس سيناريو هوليوودياً للاستهلاك، بل وطن وأهل ومصير.',
        url: shareUrl
      });
      if (status) status.textContent = 'شكراً لنشر رسالة الوعي.';
    } catch (error) {
      if (error.name !== 'AbortError') {
        await copyLink();
      }
    }
  });

  document.getElementById('share-copy')?.addEventListener('click', copyLink);

  // تكبير الصور: الأسهم في الاتجاه العربي، وEsc يغلق ويعيد التركيز
  const box = document.getElementById('lightbox');
  const boxImg = document.getElementById('lightbox-img');
  const boxTitle = document.getElementById('lightbox-title');
  const boxDesc = document.getElementById('lightbox-desc');
  const triggers = [...document.querySelectorAll('.zoom')];
  let current = 0;
  let opener = null;

  const show = (index) => {
    current = (index + triggers.length) % triggers.length;
    const img = triggers[current].querySelector('img');
    if (!img) return;
    boxImg.src = img.getAttribute('src');
    boxImg.alt = img.alt || '';
    boxTitle.textContent = img.dataset.title || '';
    boxDesc.textContent = img.dataset.desc || '';
  };

  const open = (index) => {
    opener = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox-close')?.focus();
  };

  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
    if (opener && typeof opener.focus === 'function') {
      opener.focus();
    }
  };

  triggers.forEach((btn, i) => {
    btn.addEventListener('click', () => open(i));
  });

  box?.querySelector('.lightbox-close')?.addEventListener('click', close);
  box?.querySelector('.lightbox-prev')?.addEventListener('click', () => show(current - 1));
  box?.querySelector('.lightbox-next')?.addEventListener('click', () => show(current + 1));

  box?.addEventListener('click', (event) => {
    if (event.target === box) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!box || box.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') show(current - 1);
    if (event.key === 'ArrowLeft') show(current + 1);

    if (event.key === 'Tab') {
      const focusables = [...box.querySelectorAll('button:not([disabled])')];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
});
