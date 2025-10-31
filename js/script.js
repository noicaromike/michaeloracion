document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navList = document.querySelector(".nav-list");
  if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navList.classList.toggle("open", !isOpen);
    });
    navList.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        navList.classList.remove("open");
      })
    );
    document.addEventListener("click", (e) => {
      if (!navList.contains(e.target) && !menuToggle.contains(e.target)) {
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        navList.classList.remove("open");
      }
    });
  }

  function runSplash() {
    const splash = document.getElementById("splash");
    const splashPercent = document.getElementById("splashPercent");
    const splashFill = document.getElementById("splashFill");
    document.body.classList.add("no-scroll");

    if (window.gsap) {
      const obj = { n: 0 };
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(obj, {
        n: 100,
        duration: 1.6,
        roundProps: "n",
        onUpdate() {
          if (splashPercent) splashPercent.textContent = obj.n + "%";
          if (splashFill) splashFill.style.width = obj.n + "%";
        },
      });
      tl.to(
        ".splash-name",
        { scale: 1.04, duration: 0.28, yoyo: true, repeat: 1 },
        ">-0.08"
      );
      tl.to(
        splash,
        {
          autoAlpha: 0,
          y: -18,
          duration: 0.45,
          onComplete() {
            if (splash && splash.parentNode)
              splash.parentNode.removeChild(splash);
            document.body.classList.remove("no-scroll");
          },
        },
        ">-0.06"
      );
    } else {
      let n = 0;
      const t = setInterval(() => {
        n += 5;
        if (n > 100) n = 100;
        if (splashPercent) splashPercent.textContent = n + "%";
        if (splashFill) splashFill.style.width = n + "%";
        if (n >= 100) {
          clearInterval(t);
          setTimeout(() => {
            if (splash && splash.parentNode)
              splash.parentNode.removeChild(splash);
            document.body.classList.remove("no-scroll");
          }, 300);
        }
      }, 60);
    }
  }

  // Animate hero (uses GSAP if available, CSS fallback otherwise)
  function animateHero() {
    const hero = document.querySelector("section.hero");
    if (!hero) return;

    // prefer GSAP timeline for smooth staggered entrance
    if (window.gsap) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-left",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );
      tl.fromTo(
        ".hero-right",
        { y: 14, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        "-=0.38"
      );
      // subtle floating of profile-card (non-intrusive)
      const card = document.querySelector(".profile-card");
      if (card)
        gsap.to(card, {
          y: -6,
          duration: 3.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.6,
        });
    } else {
      // fallback: add class that triggers CSS transitions
      document.documentElement.classList.add("hero-animate");
      const card = document.querySelector(".profile-card");
      if (card) card.classList.add("float");
    }
  }

  // run splash only on reload
  let navType = "navigate";
  try {
    const entries =
      performance.getEntriesByType &&
      performance.getEntriesByType("navigation");
    if (entries && entries.length) navType = entries[0].type || navType;
    else if (performance.navigation && performance.navigation.type === 1)
      navType = "reload";
  } catch (e) {}

  if (navType === "reload") {
    // ensure hero animates after splash completes
    const originalRunSplash = runSplash;
    // wrap runSplash to call animateHero after completion
    function runSplashAndAnimate() {
      const splash = document.getElementById("splash");
      // call original; it will remove splash and un-lock scroll on complete
      originalRunSplash();
      // small timeout to let removal finish then animate
      setTimeout(animateHero, 450);
    }
    runSplashAndAnimate();
  } else {
    const splashImmediate = document.getElementById("splash");
    if (splashImmediate && splashImmediate.parentNode)
      splashImmediate.parentNode.removeChild(splashImmediate);
    document.body.classList.remove("no-scroll");
    // animate immediately when no splash sequence ran
    setTimeout(animateHero, 80);
  }

  // Morphing background: CSS handles most of it; tweak CSS vars with GSAP if available
  (function initMorphBg() {
    const root = document.documentElement;
    if (window.gsap) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(root, {
        duration: 10,
        ease: "sine.inOut",
        "--h1": 210,
        "--h2": 320,
        "--pos1-x": 30,
        "--pos1-y": 20,
        "--pos2-x": 70,
        "--pos2-y": 80,
      });
      tl.to(
        root,
        {
          duration: 12,
          ease: "sine.inOut",
          "--h1": 280,
          "--h2": 200,
          "--pos1-x": 12,
          "--pos1-y": 50,
          "--pos2-x": 88,
          "--pos2-y": 40,
        },
        ">-0.4"
      );
    } else {
      root.style.setProperty("--h1", "200");
      root.style.setProperty("--h2", "260");
    }
  })();

  // append project data, grid builder, modal and contact handling
  (() => {
    const projects = [
      {
        id: 1,
        title: "Interactive Dashboard",
        img: "https://picsum.photos/seed/p1/900/600",
        desc: "Responsive dashboard with performant data viz and smooth interactions.",
        url: "#",
      },
      {
        id: 2,
        title: "Micro-interactions Library",
        img: "https://picsum.photos/seed/p2/900/600",
        desc: "Reusable micro-interactions using vanilla JS and GSAP.",
        url: "#",
      },
      {
        id: 3,
        title: "Animated Landing",
        img: "https://picsum.photos/seed/p3/900/600",
        desc: "High-performance landing with progressive image loading and motion.",
        url: "#",
      },
      {
        id: 4,
        title: "Accessible Forms",
        img: "https://picsum.photos/seed/p4/900/600",
        desc: "Form UX with ARIA, validation and keyboard-first design.",
        url: "#",
      },
    ];

    function buildGrid() {
      const grid = document.getElementById("projectsGrid");
      if (!grid) return;
      grid.innerHTML = "";
      projects.forEach((p) => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <a class="card-link" href="#" data-id="${p.id}">
            <div class="card-media" style="background-image:url('${p.img}')"></div>
            <div class="card-body">
              <h3 class="card-title">${p.title}</h3>
              <div class="card-desc">${p.desc}</div>
            </div>
          </a>
        `;
        grid.appendChild(card);
      });
    }

    function openModal(project) {
      const modal = document.getElementById("projectModal");
      if (!modal) return;
      document.getElementById("modalTitle").textContent = project.title;
      const imgEl = document.getElementById("modalImg");
      imgEl.style.backgroundImage = `url('${project.img}')`;
      document.getElementById("modalDesc").textContent = project.desc;
      const link = document.getElementById("modalLink");
      link.href = project.url;
      modal.classList.remove("hidden");
      // animate modal with GSAP if available
      if (window.gsap) {
        gsap.fromTo(
          ".modal-panel",
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }
        );
      }
    }

    function closeModal() {
      const modal = document.getElementById("projectModal");
      if (!modal) return;
      modal.classList.add("hidden");
    }

    // delegate clicks on project cards
    document.addEventListener("click", (e) => {
      const link = e.target.closest(".card-link");
      if (link) {
        e.preventDefault();
        const id = Number(link.dataset.id);
        const proj = projects.find((p) => p.id === id);
        if (proj) openModal(proj);
      }
      if (
        e.target.matches("[data-dismiss='modal']") ||
        e.target.closest(".modal-close")
      ) {
        closeModal();
      }
    });

    // keyboard close modal
    document.addEventListener("keydown", (e) => {
      const modal = document.getElementById("projectModal");
      if (e.key === "Escape" && modal && !modal.classList.contains("hidden"))
        closeModal();
    });

    // contact form handling (client-side only)
    const form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const status = document.getElementById("contactStatus");
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        if (!name || !email || !message) {
          status.textContent = "Please complete all fields.";
          return;
        }
        // simple email check
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          status.textContent = "Please provide a valid email.";
          return;
        }
        status.textContent = "Sending...";
        // simulate send
        setTimeout(() => {
          status.textContent = "Message sent — I will reply soon. (Demo only)";
          form.reset();
        }, 900);
      });
    }

    // set current year in footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // build project grid and trigger simple reveal
    buildGrid();
  })();
});
