var rent = 0;

function onReceiveToken(token, args) {
    // Submit token to server so it can charge the card
    $.ajax({
        url: '/payments/charge',
        type: 'POST',
        data: {
            stripeToken: token.id
        }
    });
}

function dynamicRent(){

    $.ajax({
        type: "GET",
        url: '/payments/getRent',

        success: function (responseData, status) {
            rent = responseData;
            var checkout = StripeCheckout.configure({
                key: 'pk_test_jwW7JFcTZaD8HmJdFZgeh4TR',
                token: onReceiveToken,
                image: '',
                name: 'InstaRent.com',
                description: 'Pay rent',
                amount: rent*100
            });
            checkout.open();
        }
    });
}

$('#pay').on('click', function() {
    dynamicRent();
    return false;
});