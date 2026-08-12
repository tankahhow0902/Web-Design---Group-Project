const cartButtons = document.querySelectorAll(".add-cart");

cartButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        button.textContent = "Added!";
        
        setTimeout(function() {
            button.textContent = "Add to Cart";
        }, 1000);

    });

});

window.addEventListener("load", function () {
    const navigation = performance.getEntriesByType("navigation")[0];

    if (navigation && navigation.type === "reload") {
        return;
    }

    const targetId = window.location.hash.substring(1);

    if (targetId) {
        const product = document.getElementById(targetId);

        if (product && product.classList.contains("product")) {
            product.classList.add("highlight");

            setTimeout(() => {
                product.classList.remove("highlight");
            }, 3000);
        }
    }
});