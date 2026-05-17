
const searchInput = document.getElementById('searchInput');
const yearFilter = document.getElementById('yearFilter');
const yearStart = document.getElementById('yearStart');
const yearEnd = document.getElementById('yearEnd');
const countNum = document.getElementById('countNum');
const allGroups = document.querySelectorAll('.tl-year-group');
const topicButtons = document.querySelectorAll('.topic-chip, .topic-side-btn');
const yearBars = document.querySelectorAll('.year-bar');

let activeTopic = '';

const slugMap = {
  '교통안전': 'safety',
  '교통운영': 'operation',
  '교통계획': 'planning',
  '신모빌리티': 'newmobility',
  '대중교통': 'transit',
  '자율주행': 'autonomous'
};

function setActiveTopic(topic){
  activeTopic = topic || '';
  topicButtons.forEach(btn => {
    const buttonTopic = btn.dataset.topic || '';
    btn.classList.toggle('active', buttonTopic === activeTopic);
  });
}

function getYearBounds(){
  const start = yearStart ? parseInt(yearStart.value, 10) : null;
  const end = yearEnd ? parseInt(yearEnd.value, 10) : null;

  if(Number.isFinite(start) && Number.isFinite(end)){
    return [Math.min(start, end), Math.max(start, end)];
  }
  return [null, null];
}

function itemMatches(item, groupYear){
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedYear = yearFilter ? yearFilter.value : '';
  const [startYear, endYear] = getYearBounds();
  const y = parseInt(groupYear, 10);

  const haystack = [
    item.dataset.title,
    item.dataset.client,
    item.dataset.role,
    item.dataset.topic,
    item.querySelector('.proj-title')?.textContent,
    item.querySelector('.proj-period')?.textContent
  ].join(' ').toLowerCase();

  const matchQ = !q || haystack.includes(q);
  const matchYearSelect = !selectedYear || String(y) === selectedYear;
  const matchYearRange = (!startYear || y >= startYear) && (!endYear || y <= endYear);
  const matchTopic = !activeTopic || item.dataset.topic === activeTopic;

  return matchQ && matchYearSelect && matchYearRange && matchTopic;
}

function filterProjects(){
  let count = 0;

  allGroups.forEach(group => {
    const groupYear = group.dataset.year;
    const items = group.querySelectorAll('.proj-item');
    let visible = 0;

    items.forEach(item => {
      const matched = itemMatches(item, groupYear);
      item.classList.toggle('hidden', !matched);
      if(matched){
        visible++;
        count++;
      }
    });

    group.classList.toggle('hidden', visible === 0);
  });

  if(countNum) countNum.textContent = count;

  yearBars.forEach(bar => {
    const selectedYear = yearFilter && yearFilter.value === bar.dataset.year;
    bar.classList.toggle('active', selectedYear);
  });
}

topicButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const topic = btn.dataset.topic || '';
    if(topic === ''){
      setActiveTopic('');
    }else{
      setActiveTopic(activeTopic === topic ? '' : topic);
    }
    filterProjects();
  });
});

if(searchInput) searchInput.addEventListener('input', filterProjects);
if(yearFilter) yearFilter.addEventListener('change', filterProjects);
if(yearStart) yearStart.addEventListener('change', filterProjects);
if(yearEnd) yearEnd.addEventListener('change', filterProjects);

yearBars.forEach(bar => {
  bar.addEventListener('click', () => {
    if(yearFilter){
      yearFilter.value = yearFilter.value === bar.dataset.year ? '' : bar.dataset.year;
    }
    filterProjects();
  });
});

setActiveTopic('');
filterProjects();
