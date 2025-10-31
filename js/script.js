document.addEventListener('DOMContentLoaded', () => {
  // Demo project data
  const projects = [
    {id:1,title:'Landing — Product',tags:['web','ui'],img:'https://picsum.photos/seed/p1/800/500',desc:'A modern landing page for a SaaS product with subtle motion.' ,url:'#'},
    {id:2,title:'E‑commerce UI',tags:['web','ui'],img:'https://picsum.photos/seed/p2/800/500',desc:'Shop UI design and microinteraction prototypes.' ,url:'#'},
    {id:3,title:'Motion Experiments',tags:['motion'],img:'https://picsum.photos/seed/p3/800/500',desc:'GSAP driven scroll and hero animations.' ,url:'#'},
    {id:4,title:'Portfolio Revamp',tags:['web','ui','motion'],img:'https://picsum.photos/seed/p4/800/500',desc:'Personal portfolio redesign with rich interactions.' ,url:'#'},
    {id:5,title:'Prototype App',tags:['ui'],img:'https://picsum.photos/seed/p5/800/500',desc:'High-fidelity prototypes for mobile apps.' ,url:'#'}
  ];

  const grid = document.getElementById('projectsGrid');
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('closeModal');

  // responsive nav elements
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', (e) => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      navList.classList.toggle('open', !isOpen);
    });

    // close menu when a link is clicked
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('open');
      });
    });

    // click outside to close
    document.addEventListener('click', (e) => {
      if (!navList.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('open');
      }
    });
  }

  let lastFocused = null;

  function setAriaOpen(isOpen) {
    overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    modal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  function disableBodyScroll() {
    document.body.style.overflow = 'hidden';
  }
  function enableBodyScroll() {
    document.body.style.overflow = '';
  }

  function trapFocus(container) {
    const focusable = container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) return () => {};
    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }

  function openModal(project) {
    // populate content
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalTags').textContent = project.tags.join(' · ');
    document.getElementById('modalDesc').textContent = project.desc;
    document.getElementById('modalLink').href = project.url || '#';
    const imgWrap = document.getElementById('modalImage');
    imgWrap.innerHTML = `<img src="${project.img}" alt="${project.title}" style="width:100%;height:100%;object-fit:cover;display:block">`;

    // show overlay/modal
    overlay.style.display = 'flex';
    setAriaOpen(true);
    disableBodyScroll();

    // animation (if GSAP available)
    if (window.gsap) {
      gsap.killTweensOf([overlay, modal]);
      gsap.fromTo(overlay, {autoAlpha:0}, {autoAlpha:1, duration:0.25});
      gsap.fromTo(modal, {y:18, autoAlpha:0}, {y:0, autoAlpha:1, duration:0.35, ease:'power3.out'});
    }

    // focus management
    lastFocused = document.activeElement;
    modal.focus();
    // trap focus, keep handle to remove when closing
    modal._removeTrap = trapFocus(modal);
  }

  function closeModal() {
    // close animation
    if (window.gsap) {
      gsap.to(modal, {y:8, autoAlpha:0, duration:0.18, ease:'power2.in'});
      gsap.to(overlay, {autoAlpha:0, duration:0.2, onComplete: finishClose});
    } else {
      finishClose();
    }
  }

  function finishClose() {
    overlay.style.display = 'none';
    setAriaOpen(false);
    enableBodyScroll();
    if (modal._removeTrap) {
      modal._removeTrap();
      modal._removeTrap = null;
    }
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // build grid
  function buildGrid(list) {
    grid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.id = p.id;
      card.innerHTML = `
        <div class="thumb"><img src="${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;display:block"></div>
        <div class="card-body">
          <h4>${p.title}</h4>
          <p>${p.tags.join(' · ')}</p>
        </div>
      `;
      card.addEventListener('click', () => openModal(p));
      grid.appendChild(card);
    });
    if (window.gsap) {
      gsap.from('.card', {opacity:0, y:20, duration:0.6, stagger:0.08, ease:'power2.out'});
    }
  }

  // overlay click: only close when clicking backdrop (not modal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // close button
  closeBtn.addEventListener('click', closeModal);

  // escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') closeModal();
  });

  // filters
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      if (f === 'all') buildGrid(projects);
      else buildGrid(projects.filter(p => p.tags.includes(f)));
    });
  });

  // new project
  const newBtn = document.getElementById('new-project');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      const id = projects.length + 1;
      const sample = {id, title:'New Project ' + id, tags:['web'], img:`https://picsum.photos/seed/p${id}/800/500`, desc:'New project placeholder', url:'#'};
      projects.unshift(sample);
      buildGrid(projects);
      const firstCard = document.querySelector('.card');
      if (firstCard && window.gsap) {
        gsap.fromTo(firstCard, {scale:0.96, boxShadow:'0 0 0 rgba(0,0,0,0)'}, {scale:1, boxShadow:'0 12px 40px rgba(0,0,0,0.35)', duration:0.5});
      }
    });
  }

  // initial build
  buildGrid(projects);

  // scroll-triggered animations (if GSAP available)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-left', {x:-30, opacity:0, duration:0.7, scrollTrigger:{trigger:'.hero', start:'top 90%'}});
    gsap.from('.hero-right', {x:30, opacity:0, duration:0.7, scrollTrigger:{trigger:'.hero', start:'top 90%'}});
  }
});
