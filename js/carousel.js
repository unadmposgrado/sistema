(function(){
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const nextBtn = document.querySelector('.carousel-control.next');
  const prevBtn = document.querySelector('.carousel-control.prev');
  const indicators = Array.from(document.querySelectorAll('.indicator'));
  let currentIndex = 0;
  const intervalTime = 5000;
  let intervalId = null;

  function goToSlide(index){
    index = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    currentIndex = index;
    updateIndicators();
    updateAriaHidden();
  }

  function updateIndicators(){
    indicators.forEach((btn,i)=> btn.classList.toggle('active', i===currentIndex));
  }

  function updateAriaHidden(){
    slides.forEach((s,i)=> s.setAttribute('aria-hidden', i!==currentIndex));
  }

  function nextSlide(){ goToSlide(currentIndex + 1); }
  function prevSlide(){ goToSlide(currentIndex - 1); }

  function startAuto(){ stopAuto(); intervalId = setInterval(nextSlide, intervalTime); }
  function stopAuto(){ if(intervalId){ clearInterval(intervalId); intervalId = null; } }
  function resetAuto(){ stopAuto(); startAuto(); }

  nextBtn.addEventListener('click', ()=>{ nextSlide(); resetAuto(); });
  prevBtn.addEventListener('click', ()=>{ prevSlide(); resetAuto(); });
  indicators.forEach((btn,i)=> btn.addEventListener('click', ()=>{ goToSlide(i); resetAuto(); }));

  // keyboard support when carousel has focus
  document.addEventListener('keydown', (e)=>{
    if(document.activeElement && document.activeElement.closest('.carousel')) return; // allow inner focus
    if(e.key === 'ArrowRight') { nextSlide(); resetAuto(); }
    if(e.key === 'ArrowLeft') { prevSlide(); resetAuto(); }
  });

  // Initialize
  goToSlide(0);
  startAuto();
})();