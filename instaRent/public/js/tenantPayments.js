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
        url: '/payments/checkLandlordBankAccount',

        success: function (responseData) {
            console.log(responseData);

            if(responseData=="false"){
                alert("Your landlord has not added a bank account yet");
                return;
            }
            else{
                $.ajax({
                    type: "GET",
                    url: '/payments/getRent',

                    success: function (responseData, status) {
                        rent = responseData;
                        if(rent==0){
                            alert("Rent amount is Zero");
                            return;
                        }
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
        }
    });




}

$('#pay').on('click', function() {
    dynamicRent();

});