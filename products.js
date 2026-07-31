const cartButtons = document.querySelectorAll(".add-cart");

cartButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        button.textContent = "Added!";
        
        setTimeout(function() {
            button.textContent = "Add to Cart";
        }, 1000);

    });

});