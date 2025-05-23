let stripe;
let elements;
let dotNetReference;

async function initializeStripe(dotNetRef) {
    dotNetReference = dotNetRef;
    
    // Replace with your actual Stripe publishable key
    stripe = Stripe('pk_test_your_publishable_key');
    
    const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: "xl-tshirt" }] })
    });
    const { clientSecret } = await response.json();

    const appearance = { theme: 'stripe' };
    elements = stripe.elements({ appearance, clientSecret });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#card-element");

    document.querySelector("#submit").addEventListener("click", handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: `${window.location.origin}/payment-confirmation`,
        },
    });

    if (error) {
        showMessage(error.message);
    } else {
        // Payment succeeded
        const paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
        await dotNetReference.invokeMethodAsync('OnPaymentSucceeded', paymentIntent.id);
    }

    setLoading(false);
}

function setLoading(isLoading) {
    if (isLoading) {
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}

function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");
    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 4000);
}

window.initializeStripe = initializeStripe;