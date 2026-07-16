/**
 * ============================================================
 * Main JavaScript — Portfolio Landing Page (Ilustrador)
 * ============================================================
 * Vanilla JS, sem frameworks. Todas as funcionalidades estão
 * encapsuladas dentro do evento DOMContentLoaded.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ============================================================
  // Utilitários
  // ============================================================

  /**
   * Throttle — limita a execução de uma função a cada `limit` ms.
   * Ideal para eventos de scroll e resize.
   */
  const throttle = (fn, limit = 100) => {
    let lastCall = 0;
    let rafId = null;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => fn(...args));
      }
    };
  };

  // ============================================================
  // 1. Navbar — Comportamento ao Scroll
  // ============================================================

  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // ============================================================
  // 2. Link Ativo na Navbar ao Scroll
  // ============================================================

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  const highlightActiveLink = () => {
    if (!sections.length || !navLinks.length) return;

    const scrollPos = window.scrollY + window.innerHeight / 3;

    let currentSectionId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  // Combina os dois handlers de scroll com throttle
  const onScroll = throttle(() => {
    handleNavbarScroll();
    highlightActiveLink();
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });

  // Execução inicial para estado correto ao carregar a página
  handleNavbarScroll();
  highlightActiveLink();

  // ============================================================
  // 3. Smooth Scroll — Rolagem Suave
  // ============================================================

  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

  smoothScrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();

      const target = document.querySelector(href);
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Fecha o menu mobile se estiver aberto
      closeMobileMenu();
    });
  });

  // ============================================================
  // 4. Menu Mobile — Toggle
  // ============================================================

  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');

  /** Cria overlay para o menu mobile */
  let menuOverlay = document.createElement('div');
  menuOverlay.classList.add('navbar__overlay');
  document.body.appendChild(menuOverlay);

  /**
   * Fecha o menu mobile e restaura o overflow do body.
   */
  const closeMobileMenu = () => {
    if (!navbarToggle || !navbarMenu) return;
    navbarToggle.classList.remove('active');
    navbarMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  /**
   * Abre o menu mobile e trava o scroll do body.
   */
  const openMobileMenu = () => {
    if (!navbarToggle || !navbarMenu) return;
    navbarToggle.classList.add('active');
    navbarMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  /**
   * Alterna o estado do menu mobile.
   */
  const toggleMobileMenu = () => {
    if (!navbarMenu) return;
    const isActive = navbarMenu.classList.contains('active');
    isActive ? closeMobileMenu() : openMobileMenu();
  };

  if (navbarToggle) {
    navbarToggle.addEventListener('click', toggleMobileMenu);
  }

  // Fecha o menu ao clicar em um link de navegação
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ============================================================
  // 10. Overlay do Menu Mobile
  // ============================================================

  // Clicar no overlay fecha o menu
  menuOverlay.addEventListener('click', closeMobileMenu);

  // Fecha o menu ao clicar fora dele
  document.addEventListener('click', (e) => {
    if (!navbarMenu || !navbarToggle) return;
    const isMenuActive = navbarMenu.classList.contains('active');
    if (!isMenuActive) return;

    const clickedInsideMenu = navbarMenu.contains(e.target);
    const clickedToggle = navbarToggle.contains(e.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMobileMenu();
    }
  });

  // ============================================================
  // 5. Intersection Observer — Animações ao Scroll
  // ============================================================

  const animatedElements = document.querySelectorAll('[data-animate]');

  if (animatedElements.length) {
    const animateObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const animationType = el.getAttribute('data-animate');

            // Para elementos com animação do tipo 'stagger',
            // aplica um delay baseado no índice dentro do pai.
            if (animationType === 'stagger') {
              const parent = el.parentElement;
              if (parent) {
                const siblings = Array.from(
                  parent.querySelectorAll('[data-animate="stagger"]')
                );
                const index = siblings.indexOf(el);
                el.style.transitionDelay = `${index * 0.1}s`;
              }
            }

            el.classList.add('visible');
            // Para de observar depois que o elemento ficou visível
            animateObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    animatedElements.forEach((el) => animateObserver.observe(el));
  }

  // ============================================================
  // 6. Animação de Contadores
  // ============================================================

  const statNumbers = document.querySelectorAll('.stat__number[data-count]');

  if (statNumbers.length) {
    /**
     * Anima um número de 0 até o valor alvo em ~2 segundos.
     * Usa requestAnimationFrame para suavidade.
     */
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;

      const duration = 2000; // 2 segundos
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing — desacelera no final (ease-out quad)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easedProgress * target);

        el.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Valor final com sufixo '+'
          el.textContent = `${target}+`;
        }
      };

      requestAnimationFrame(updateCounter);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            // Anima apenas uma vez
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  // ============================================================
  // 7. Efeito Parallax — Fundo do Hero
  // ============================================================

  const heroBg = document.querySelector('.hero__bg');

  const handleParallax = () => {
    if (!heroBg) return;
    // Aplica parallax apenas em telas maiores que 768px
    if (window.innerWidth <= 768) {
      heroBg.style.transform = '';
      return;
    }
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  };

  // Usa throttle dedicado para parallax (mais frequente para suavidade)
  const onScrollParallax = throttle(handleParallax, 16); // ~60fps
  window.addEventListener('scroll', onScrollParallax, { passive: true });
  window.addEventListener('resize', () => {
    // Reseta parallax ao redimensionar
    handleParallax();
  });
  handleParallax();

  // ============================================================
  // 8. Lightbox — Galeria de Imagens
  // ============================================================

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const portfolioItems = document.querySelectorAll('.portfolio__item');

  let currentImageIndex = 0;

  // Coleta todas as fontes de imagens dos itens do portfólio
  const images = Array.from(portfolioItems)
    .map((item) => {
      const img = item.querySelector('img');
      return img ? img.src : null;
    })
    .filter(Boolean);

  /**
   * Abre o lightbox na imagem selecionada.
   */
  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !images.length) return;
    currentImageIndex = index;
    lightboxImage.src = images[currentImageIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  /**
   * Fecha o lightbox e restaura o overflow do body.
   */
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  /**
   * Navega para a imagem anterior (com loop).
   */
  const prevImage = () => {
    if (!images.length) return;
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    if (lightboxImage) lightboxImage.src = images[currentImageIndex];
  };

  /**
   * Navega para a próxima imagem (com loop).
   */
  const nextImage = () => {
    if (!images.length) return;
    currentImageIndex = (currentImageIndex + 1) % images.length;
    if (lightboxImage) lightboxImage.src = images[currentImageIndex];
  };

  // Abre o lightbox ao clicar em um item do portfólio
  portfolioItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    // Acessibilidade — abre com Enter/Espaço
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  // Fecha o lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // Fecha ao clicar no backdrop (fora da imagem)
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      // Fecha apenas se o clique for no backdrop, não na imagem ou controles
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Navegação — botões anterior e próximo
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      prevImage();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      nextImage();
    });
  }

  // Navegação por teclado (setas e Escape)
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  });

  // ============================================================
  // 9. Animação Interativa do Título — Hover Effect
  // ============================================================

  const heroTitle = document.querySelector('.hero__title');

  if (heroTitle) {
    const text = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    heroTitle.setAttribute('aria-label', text);

    // Cria um span para cada caractere
    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.classList.add('hero__char');
      heroTitle.appendChild(span);
    });

    // Adiciona efeito ao passar o mouse
    heroTitle.addEventListener('mousemove', (e) => {
      const chars = heroTitle.querySelectorAll('.hero__char');
      const rect = heroTitle.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      chars.forEach((char) => {
        const charRect = char.getBoundingClientRect();
        const charX = charRect.left - rect.left + charRect.width / 2;
        const charY = charRect.top - rect.top + charRect.height / 2;

        const distance = Math.sqrt(
          Math.pow(mouseX - charX, 2) + Math.pow(mouseY - charY, 2)
        );
        const maxDistance = 100;
        const force = Math.max(0, 1 - distance / maxDistance);

        // Calcula o ângulo de afastamento
        const angle = Math.atan2(charY - mouseY, charX - mouseX);
        const offsetX = Math.cos(angle) * force * 20;
        const offsetY = Math.sin(angle) * force * 20;
        const scale = 1 + force * 0.1;

        char.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      });
    });

    // Remove o efeito ao sair o mouse
    heroTitle.addEventListener('mouseleave', () => {
      const chars = heroTitle.querySelectorAll('.hero__char');
      chars.forEach((char) => {
        char.style.transform = '';
      });
    });
  }

  // ============================================================
  // Fim — Tudo inicializado com sucesso
  // ============================================================
  console.log('✅ Portfolio JS inicializado com sucesso.');
});
