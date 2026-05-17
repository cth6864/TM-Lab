const searchInput = document.getElementById('searchInput');
const yearFilter  = document.getElementById('yearFilter');
const countNum    = document.getElementById('countNum');
const allGroups   = document.querySelectorAll('.tl-year-group');

function filterProjects() {
  const q    = searchInput.value.toLowerCase();
  const year = yearFilter.value;
  let count  = 0;

  allGroups.forEach(group => {
    const groupYear = group.dataset.year;
    const items     = group.querySelectorAll('.proj-item');
    let visible     = 0;

    items.forEach(item => {
      const title  = (item.dataset.title  || '').toLowerCase();
      const client = (item.dataset.client || '').toLowerCase();

      const matchQ    = !q    || title.includes(q) || client.includes(q);
      const matchYear = !year || groupYear === year;

      if (matchQ && matchYear) {
        item.classList.remove('hidden');
        visible++;
        count++;
      } else {
        item.classList.add('hidden');
      }
    });

    group.classList.toggle('hidden', visible === 0);
  });

  countNum.textContent = count;
}

searchInput.addEventListener('input', filterProjects);
yearFilter.addEventListener('change', filterProjects);
