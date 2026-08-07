(function(){
  const selectors = [
    ".advisee-card",
    ".alumni-card",
    ".postdoc-card",
    ".advisor-profile-card",
    ".advisor-photo-wrap"
  ];

  document.querySelectorAll(selectors.join(",")).forEach(card => {
    const data = getMemberData(card);
    if(!data.name) return;

    const url = buildUrl(data);
    card.classList.add("member-profile-link");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("title", `${data.name} profile`);

    card.addEventListener("click", event => {
      if(event.target.closest("a")) return;
      window.location.href = url;
    });

    card.addEventListener("keydown", event => {
      if(event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      window.location.href = url;
    });
  });

  function getMemberData(card){
    if(card.classList.contains("advisor-profile-card") || card.classList.contains("advisor-photo-wrap")){
      const photo = document.querySelector(".advisor-photo-wrap img");
      const email = Array.from(document.querySelectorAll(".profile-row")).find(row =>
        /EMAIL/i.test(row.querySelector(".profile-row-label")?.textContent || "")
      );
      return {
        category: "Advisor",
        name: compact(document.querySelector(".profile-name-ko")?.textContent) || "송태진",
        nameEn: clean(document.querySelector(".profile-name-en")?.textContent),
        role: clean(document.querySelector(".profile-row-val")?.textContent),
        email: clean(email?.querySelector(".profile-row-val")?.textContent),
        photo: photo ? photo.getAttribute("src") : ""
      };
    }

    const image = card.querySelector("img");
    const category = card.classList.contains("alumni-card") ? "Alumni" :
      card.classList.contains("postdoc-card") ? "Postdoc" : "Advisee";

    return {
      category,
      name: clean(image?.getAttribute("alt")) || compact(card.querySelector("[class$='name-ko']")?.textContent),
      nameEn: clean(card.querySelector(".postdoc-name-en")?.textContent),
      role: clean(card.querySelector(".advisee-badge, .alumni-badge, .postdoc-badge")?.textContent),
      topic: clean(card.querySelector(".advisee-topic, .postdoc-topic")?.textContent),
      email: clean(card.querySelector(".postdoc-email")?.textContent),
      photo: image ? image.getAttribute("src") : "",
      year: getAlumniValue(card, "YEAR"),
      now: getAlumniValue(card, "NOW")
    };
  }

  function buildUrl(data){
    const params = new URLSearchParams();
    params.set("category", data.category);
    params.set("name", data.name);
    append(params, "nameEn", data.nameEn);
    append(params, "role", data.role);
    append(params, "topic", data.topic);
    append(params, "email", data.email);
    append(params, "photo", data.photo);

    if(data.category === "Alumni"){
      const tags = [data.role, data.year, data.now].filter(Boolean).join(", ");
      append(params, "topic", tags);
      append(params, "role", data.role ? `${data.role} Alumni` : "Alumni");
    }

    return `Profile.html?${params.toString()}`;
  }

  function append(params, key, value){
    if(value) params.set(key, value);
  }

  function clean(value){
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function compact(value){
    return String(value || "").replace(/\s+/g, "").trim();
  }

  function getAlumniValue(card, label){
    const row = Array.from(card.querySelectorAll(".alumni-info-row")).find(item =>
      clean(item.querySelector(".alumni-info-label")?.textContent).toUpperCase() === label
    );
    return clean(row?.querySelector(".alumni-info-val")?.textContent);
  }
})();
