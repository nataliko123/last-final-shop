// Function to toggle favorite status and update localStorage
function setupHeartToggle(productCard, product) {
    const heartWrapper = productCard.querySelector(".heart-wrapper");
    heartWrapper.addEventListener("click", () => {
        const productId = product.id;
        let favorites = JSON.parse(localStorage.getItem("favorites")) || {};
        let currentFavorite = favorites[productId] || false;
        currentFavorite = !currentFavorite;
        favorites[productId] = currentFavorite;
        localStorage.setItem("favorites", JSON.stringify(favorites));

        // Dispatch custom event
        const event = new CustomEvent('favoriteToggled', {
            detail: { productId, isFavorite: currentFavorite }
        });
        document.dispatchEvent(event);
    });
}

document.addEventListener('favoriteToggled', function(e) {
    const { productId, isFavorite } = e.detail;
    document.querySelectorAll(`.heart-wrapper[data-product-id="${productId}"] .heart-icon`).forEach(icon => {
        icon.src = isFavorite ? './assets/Like.svg' : './assets/Heart.svg';
        icon.alt = isFavorite ? 'favorite' : 'heart';
    });
});

// Function to add product to localStorage
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if product already exists in the cart
    let existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1; // Increase quantity if already in cart
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new product with quantity
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to update quantity
function updateQuantity(index, action) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (action === "increase") {
        cart[index].quantity += 1;
        const quantityField = document.querySelectorAll(".product-quantity input")[index];
        if (quantityField) {
            quantityField.value = cart[index].quantity;
        }
    } else if (action === "decrease" && cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        const quantityField = document.querySelectorAll(".product-quantity input")[index];
        if (quantityField) {
            quantityField.value = cart[index].quantity;
        }
    } else if (action === "decrease" && cart[index].quantity <= 1) {
        cart = cart.filter((item, i) => {
            return i !== +index;
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay(); // Update display and prices
}

function updateOrderSummary(subtotal, tax, shipping, total) {
    const subtotalElement = document.querySelector(".subtotal p.black-style-large");
    const taxElement = document.querySelector(".tax p.black-style-large");
    const shippingElement = document.querySelector(".shipping p.black-style-large");
    const totalElement = document.querySelector(".total p.black-style-large");

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function updateCartDisplay() {
    const cartContainer = document.querySelector(".products-list");
    if (!cartContainer) return; // Exit if not on cart page

    cartContainer.innerHTML = "";

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Display empty cart message if cart is empty
    if (cart.length === 0) {
        updateOrderSummary(0, 0, 0, 0);
        cartContainer.innerHTML = `
            <div class='empty-cart-wrapper'>
                <img class='empty-logo' src='../assets/empty-shopping-cart.webp' alt='empty-cart-logo'/>
                <p class='empty-card-title'>Your shopping cart is empty.</p>
            </div>
        `;
        return;
    }

    let totalQuantity = cart.reduce((acc, product) => acc + product.quantity, 0);
    let totalPrice = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

    const tax = totalQuantity * 20;
    const shippingCost = totalQuantity * 14;
    const totalAmount = totalPrice + tax + shippingCost;

    updateOrderSummary(totalPrice, tax, shippingCost, totalAmount);

    cart.forEach((product, index) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");

        productDiv.innerHTML = `
            <img class="product-img" src="${product.image}" alt="${product.name}">
            <div class="product-content">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>#${product.id}</p>
                </div>
                <div class="product-second-line">
                    <div class="product-quantity">
                        <button class="decrease" data-index="${index}">−</button>
                        <input type="text" value="${product.quantity}" disabled>
                        <button class="increase" data-index="${index}">+</button>
                    </div>
                    <p class="product-price">$${(product.price * product.quantity).toFixed(2)}</p>
                    <img class="delete-button" src="../assets/Delete-Button.svg" alt="delete-button" data-index="${index}">
                </div>
            </div>
        `;
        cartContainer.appendChild(productDiv);

        if (index < cart.length - 1) { // Add divider if not the last item
            const divider = document.createElement("div");
            divider.classList.add("product-divider");
            cartContainer.appendChild(divider);
        }
    });

    document.querySelectorAll(".increase").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            updateQuantity(this.dataset.index, "increase");
        });
    });

    document.querySelectorAll(".decrease").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            updateQuantity(this.dataset.index, "decrease");
        });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            removeFromCart(this.dataset.index);
        });
    });
}

