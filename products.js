const cartButtons = document.querySelectorAll(".add-cart");

cartButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        alert("Add to Cart clicked!");
    });
});