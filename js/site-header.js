(function () {
  const path = window.location.pathname.replace(/\\/g, "/");
  const inMembers = /\/Members\//i.test(path);
  const inResearch = /\/Research\//i.test(path);
  const base = inMembers || inResearch ? "../" : "";
  const file = path.split("/").pop().toLowerCase();

  function active(section) {
    if (section === "home") return file === "index.html" || file === "";
    if (section === "members") return inMembers;
    if (section === "research") return inResearch;
    if (section === "projects") return file === "projects.html";
    if (section === "about") return file === "about.html";
    return false;
  }

  function itemClass(section, hasDrop) {
    return [
      "nav-item",
      active(section) ? "active" : "",
      hasDrop ? "has-drop" : ""
    ].filter(Boolean).join(" ");
  }

  const target = document.getElementById("site-header");
  if (!target) return;

  target.innerHTML = `
    <header>
      <a class="logo" href="${base}index.html">T&M LAB</a>
      <nav>
        <div class="${itemClass("home", false)}">
          <a href="${base}index.html">HOME</a>
        </div>

        <div class="${itemClass("members", true)}">
          <a href="${base}Members/Advisor.html">MEMBERS <span class="chevron">▾</span></a>
          <div class="dropdown">
            <div class="dropdown-inner">
              <a href="${base}Members/Advisor.html">Advisor</a>
              <a href="${base}Members/Advisee.html">Advisee</a>
              <a href="${base}Members/Postdoc.html">Postdoc</a>
              <a href="${base}Members/Alumni.html">Alumni</a>
            </div>
          </div>
        </div>

        <div class="${itemClass("research", true)}">
          <a href="${base}Research/Publications.html">RESEARCH <span class="chevron">▾</span></a>
          <div class="dropdown">
            <div class="dropdown-inner">
              <a href="${base}Research/Publications.html">Publications</a>
              <a href="${base}Research/Patents.html">Patents</a>
              <a href="${base}Research/Awards.html">Awards</a>
              <a href="${base}Research/Conference.html">Conference Papers</a>
            </div>
          </div>
        </div>

        <div class="${itemClass("projects", false)}">
          <a href="${base}Projects.html">PROJECTS</a>
        </div>

        <div class="${itemClass("about", false)}">
          <a href="${base}About.html">ABOUT T&M</a>
        </div>
      </nav>
    </header>
  `;
}());
