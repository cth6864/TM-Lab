const VISIBLE = 3;
let index = 0;

const slider   = document.getElementById('newsSlider');
const leftBtn  = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const dotsWrap = document.getElementById('newsDots');

function getCardWidth(){
  const card = document.querySelector('.news-card');
  const gap  = parseInt(getComputedStyle(slider).gap) || 30;
  return card.offsetWidth + gap;
}

function totalCards(){
  return document.querySelectorAll('.news-card').length;
}

function maxIndex(){
  return Math.max(0, totalCards() - VISIBLE);
}

function buildDots(){
  dotsWrap.innerHTML = '';
  const steps = maxIndex() + 1;
  for(let i = 0; i < steps; i++){
    const btn = document.createElement('button');
    btn.className = 'dot' + (i === index ? ' active' : '');
    btn.onclick = () => goTo(i);
    dotsWrap.appendChild(btn);
  }
}

function updateDots(){
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

function goTo(i){
  index = Math.max(0, Math.min(i, maxIndex()));
  slider.style.transform = `translateX(${-getCardWidth() * index}px)`;
  updateButtons();
  updateDots();
}

function slideNews(direction){
  goTo(index + direction);
}

function updateButtons(){
  leftBtn.disabled  = index === 0;
  rightBtn.disabled = index === maxIndex();
}

window.addEventListener('load', () => {
  buildDots();
  updateButtons();
});