(async function(){
  const params = new URLSearchParams(window.location.search);
  const fallback = {
    category: params.get("category") || "Advisee",
    nameKo: params.get("name") || "",
    nameEn: params.get("nameEn") || "",
    role: params.get("role") || "",
    email: params.get("email") || "",
    photo: params.get("photo") || "",
    bio: "Profile details are being prepared. Administrators can add the introduction, research projects, patents, publications, and conference papers in Members/js/member-profile-data.js.",
    projects: [],
    patents: [],
    publications: [],
    conferencePapers: []
  };

  const profiles = window.TMLAB_MEMBER_PROFILES || [];
  const profile = profiles.find(item => sameMember(item, fallback)) || fallback;
  const autoData = { projects: [], patents: [], publications: [], conferencePapers: [] };
  const categoryPages = {
    Advisor: "Advisor.html",
    Advisee: "Advisee.html",
    Postdoc: "Postdoc.html",
    Alumni: "Alumni.html"
  };

  function sameMember(item, target){
    return normalize(item.category) === normalize(target.category) &&
      normalize(item.nameKo) === normalize(target.nameKo);
  }

  function normalize(value){
    return String(value || "").replace(/\s+/g, "").toLowerCase();
  }

  function text(id, value){
    const node = document.getElementById(id);
    if(node) node.textContent = value || "";
  }

  function setPhoto(){
    const img = document.getElementById("profilePhoto");
    const placeholder = document.getElementById("profilePhotoPlaceholder");
    if(!img || !placeholder) return;

    if(!profile.photo){
      img.style.display = "none";
      placeholder.style.display = "flex";
      return;
    }

    img.src = profile.photo;
    img.alt = profile.nameKo || "Profile photo";
    img.onerror = function(){
      img.style.display = "none";
      placeholder.style.display = "flex";
    };
  }

  function setEmail(){
    const link = document.getElementById("profileEmail");
    if(!link) return;
    const span = link.querySelector("span");

    if(!profile.email){
      link.style.display = "none";
      return;
    }

    link.href = `mailto:${profile.email}`;
    if(span) span.textContent = profile.email;
  }

  function renderProjects(){
    const items = combinedItems("projects");
    text("projectsCount", `${items.length} items`);
    renderCarousel("projectsTrack", items, item => `
      <article class="info-card project-card">
        ${badge(item.status)}
        <h4 class="info-card-title">${escapeHtml(item.title)}</h4>
        <dl class="meta-list">
          ${meta("Period", item.period)}
          ${meta("Client", item.client)}
        </dl>
      </article>
    `, "No research projects have been added.");
  }

  function renderPatents(){
    const items = combinedItems("patents");
    text("patentsCount", `${items.length} items`);
    renderCarousel("patentsTrack", items, item => `
      <article class="info-card patent-mini-card">
        <div class="patent-mini-figure">
          ${patentFigure(item.image)}
        </div>
        <div class="patent-mini-body">
          ${badge(item.status)}
          <h4 class="info-card-title">${escapeHtml(item.title)}</h4>
          ${item.inventors ? `<p class="patent-mini-authors">${escapeHtml(item.inventors)}</p>` : ""}
          <div class="patent-mini-meta">
            ${item.date ? `<span>${escapeHtml(item.date)}</span>` : ""}
            ${item.number ? `<span>출원번호: ${escapeHtml(item.number)}</span>` : ""}
            ${item.url ? `<a class="detail-link patent-mini-link" href="${escapeAttr(item.url)}" rel="noopener" target="_blank">특허 정보 보기</a>` : ""}
          </div>
        </div>
      </article>
    `, "No patents have been added.");
  }

  function renderPublications(){
    const items = combinedItems("publications");
    text("publicationsCount", `${items.length} items`);
    renderCarousel("publicationsTrack", items, item => publicationTemplate(item, "PAPER"), "No publications have been added.");
  }

  function renderConferencePapers(){
    const items = combinedItems("conferencePapers");
    text("conferenceCount", `${items.length} items`);
    renderCarousel("conferenceTrack", items, item => `
      <article class="info-card conference-card">
        <h4 class="info-card-title">${escapeHtml(item.title)}</h4>
        <dl class="meta-list">
          ${meta("Authors", item.authors)}
          ${meta("Venue", item.venue)}
        </dl>
      </article>
    `, "No conference papers have been added.");
  }

  function publicationTemplate(item, emptyLabel){
    return `
      <article class="info-card media-card publication-card">
        ${mediaThumb(item.image || item.cover, emptyLabel)}
        <div class="media-card-body">
          <h4 class="info-card-title">${escapeHtml(item.title)}</h4>
          <dl class="meta-list">
            ${meta("Authors", item.authors)}
            ${meta("Venue", item.venue)}
          </dl>
          ${item.doi ? `<a class="doi-link" href="${escapeAttr(item.doi)}">DOI</a>` : ""}
        </div>
      </article>
    `;
  }

  function renderCarousel(id, items, template, emptyText){
    const track = document.getElementById(id);
    if(!track) return;

    if(items.length === 0){
      track.innerHTML = `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
      return;
    }

    track.innerHTML = items.map(template).join("");
  }

  function badge(status){
    if(!status) return "";
    const done = /완료|등록|done|registered/i.test(status) ? " done" : "";
    return `<span class="status-badge${done}">${escapeHtml(status)}</span>`;
  }

  function meta(label, value){
    if(!value) return "";
    return `<div class="meta-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
  }

  function mediaThumb(src, label){
    if(!src) return `<div class="media-thumb empty">${escapeHtml(label)}</div>`;
    return `<div class="media-thumb"><img src="${escapeAttr(src)}" alt=""></div>`;
  }

  function patentFigure(src){
    if(!src) return `<div class="patent-mini-placeholder">PATENT</div>`;
    return `<img src="${escapeAttr(src)}" alt="">`;
  }

  function combinedItems(key){
    return uniqueByTitle([...(profile[key] || []), ...(autoData[key] || [])]);
  }

  function uniqueByTitle(items){
    const seen = new Set();
    return items.filter(item => {
      const key = titleKey(item.title);
      if(!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function titleKey(value){
    return normalize(value).replace(/[^\p{L}\p{N}]/gu, "");
  }

  async function loadRelatedResearchData(){
    loadIndexedResearchData();

    const [publicationsDoc, patentsDoc, conferenceDoc, projectsDoc] = await Promise.all([
      fetchDocument("../Research/Publications.html"),
      fetchDocument("../Research/Patents.html"),
      fetchDocument("../Research/Conference.html"),
      fetchDocument("../Projects.html")
    ]);

    if(publicationsDoc) autoData.publications = uniqueByTitle([...autoData.publications, ...extractPublications(publicationsDoc)]);
    if(patentsDoc) autoData.patents = uniqueByTitle([...autoData.patents, ...extractPatents(patentsDoc)]);
    if(conferenceDoc) autoData.conferencePapers = uniqueByTitle([...autoData.conferencePapers, ...extractConferencePapers(conferenceDoc)]);
    if(projectsDoc) autoData.projects = uniqueByTitle([...autoData.projects, ...extractProjects(projectsDoc)]);
  }

  function loadIndexedResearchData(){
    const index = window.TMLAB_MEMBER_RESEARCH_INDEX || {};
    autoData.publications = uniqueByTitle([...autoData.publications, ...relatedIndexItems(index.publications)]);
    autoData.patents = uniqueByTitle([...autoData.patents, ...relatedIndexItems(index.patents)]);
    autoData.projects = uniqueByTitle([...autoData.projects, ...relatedIndexItems(index.projects)]);
    autoData.conferencePapers = uniqueByTitle([...autoData.conferencePapers, ...relatedIndexItems(index.conferencePapers)]);
  }

  function relatedIndexItems(items){
    return (Array.isArray(items) ? items : []).filter(item => {
      const members = Array.isArray(item.members) ? item.members.join(" ") : item.members;
      return isRelatedAuthor(members || item.authors || item.inventors || "");
    });
  }

  async function fetchDocument(path){
    try{
      const response = await fetch(path, { cache: "no-store" });
      if(!response.ok) return loadDocumentWithFrame(path);
      const html = await response.text();
      return new DOMParser().parseFromString(html, "text/html");
    }catch(error){
      return loadDocumentWithFrame(path);
    }
  }

  function loadDocumentWithFrame(path){
    return new Promise(resolve => {
      const frame = document.createElement("iframe");
      frame.src = path;
      frame.hidden = true;
      frame.style.display = "none";

      const cleanup = () => {
        if(frame.parentNode) frame.parentNode.removeChild(frame);
      };

      const timer = window.setTimeout(() => {
        cleanup();
        resolve(null);
      }, 2000);

      frame.onload = () => {
        window.clearTimeout(timer);
        try{
          const doc = frame.contentDocument || frame.contentWindow?.document || null;
          cleanup();
          resolve(doc);
        }catch(error){
          cleanup();
          resolve(null);
        }
      };

      document.body.appendChild(frame);
    });
  }

  function extractPublications(doc){
    return Array.from(doc.querySelectorAll(".pub-card"))
      .filter(item => isRelatedAuthor(`${item.dataset.authors || ""} ${textFrom(item, ".pub-card-authors")}`))
      .map(item => ({
        title: item.dataset.title || textFrom(item, ".pub-card-title"),
        authors: textFrom(item, ".pub-card-authors") || item.dataset.authors || "",
        venue: item.dataset.journal || textFrom(item, ".journal-name"),
        image: item.dataset.img || "",
        doi: normalizeDoiUrl(item.dataset.doi || ""),
        year: item.dataset.year || item.closest(".year-group")?.dataset.year || ""
      }));
  }

  function extractPatents(doc){
    return Array.from(doc.querySelectorAll(".patent-item"))
      .filter(item => isRelatedAuthor(`${item.dataset.authors || ""} ${textFrom(item, ".pub-authors")}`))
      .map(item => ({
        title: item.dataset.title || textFrom(item, ".patent-title-link") || textFrom(item, ".pub-title"),
        status: textFrom(item, ".pub-year-tag") || "",
        image: item.dataset.img || "",
        inventors: textFrom(item, ".pub-authors") || item.dataset.authors || "",
        number: item.dataset.patentNo || "",
        date: item.closest(".year-group")?.dataset.year || "",
        url: item.dataset.patentUrl || item.querySelector(".patent-link, .patent-title-link")?.getAttribute("href") || ""
      }));
  }

  function extractConferencePapers(doc){
    return Array.from(doc.querySelectorAll(".pub-item"))
      .filter(item => isRelatedAuthor(`${item.dataset.authors || ""} ${textFrom(item, ".pub-authors")}`))
      .map(item => ({
        title: item.dataset.title || textFrom(item, ".pub-title"),
        authors: textFrom(item, ".pub-authors") || item.dataset.authors || "",
        venue: withYear(item.dataset.journal || textFrom(item, ".pub-journal"), item.closest(".year-group")?.dataset.year)
      }));
  }

  function extractProjects(doc){
    return Array.from(doc.querySelectorAll(".proj-item"))
      .filter(item => isRelatedAuthor(item.dataset.members || item.dataset.authors || ""))
      .map(item => ({
        title: item.dataset.title || textFrom(item, ".proj-title"),
        status: item.dataset.status || "",
        period: textFrom(item, ".proj-period"),
        client: item.dataset.client || textFrom(item, ".proj-client")
      }));
  }

  function isRelatedAuthor(value){
    const source = normalize(value);
    if(!source) return false;
    return memberTokens().some(token => token && source.includes(token));
  }

  function memberTokens(){
    const tokens = [profile.nameKo, profile.nameEn, fallback.nameKo, fallback.nameEn]
      .map(normalize)
      .filter(Boolean);
    return Array.from(new Set(tokens));
  }

  function textFrom(root, selector){
    return root.querySelector(selector)?.textContent.replace(/\s+/g, " ").trim() || "";
  }

  function withYear(venue, year){
    if(!venue || !year || venue.includes(year)) return venue || "";
    return `${venue}, ${year}`;
  }

  function normalizeDoiUrl(value){
    const doi = String(value || "").trim();
    if(!doi) return "";
    if(/^https?:\/\//i.test(doi)) return doi;
    return `https://doi.org/${doi}`;
  }

  function setupCarouselControls(){
    document.querySelectorAll("[data-carousel]").forEach(button => {
      const track = document.getElementById(button.dataset.carousel);
      if(!track) return;

      button.addEventListener("click", () => {
        const direction = button.dataset.direction === "prev" ? -1 : 1;
        const card = track.querySelector(".info-card, .empty-state");
        const amount = card ? card.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
        track.scrollBy({ left: direction * amount, behavior: "smooth" });
      });
    });
  }

  function escapeHtml(value){
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value){
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function setActiveTab(){
    const category = profile.category || fallback.category;
    document.querySelectorAll("[data-profile-tab]").forEach(link => {
      link.classList.toggle("active", normalize(link.dataset.profileTab) === normalize(category));
    });

    const backLink = document.getElementById("backLink");
    if(backLink){
      backLink.href = categoryPages[category] || "Advisee.html";
      backLink.textContent = `Back to ${category}`;
    }
  }

  document.title = `T&M LAB - ${profile.nameKo || "Member Profile"}`;
  text("profileHeroLabel", `${profile.category || "MEMBER"} PROFILE`);
  text("profileCategory", profile.category || "MEMBER");
  text("profileNameKo", profile.nameKo || "-");
  text("profileNameEn", profile.nameEn || "");
  text("profileRole", profile.role || "");
  text("profileBio", profile.bio || fallback.bio);
  setPhoto();
  setEmail();
  setActiveTab();
  renderProjects();
  renderPatents();
  renderPublications();
  renderConferencePapers();
  await loadRelatedResearchData();
  renderProjects();
  renderPatents();
  renderPublications();
  renderConferencePapers();
  setupCarouselControls();
})();
