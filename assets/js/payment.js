// Paystack Integration Logic

// Variables to store selected ticket details
let selectedTicketType = '';
let selectedTicketPrice = 0;

// Highlight active nav item
$(document).ready(function () {
    $('nav a[href="speakers.html"]').parent().addClass('active');
});

// Handle Ticket Selection
const ticketButtons = document.querySelectorAll('.ticket-select-btn');
const checkoutSection = document.getElementById('checkoutSection');

ticketButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Find the parent card
        const card = this.closest('.ticket-card');
        const type = card.querySelector('.ticket-name').textContent;
        // Extract price numerical value (remove non-numeric chars)
        const priceText = card.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')); // e.g. 5000

        selectedTicketType = type;
        selectedTicketPrice = price;

        // Update hidden inputs if needed, or just use variables
        document.getElementById('ticketType').value = selectedTicketType;
        document.getElementById('ticketPrice').value = selectedTicketPrice;

        // Scroll to checkout
        checkoutSection.scrollIntoView({ behavior: 'smooth' });

        // Optional: Update Payment Button text to show amount
        document.getElementById('payButton').textContent = `Pay ₦${price.toLocaleString()} Now`;
    });
});

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

    if (!selectedTicketPrice || selectedTicketPrice <= 0) {
        alert("Please select a valid ticket first.");
        return;
    }

    // Initialize Paystack Popup
    let handler = PaystackPop.setup({
        key: 'pk_test_xxxxxxxxxxxxxxxxxxxx', // REPLACE THIS WITH YOUR PUBLIC KEY
        email: email,
        amount: selectedTicketPrice * 100, // Amount in kobo
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
                    display_name: "Ticket Type",
                    variable_name: "ticket_type",
                    value: selectedTicketType
                }
            ]
        },
        callback: function (response) {
            // Payment successful

            // Hide Form
            document.getElementById('checkoutForm').style.display = 'none';
            document.querySelector('#checkoutSection h3').style.display = 'none';

            // Show Success Message
            const successDiv = document.getElementById('paymentSuccess');
            successDiv.style.display = 'block';

            // Populate Details
            document.getElementById('successRef').textContent = response.reference;
            document.getElementById('successAmount').textContent = '₦' + selectedTicketPrice.toLocaleString();
            document.getElementById('successTicket').textContent = selectedTicketType;
            document.getElementById('successEmail').textContent = email;

            // Scroll to success message
            document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });
        },
        onClose: function () {
            alert('Transaction was not completed, window closed.');
        }
    });

    handler.openIframe();
}