// Function to remove product from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Remove selected product

    if (cart.length === 0) {
        localStorage.removeItem("cart");
        updateOrderSummary(0, 0, 0, 0);
        const cartContainer = document.querySelector(".products-list");
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class='empty-cart-wrapper'>
                    <img class='empty-logo' src='../assets/empty-shopping-cart.webp' alt='empty-cart-logo'/>
                    <p class='empty-card-title'>Your shopping cart is empty.</p>
                </div>
            `;
        }
        return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay(); // Update the cart display
}

document.addEventListener("DOMContentLoaded", function () {
    // Burger menu functionality
    const burgerMenu = document.querySelector(".burger-menu");
    const navBar = document.querySelector(".nav-bar");
    const actionsWrapper = document.querySelector(".actions-wrapper");
    const body = document.querySelector("body");

    if (burgerMenu && navBar && actionsWrapper) {
        // Toggle mobile menu visibility
        burgerMenu.addEventListener("click", () => {
            const isActive = burgerMenu.classList.toggle("active");
            navBar.classList.toggle("mobile-active", isActive);
            actionsWrapper.classList.toggle("mobile-active", isActive);
            body.style.overflow = isActive ? "hidden" : "visible";
        });

        // Close menu when a nav item is clicked
        navBar.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", () => {
                burgerMenu.classList.remove("active");
                navBar.classList.remove("mobile-active");
                actionsWrapper.classList.remove("mobile-active");
                body.style.overflow = "visible";
            });
        });
    }
    // Adding data to products Section
    fetch("./items/items.json")
        .then((response) => response.json())
        .then((data) => {
            const productsContainer = document.querySelector(".products-wrapper");
            if (productsContainer) {
                productsContainer.innerHTML = "";

                let favorites = JSON.parse(localStorage.getItem("favorites")) || {};

                data.products.forEach((product) => {
                    const productCard = document.createElement("div");
                    productCard.classList.add("product-card");

                    const isFavorite = favorites[product.id] || product.favorite || false;

                    productCard.innerHTML = `
                        <div class="heart-wrapper" data-product-id="${product.id}">
                            ${isFavorite ? '<img src="./assets/Like.svg" alt="favorite" class="heart-icon">' : '<img src="./assets/Heart.svg" alt="heart" class="heart-icon">'}
                        </div>
                        <div class="product-card-content">
                            <img src="${product.image}" alt="${product.name}">
                            <p>${product.name}</p>
                            <h3>$${product.price}</h3>
                            <button class="add-to-cart">Add To Cart</button>
                        </div>
                    `;

                    productsContainer.appendChild(productCard);

                    const addToCartMessage = document.querySelector(".add-to-cart-message");
                    const addToCartButton = productCard.querySelector(".add-to-cart");
                    const closeMessageButton = document.querySelector(".close-message-btn");
                    const addToCartMessageBackground = document.querySelector(".add-to-cart-message-background");

                    addToCartButton.addEventListener("click", function () {
                        addToCart(product);
                        addToCartMessage.classList.toggle("active-message");
                        body.style.overflow = "hidden";
                        addToCartMessageBackground.style.display = "block";
                    });

                    closeMessageButton.addEventListener("click", () => {
                        body.style.overflow = "visible";
                        addToCartMessageBackground.style.display = "none";
                        addToCartMessage.classList.remove("active-message");
                    });

                    addToCartMessageBackground.addEventListener("click", function () {
                        addToCartMessageBackground.style.display = "none";
                        body.style.overflow = "visible";
                        addToCartMessage.classList.remove("active-message");
                    });

                    setupHeartToggle(productCard, product);
                });
            }
        })
        .catch((error) => console.error("Error loading products data:", error));

    // Adding data to category Section
    fetch("./items/category.json")
        .then((response) => response.json())
        .then((categories) => {
            const categoryWrapper = document.querySelector(".category-cards-wrapper");
            if (categoryWrapper) {
                categoryWrapper.innerHTML = ""; // Clear existing content

                categories.forEach((category) => {
                    const card = document.createElement("div");
                    card.classList.add("category-card");

                    card.innerHTML = `
                        <img src="${category.image}" alt="${category.category}" />
                        <p>${category.category}</p>
                    `;

                    categoryWrapper.appendChild(card);
                });
            }
        })
        .catch((error) => console.error("Error loading category data:", error));

    // Adding data to discounts Section
    fetch("./items/discounts.json")
        .then((response) => response.json())
        .then((data) => {
            const discountsWrapper = document.querySelector(".discounts-section .products-wrapper");
            if (discountsWrapper) {
                discountsWrapper.innerHTML = "";

                let favorites = JSON.parse(localStorage.getItem("favorites")) || {};

                data.forEach((product) => {
                    const productCard = document.createElement("div");
                    productCard.classList.add("product-card");

                    const isFavorite = favorites[product.id] || product.favorite || false;

                    productCard.innerHTML = `
                        <div class="heart-wrapper" data-product-id="${product.id}">
                            ${isFavorite ? '<img src="./assets/Like.svg" alt="favorite" class="heart-icon">' : '<img src="./assets/Heart.svg" alt="heart" class="heart-icon">'}
                        </div>
                        <div class="product-card-content">
                            <img src="${product.image}" alt="${product.name}" />
                            <p>${product.name}</p>
                            <h3>$${product.price}</h3>
                            <button class="add-to-cart-discount">Add To Cart</button>
                        </div>
                    `;

                    discountsWrapper.appendChild(productCard);

                    const addToCartMessage = document.querySelector(".add-to-cart-message");
                    const addToCartButton = productCard.querySelector(".add-to-cart-discount");
                    const addToCartMessageBackground = document.querySelector(".add-to-cart-message-background");

                    addToCartButton.addEventListener("click", function () {
                        addToCart(product);
                        body.style.overflow = "hidden";
                        addToCartMessageBackground.style.display = "block";
                        addToCartMessage.classList.toggle("active-message");
                    });

                    setupHeartToggle(productCard, product);
                });
            }
        })
        .catch((error) => console.error("Error loading discounts data:", error));

    // Update cart display on page load
    updateCartDisplay();

    // Contact form validation
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            ee.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const error = document.getElementById("form-error");

            // Reset error message
            error.textContent = "";

            // Check if all fields are filled
            if (!name || !email || !password) {
                error.textContent = "All fields are required!";
                return;
            }

            // Email regex (basic email format)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                error.textContent = "Please enter a valid email address!";
                return;
            }

            // Password regex (at least 8 characters, 1 letter, 1 number)
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                error.textContent = "Password must be at least 8 characters long and include a letter and a number!";
                return;
            }

            // Success: Save to localStorage and show confirmation
            localStorage.setItem("contactSubmission", JSON.stringify({ name, email }));
            error.style.color = "#008000";
            error.textContent = "Form submitted successfully!";
            contactForm.reset();
        });

        // Show/hide password
        const togglePassword = document.getElementById("toggle-password");
        if (togglePassword) {
            togglePassword.addEventListener("click", function () {
                const passwordInput = document.getElementById("password");
                passwordInput.type = passwordInput.type === "password" ? "text" : "password";
                this.textContent = passwordInput.type === "password" ? "Show Password" : "Hide Password";
            });
        }
    }
});