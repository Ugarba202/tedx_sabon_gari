// Paystack Integration Logic with Shopping Cart

// Cart State
let cart = [];

// Highlight active nav item
$(document).ready(function () {
    $('nav a[href="speakers.html"]').parent().addClass('active');
});

// Handle "Add to Cart" (formerly Select Ticket)
const ticketButtons = document.querySelectorAll('.ticket-select-btn');
const checkoutSection = document.getElementById('checkoutSection');
const cartContainer = document.getElementById('cartContainer');
const cartList = document.getElementById('cartList');
const cartTotalDisplay = document.getElementById('cartTotalDisplay');
const clearCartBtn = document.getElementById('clearCartBtn');

// Initialize Buttons
ticketButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Find the parent card
        const card = this.closest('.ticket-card');
        const type = card.querySelector('.ticket-name').textContent;
        // Extract price numerical value
        const priceText = card.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')); // e.g. 5000

        addToCart(type, price);
    });
});

// Add Item to Cart
function addToCart(type, price) {
    // Check if item already exists
    const existingItem = cart.find(item => item.type === type);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ type: type, price: price, quantity: 1 });
    }

    updateCartUI();

    // Show cart and scroll to it
    cartContainer.style.display = 'block';

    // Optional: Scroll only if it's the first item added
    if (cart.length === 1 && cart[0].quantity === 1) {
        cartContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Remove Item from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Clear Cart
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function () {
        cart = [];
        updateCartUI();
    });
}

// Update Cart UI
function updateCartUI() {
    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const li = document.createElement('li');
        li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;';
        li.innerHTML = `
            <span>${item.quantity}x <strong>${item.type}</strong></span>
            <div>
                <span style="margin-right: 15px;">₦${itemTotal.toLocaleString()}</span>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color: red; cursor:pointer;">&times;</button>
            </div>
        `;
        cartList.appendChild(li);
    });

    cartTotalDisplay.textContent = '₦' + total.toLocaleString();

    // Update Pay Button
    document.getElementById('payButton').textContent = `Pay ₦${total.toLocaleString()} Now`;

    // Show Checkout Form if cart has items
    if (total > 0) {
        checkoutSection.style.display = 'block';
    } else {
        checkoutSection.style.display = 'none';
    }
}


// Handle Form Submission
const paymentForm = document.getElementById('checkoutForm');
if (paymentForm) {
    paymentForm.addEventListener("submit", payWithPaystack, false);
}

function payWithPaystack(e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    // Calculate Total from Cart
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalAmount <= 0) {
        alert("Your cart is empty.");
        return;
    }

    // Generate Description for Metadata
    const cartDescription = cart.map(item => `${item.quantity}x ${item.type}`).join(', ');

    // Initialize Paystack Popup
    let handler = PaystackPop.setup({
        key: 'pk_live_99c34e3cbbe5802ed03c4c5baa54264999e22c03', // Live Public Key
        email: email,
        amount: totalAmount * 100, // Amount in kobo
        currency: 'NGN',
        metadata: {
            custom_fields: [
                {
                    display_name: "Mobile Number",
                    variable_name: "mobile_number",
                    value: phone
                },
                {
                    display_name: "First Name",
                    variable_name: "first_name",
                    value: firstName
                },
                {
                    display_name: "Last Name",
                    variable_name: "last_name",
                    value: lastName
                },
                {
                    display_name: "Cart Items",
                    variable_name: "cart_items",
                    value: cartDescription
                }
            ]
        },
        callback: function (response) {
            // Payment successful

            // Hide Form & Cart
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('cartContainer').style.display = 'none'; // Hide Cart
            document.querySelector('#checkoutSection h3').style.display = 'none';

            // Show Success Message
            const successDiv = document.getElementById('paymentSuccess');
            successDiv.style.display = 'block';

            // Populate Details
            document.getElementById('successRef').textContent = response.reference;
            document.getElementById('successAmount').textContent = '₦' + totalAmount.toLocaleString();
            document.getElementById('successTicket').textContent = cartDescription; // Show full cart summary
            document.getElementById('successEmail').textContent = email;

            // Scroll to success message
            document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });

            // Clear Cart State
            cart = [];
        },
        onClose: function () {
            alert('Transaction was not completed, window closed.');
        }
    });

    handler.openIframe();
}

// Make removeFromCart global available for inline HTML onclick
window.removeFromCart = removeFromCart;
