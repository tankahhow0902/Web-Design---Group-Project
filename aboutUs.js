let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("about-designer");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "grid";
  dots[slideIndex-1].className += " active";
}

setInterval(() => {
  plusSlides(1);
}, 10000);

const modal = document.getElementById('event-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalDetail = document.getElementById('modal-detail');
const closeBtn = document.querySelector('.close');

document.querySelectorAll('.event-card').forEach(card => {
  card.addEventListener('click', () => {
    modalImage.src = card.querySelector('img').src;
    modalName.textContent = card.dataset.name;
    modalDetail.textContent = card.dataset.detail;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
});

closeBtn.onclick = () => {
  modal.style.display = 'none';
  document.body.style.overflow = '';
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
});