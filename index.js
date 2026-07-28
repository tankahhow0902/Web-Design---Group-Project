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