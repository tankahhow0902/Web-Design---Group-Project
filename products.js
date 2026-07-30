const cartButtons = document.querySelectorAll(".add-cart");

cartButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        alert("Add to Cart clicked!");
    });
});

const stars = document.querySelectorAll(".product-rating .star");
const ratingCount = document.querySelector(".rating-count");

let totalRatings = parseInt(ratingCount.textContent);

stars.forEach((star, index) => {

    star.addEventListener("click", () => {

        // Highlight selected stars
        stars.forEach((s, i) => {
            if (i <= index) {
                s.style.color = "gold";
            } else {
                s.style.color = "lightgray";
            }
        });

        // Increase rating count
        totalRatings++;
        ratingCount.textContent = totalRatings;

    });

});