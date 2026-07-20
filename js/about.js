# -*- coding: utf-8 -*-
"""
Created on Tue Mar 17 13:26:54 2026

@author: TaeHyeok
"""

// ── 라이트박스 ──
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lightbox-img');
const lbCaption   = document.getElementById('lightbox-caption');
const lbClose     = document.getElementById('lightbox-close');
const lbPrev      = document.getElementById('lightbox-prev');
const lbNext      = document.getElementById('lightbox-next');

let allImages = [];  // 현재 이벤트 블록의 이미지 배열
let currentIdx = 0;

// 각 photo-card에 클릭 이벤트
document.querySelectorAll('.photo-card img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    // 같은 event-block 내 이미지들 수집
    const block  = img.closest('.event-block');
    allImages    = Array.from(block.querySelectorAll('.photo-card img'));
    currentIdx   = allImages.indexOf(img);
    openLightbox();
  });
});

function openLightbox() {
  const img = allImages[currentIdx];
  lbImg.src        = img.src;
  lbImg.alt        = img.alt;
  lbCaption.textContent = `${currentIdx + 1} / ${allImages.length}`;
  lbPrev.style.display = allImages.length > 1 ? 'block' : 'none';
  lbNext.style.display = allImages.length > 1 ? 'block' : 'none';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lbPrev.addEventListener('click', e => {
  e.stopPropagation();
  currentIdx = (currentIdx - 1 + allImages.length) % allImages.length;
  openLightbox();
});
lbNext.addEventListener('click', e => {
  e.stopPropagation();
  currentIdx = (currentIdx + 1) % allImages.length;
  openLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   { currentIdx = (currentIdx - 1 + allImages.length) % allImages.length; openLightbox(); }
  if (e.key === 'ArrowRight')  { currentIdx = (currentIdx + 1) % allImages.length; openLightbox(); }
});