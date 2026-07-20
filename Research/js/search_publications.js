const searchInput = document.getElementById('searchInput');
const yearFilter  = document.getElementById('yearFilter');
const langFilter  = document.getElementById('langFilter');
const yearStart   = document.getElementById('yearStart');
const yearEnd     = document.getElementById('yearEnd');
const countNum    = document.getElementById('countNum');
const allGroups   = document.querySelectorAll('.year-group');
const topicButtons = document.querySelectorAll('.topic-chip, .topic-side-btn');
const yearBarWrap = document.querySelector('.year-bars');

function getYearBars(){
  return document.querySelectorAll('.year-bar');
}

function getPublicationYearCounts(){
  const counts = {};
  allGroups.forEach(group => {
    const year = group.dataset.year;
    if(!year) return;
    counts[year] = group.querySelectorAll('.pub-card').length;
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
  const counts = getPublicationYearCounts();
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
      button.innerHTML = `<span></span><em>${year.slice(-2)}</em>`;
      yearBarWrap.appendChild(button);
    });
  }
}
    // 연도별 막대그래프를 가로형으로 변환
    function initHorizontalYearBars(){
      const countsByYear = getPublicationYearCounts();
      const counts = Array.from(getYearBars()).map(bar => {
        const year = bar.dataset.year || '';
        const count = countsByYear[year] || 0;

        bar.title = `${year}년 ${count}편`;
        bar.dataset.label = `${year}년도 ${count}편`;
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


const panel = document.getElementById('paperPanel');
const closeBtn = document.querySelector('.panel-close');
const panelTopic = document.getElementById('panelTopic');
const panelTitle = document.getElementById('panelTitle');
const panelAuthors = document.getElementById('panelAuthors');
const panelJournal = document.getElementById('panelJournal');
const panelYear = document.getElementById('panelYear');
const panelLang = document.getElementById('panelLang');
const panelFigure = document.getElementById('panelFigure');
const panelAbstract = document.getElementById('panelAbstract');
const panelDoiText = document.getElementById('panelDoiText');
const panelDoiLink = document.getElementById('panelDoiLink');

let activeTopic = '';

const abstractByTopic = {
  '교통안전':'이 논문은 교통안전 문제의 발생 요인과 영향 구조를 분석하여 사고 예방 및 운영 개선을 위한 근거를 제시합니다.',
  '모빌리티 데이터':'이 논문은 모바일·통신·프로브 등 이동 데이터를 활용하여 통행 패턴과 공간적 특성을 정량적으로 분석합니다.',
  '대중교통·신교통':'이 논문은 대중교통 및 신규 모빌리티 서비스의 이용 특성, 수요, 운영 효율성을 분석합니다.',
  '교통운영':'이 논문은 도로·교차로·고속도로 운영 효율을 개선하기 위한 지표, 모형, 정책적 대안을 다룹니다.',
  '자율주행·보안':'이 논문은 자율주행 및 커넥티드 환경에서 사고조사, 기능안전, 사이버보안 문제를 분석합니다.'
};

function normalizeDoiUrl(doi){
  const value = (doi || '').trim();
  if(!value) return '';
  if(value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://doi.org/${value}`;
}

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

function cardMatches(card, groupYear){
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const year = yearFilter ? yearFilter.value : '';
  const lang = langFilter ? langFilter.value : '';
  const [startYear, endYear] = getYearBounds();
  const y = parseInt(groupYear || card.dataset.year, 10);

  const haystack = [
    card.dataset.title,
    card.dataset.authors,
    card.dataset.journal,
    card.dataset.topic,
    card.dataset.doi
  ].join(' ').toLowerCase();

  const matchQ = !q || haystack.includes(q);
  const matchYearSelect = !year || String(y) === year;
  const matchYearRange = (!startYear || y >= startYear) && (!endYear || y <= endYear);
  const matchLang = !lang || card.dataset.lang === lang;
  const matchTopic = !activeTopic || card.dataset.topic === activeTopic;

  return matchQ && matchYearSelect && matchYearRange && matchLang && matchTopic;
}

function updateFirstVisiblePanel(){
  const firstVisible = document.querySelector('.pub-card:not(.hidden)');
  if(firstVisible) updatePanel(firstVisible, false);
}

function updateCarouselControls(){
  document.querySelectorAll('.year-group').forEach(group => {
    const grid = group.querySelector('.paper-grid');
    const prev = group.querySelector('.year-scroll-btn.prev');
    const next = group.querySelector('.year-scroll-btn.next');
    if(!grid || !prev || !next) return;

    const canScroll = grid.scrollWidth > grid.clientWidth + 2;
    prev.disabled = !canScroll || grid.scrollLeft <= 2;
    next.disabled = !canScroll || grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
  });
}

function filterPubs(){
  let count = 0;

  allGroups.forEach(group => {
    const groupYear = group.dataset.year;
    const cards = group.querySelectorAll('.pub-card');
    let visible = 0;

    cards.forEach(card => {
      const matched = cardMatches(card, groupYear);
      card.classList.toggle('hidden', !matched);
      if(matched){
        visible++;
        count++;
      }
    });

    group.classList.toggle('hidden', visible === 0);

    const grid = group.querySelector('.paper-grid');
    if(grid) grid.scrollLeft = 0;
  });

  if(countNum) countNum.textContent = count;

  getYearBars().forEach(bar => {
    const selectedYear = yearFilter && yearFilter.value === bar.dataset.year;
    bar.classList.toggle('active', selectedYear);
  });

  updateFirstVisiblePanel();
  updateCarouselControls();
}

function updatePanel(card, openPanel = true){
  if(!panel || !card) return;

  document.querySelectorAll('.pub-card.active').forEach(el => el.classList.remove('active'));
  card.classList.add('active');

  const topic = card.dataset.topic || '';
  const slug = card.dataset.topicSlug || '';
  const doi = (card.dataset.doi || '').trim();

  if(panelTopic){
    panelTopic.textContent = topic;
    panelTopic.className = `paper-topic topic-${slug}`;
  }
  if(panelTitle) panelTitle.textContent = card.dataset.title || '';
  if(panelAuthors) panelAuthors.textContent = card.dataset.authors || '';
  if(panelJournal) panelJournal.textContent = card.dataset.journal || '';
  if(panelYear) panelYear.textContent = card.dataset.year || '';
  if(panelLang) panelLang.textContent = card.dataset.lang || '';
  if(panelAbstract) panelAbstract.textContent = card.dataset.abstract || abstractByTopic[topic] || '초록 정보 확인 중입니다.';

  if(panelFigure){
    const sourceFigure = card.querySelector('.paper-figure');
    panelFigure.innerHTML = sourceFigure ? sourceFigure.innerHTML : '';
  }

  if(panelDoiText && panelDoiLink){
    if(doi){
      panelDoiText.textContent = doi.replace(/^https?:\/\/doi\.org\//, '');
      panelDoiLink.href = normalizeDoiUrl(doi);
      panelDoiLink.textContent = '논문 원문 보기';
      panelDoiLink.classList.remove('disabled');
      panelDoiLink.removeAttribute('aria-disabled');
    }else{
      panelDoiText.textContent = 'DOI 정보 없음';
      panelDoiLink.href = '#';
      panelDoiLink.textContent = 'DOI 준비중';
      panelDoiLink.classList.add('disabled');
      panelDoiLink.setAttribute('aria-disabled', 'true');
    }
  }

  if(openPanel){
    panel.classList.remove('is-closed');
    if(window.innerWidth <= 1160){
      panel.scrollIntoView({behavior:'smooth', block:'start'});
    }
  }
}

document.querySelectorAll('.year-scroll-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.year-group');
    const grid = group ? group.querySelector('.paper-grid') : null;
    if(!grid) return;

    const direction = Number(btn.dataset.direction || 1);
    grid.scrollBy({ left: direction * grid.clientWidth, behavior: 'smooth' });
    window.setTimeout(updateCarouselControls, 320);
  });
});

document.querySelectorAll('.paper-grid').forEach(grid => {
  grid.addEventListener('scroll', updateCarouselControls, { passive:true });
});

window.addEventListener('resize', updateCarouselControls);

document.querySelectorAll('.doi-inline[href]').forEach(link => {
  link.addEventListener('click', event => {
    event.stopPropagation();
  });
});

document.querySelectorAll('.pub-card').forEach(card => {
  card.addEventListener('click', () => updatePanel(card));
  card.addEventListener('keydown', event => {
    if(event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      updatePanel(card);
    }
  });
});

topicButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const topic = btn.dataset.topic || '';
    if(topic === ''){
      setActiveTopic('');
    }else{
      setActiveTopic(activeTopic === topic ? '' : topic);
    }
    filterPubs();
  });
});

if(searchInput) searchInput.addEventListener('input', filterPubs);
if(yearFilter) yearFilter.addEventListener('change', filterPubs);
if(langFilter) langFilter.addEventListener('change', filterPubs);
if(yearStart) yearStart.addEventListener('change', filterPubs);
if(yearEnd) yearEnd.addEventListener('change', filterPubs);

function bindYearBars(){
  getYearBars().forEach(bar => {
    bar.addEventListener('click', () => {
      if(yearFilter){
        yearFilter.value = yearFilter.value === bar.dataset.year ? '' : bar.dataset.year;
      }
      filterPubs();
    });
  });
}

if(closeBtn && panel){
  closeBtn.addEventListener('click', () => panel.classList.add('is-closed'));
}

bindYearBars();
setActiveTopic('');
filterPubs();
