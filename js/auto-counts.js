(function () {
  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function isVisible(element) {
    return !element.classList.contains("hidden");
  }

  function getPageItems() {
    if (document.querySelector(".proj-item")) {
      return {
        type: "project",
        itemSelector: ".proj-item",
        numberSelector: ".proj-num"
      };
    }

    if (document.querySelector(".pub-card")) {
      return {
        type: "publication-card",
        itemSelector: ".pub-card",
        numberSelector: ""
      };
    }

    if (document.querySelector(".pub-item")) {
      return {
        type: "research-list",
        itemSelector: ".pub-item",
        numberSelector: ".pub-num"
      };
    }

    return null;
  }

  function allItems(config) {
    return Array.from(document.querySelectorAll(config.itemSelector));
  }

  function updateSequentialNumbers(config) {
    if (!config.numberSelector) return;
    allItems(config).forEach((item, index) => {
      const number = item.querySelector(config.numberSelector);
      if (number) number.textContent = String(index + 1);
    });
  }

  function updateVisibleCount(config) {
    const count = allItems(config).filter(isVisible).length;
    const countNum = document.getElementById("countNum");
    if (countNum) countNum.textContent = String(count);
  }

  function updateTopicCounts(config) {
    const items = allItems(config);
    document.querySelectorAll(".topic-side-btn").forEach((button) => {
      const topic = text(button.dataset.topic);
      const badge = button.querySelector("b");
      if (!badge) return;

      const count = topic
        ? items.filter((item) => text(item.dataset.topic) === topic).length
        : items.length;

      badge.textContent = String(count);
    });
  }

  function updateAll() {
    const config = getPageItems();
    if (!config) return;

    updateSequentialNumbers(config);
    updateVisibleCount(config);
    updateTopicCounts(config);
  }

  function init() {
    const config = getPageItems();
    if (!config) return;

    updateSequentialNumbers(config);
    updateTopicCounts(config);
    window.setTimeout(updateVisibleCount, 0, config);

    document.addEventListener("input", () => window.setTimeout(updateAll, 0));
    document.addEventListener("change", () => window.setTimeout(updateAll, 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
