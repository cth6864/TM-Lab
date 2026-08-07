const searchInput = document.getElementById('searchInput');
const yearFilter  = document.getElementById('yearFilter');
const countNum    = document.getElementById('countNum');
const allGroups   = document.querySelectorAll('.year-group');

function filterPubs(){
  const q    = searchInput.value.toLowerCase();
  const year = yearFilter.value;
  let count  = 0;

  allGroups.forEach(group => {
    const groupYear = group.dataset.year;
    const items     = group.querySelectorAll('.pub-item');
    let visible     = 0;

    items.forEach(item => {
      const title   = (item.dataset.title   || '').toLowerCase();
      const authors = (item.dataset.authors || '').toLowerCase();
      const journal = (item.dataset.journal || '').toLowerCase();
      const matchQ  = !q || title.includes(q) || authors.includes(q) || journal.includes(q);
      const matchY  = !year || groupYear === year;

      if(matchQ && matchY){
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

searchInput.addEventListener('input', filterPubs);
yearFilter.addEventListener('change', filterPubs);