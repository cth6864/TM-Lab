
const searchInput = document.getElementById('searchInput');
const yearFilter = document.getElementById('yearFilter');
const yearStart = document.getElementById('yearStart');
const yearEnd = document.getElementById('yearEnd');
const countNum = document.getElementById('countNum');
const allGroups = document.querySelectorAll('.tl-year-group');
const topicButtons = document.querySelectorAll('.topic-chip, .topic-side-btn');
const yearBarWrap = document.querySelector('.year-bars');

function getYearBars(){
  return document.querySelectorAll('.year-bar');
}

function getProjectYearCounts(){
  const counts = {};
  allGroups.forEach(group => {
    const year = group.dataset.year;
    if(!year) return;
    counts[year] = group.querySelectorAll('.proj-item').length;
  });
  return counts;
}

function syncYearSelect(select, years, mode){
  if(!select || years.length === 0) return;

  const current = select.value;
  const includeAll = select.id === 'yearFilter';
  select.innerHTML = '';

  if(includeAll){
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'ALL YEARS';
    select.appendChild(option);
  }

  const ordered = includeAll ? years.slice().reverse() : years;
  ordered.forEach((year, index) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if(mode === 'start' && index === 0) option.selected = true;
    if(mode === 'end' && index === ordered.length - 1) option.selected = true;
    select.appendChild(option);
  });

  if(current && years.includes(current)) select.value = current;
}

function syncYearControls(){
  const counts = getProjectYearCounts();
  const years = Object.keys(counts).sort((a, b) => Number(a) - Number(b));

  syncYearSelect(yearFilter, years, 'filter');
  syncYearSelect(yearStart, years, 'start');
  syncYearSelect(yearEnd, years, 'end');

  if(yearBarWrap){
    years.forEach(year => {
      if(yearBarWrap.querySelector(`.year-bar[data-year="${year}"]`)) return;
      const button = document.createElement('button');
      button.className = 'year-bar';
      button.dataset.year = year;
      button.type = 'button';
      button.innerHTML = `<span></span><em>${year}년</em>`;
      yearBarWrap.appendChild(button);
    });
  }
}

// 연도별 막대그래프를 세로 막대형에서 가로 리스트형으로 변환
function initHorizontalYearBars(){
  const countsByYear = getProjectYearCounts();
  const counts = Array.from(getYearBars()).map(bar => {
    const year = bar.dataset.year || '';
    const count = countsByYear[year] || 0;
    bar.title = `${year}년 ${count}건`;
    bar.dataset.label = `${year}년도 ${count}건`;
    bar.dataset.count = count;
    return count;
  });

  const maxCount = Math.max(...counts, 1);

  getYearBars().forEach(bar => {
    const count = Number(bar.dataset.count || 0);
    const fill = bar.querySelector('span');

    if(!fill) return;

    const width = count === 0 ? 0 : Math.max((count / maxCount) * 100, 6);

    fill.style.width = `${width}%`;
    fill.style.height = '';
  });
}

syncYearControls();
initHorizontalYearBars();


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

  getYearBars().forEach(bar => {
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

function bindYearBars(){
  getYearBars().forEach(bar => {
    bar.addEventListener('click', () => {
      if(yearFilter){
        yearFilter.value = yearFilter.value === bar.dataset.year ? '' : bar.dataset.year;
      }
      filterProjects();
    });
  });
}

bindYearBars();
setActiveTopic('');
filterProjects();
