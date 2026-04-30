(function () {
  "use strict";

  const tabs = Array.from(document.querySelectorAll(".skill-tab"));
  const panels = Array.from(document.querySelectorAll(".skill-panel"));

  if (!tabs.length || !panels.length) return;

  const validSkills = new Set(tabs.map((tab) => tab.dataset.skill));

  function setMenuView(menu, view) {
    if (!menu) return;

    const showResources = view === "resources";
    menu.setAttribute("data-show", showResources ? "resources" : "progress");

    const progressView = menu.querySelector(".view-progress");
    const resourcesView = menu.querySelector(".view-resources");
    const toggleBtn = menu.querySelector(".side-toggle-btn");

    if (progressView) {
      progressView.classList.toggle("is-visible", !showResources);
    }

    if (resourcesView) {
      resourcesView.classList.toggle("is-visible", showResources);
    }

    if (toggleBtn) {
      toggleBtn.textContent = showResources ? "Afficher la progression" : "Afficher les ressources";
      toggleBtn.setAttribute("aria-expanded", String(showResources));
    }
  }

  function bindMenuToggle(panel) {
    const menu = panel.querySelector(".side-toggle-menu");
    if (!menu) return;

    const toggleBtn = menu.querySelector(".side-toggle-btn");
    if (!toggleBtn) return;

    setMenuView(menu, "progress");

    toggleBtn.addEventListener("click", () => {
      const nextView = menu.getAttribute("data-show") === "resources" ? "progress" : "resources";
      setMenuView(menu, nextView);
    });
  }

  function updateResources(panel, acItem) {
    const list = panel.querySelector(".resource-list");
    if (!list) return;

    const resourcesRaw = (acItem?.getAttribute("data-resources") || "").trim();
    const resources = resourcesRaw ? resourcesRaw.split("|").map((entry) => entry.trim()).filter(Boolean) : [];

    list.innerHTML = "";

    if (!resources.length) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "Aucune ressource liée pour le moment.";
      list.appendChild(emptyItem);
      return;
    }

    resources.forEach((resource) => {
      const item = document.createElement("li");
      item.textContent = resource;
      list.appendChild(item);
    });
  }

  function bindAcInteractions(panel) {
    const items = Array.from(panel.querySelectorAll(".ac-item"));
    if (!items.length) return;

    const menu = panel.querySelector(".side-toggle-menu");

    items.forEach((item) => {
      item.addEventListener("click", () => {
        items.forEach((entry) => entry.classList.remove("is-selected"));
        item.classList.add("is-selected");
        updateResources(panel, item);
        setMenuView(menu, "resources");
      });
    });

    items[0].classList.add("is-selected");
    updateResources(panel, items[0]);
  }

  function setActiveSkill(skill, updateHash = true) {
    if (!validSkills.has(skill)) return;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.skill === skill;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      if (isActive) {
        tab.setAttribute("tabindex", "0");
      } else {
        tab.setAttribute("tabindex", "-1");
      }
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.skill === skill;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;

      if (isActive) {
        panel.classList.remove("is-entering");
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
    });

    if (updateHash) {
      const nextHash = `#${skill}`;
      if (window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
      }
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveSkill(tab.dataset.skill);
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const currentIndex = tabs.indexOf(tab);
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      setActiveSkill(tabs[nextIndex].dataset.skill);
    });
  });

  function activateFromHash() {
    const fromHash = window.location.hash.replace("#", "").trim();
    if (validSkills.has(fromHash)) {
      setActiveSkill(fromHash, false);
      return;
    }

    setActiveSkill("administrer", false);
  }

  window.addEventListener("hashchange", activateFromHash);
  activateFromHash();

  panels.forEach((panel) => {
    bindMenuToggle(panel);
    bindAcInteractions(panel);
  });
})();
