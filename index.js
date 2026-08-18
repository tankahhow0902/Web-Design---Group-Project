//Form validation
document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const phone = this.phone.value.trim();
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;

  if (!name) return alert("Oops! Don't forget to enter your name.");
  if (!email) return alert("Don't miss out! Please enter your email.");
  if (!emailPattern.test(email)) return alert("Oops! Email looks wrong.");
  if (!phone) return alert("Please share your phone number with us!");

  alert(`Thank you ${name}! Stay tuned for our latest offers.`);
  this.reset();
});

// Hero banner slider
let slide = 0;
let slideTimer;

const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {
  slides[slide].classList.remove("active");
  dots[slide].classList.remove("active");

  slide = index;

  slides[slide].classList.add("active");
  dots[slide].classList.add("active");

  resetTimer();
}

function changeSlide(direction) {
  let newSlide = slide + direction;

  if (newSlide >= slides.length) {
    newSlide = 0;
  }

  if (newSlide < 0) {
    newSlide = slides.length - 1;
  }

  showSlide(newSlide);
}

function resetTimer() {
  clearTimeout(slideTimer);

  slideTimer = setTimeout(function() {
    let newSlide = slide + 1;

    if (newSlide >= slides.length) {
      newSlide = 0;
    }

    showSlide(newSlide);
  }, 4000);
}

resetTimer();

//Series banner slider
const banners = document.querySelectorAll(".banner-image");

banners.forEach(function(banner, index) {
  let imageSlide = 0;
  const imageSlides = banner.querySelectorAll(".image-slide");

  setTimeout(function() {

    setInterval(function() {
      imageSlides[imageSlide].classList.remove("active");

      imageSlide++;

      if (imageSlide >= imageSlides.length) {
        imageSlide = 0;
      }

      imageSlides[imageSlide].classList.add("active");
    }, 3000);

  }, index * 1000);
});