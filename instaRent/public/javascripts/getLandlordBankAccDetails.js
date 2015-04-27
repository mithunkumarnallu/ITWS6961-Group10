
Stripe.setPublishableKey('pk_test_jwW7JFcTZaD8HmJdFZgeh4TR');

var stripeResponseHandler = function(status, response) {
    var $form = $('#inst-form');
    if (response.error)
    {
        console.log(response.error);

        $form.find('button').prop('disabled', false);
    }
    else
    {
        console.log(JSON.stringify(response));
        var token = response.id;
        var route = $('#routingno').val();
        var accno = $('#tbAccountNo').val();
        var fn =  $('#firstname').val();
        var ln = $('#LastName').val();
        if(!route || !accno || !fn || !ln){
            alert("All fields are mandatory");
            return;
        }

        $.ajax(
            {
                type: 'POST',
                url: "/payments/addLandlordAccount",
                data:{accNo:accno , routeNo:route , tokenID:token , fn:fn , ln: ln},
                success: function (responseData) {
                    console.log(JSON.stringify(responseData));
                }
            });
        alert("Successfully saved your Bank Account details");

        $table = $('#table-methods-table').bootstrapTable('refresh', {
            url: '/payments/getBankAccountHistory'
        });

    }
}


function getDetails() {
    var route = $('#routingno').val();
    var accno = $('#tbAccountNo').val();
    var fn =  $('#firstname').val();
    var ln = $('#LastName').val();
    if(!route || !accno || !fn || !ln){
        alert("All fields are mandatory");
        return;
    }

    $('#button').prop('disabled', true);
    // Create a token with Stripe
    Stripe.bankAccount.createToken({
        country: 'US',
        currency: 'USD',
        routing_number: route,
        account_number: accno
    }, stripeResponseHandler);
    return false;
}

function queryParams() {
    return {
        type: 'owner',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page: 1
    };
}

function rowStyle(row, index) {
    var classes = ['active', 'success', 'info', 'warning', 'danger'];

    if (index % 2 === 0 && index / 2 < classes.length) {
        return {
            classes: classes[index / 2]
        };
    }
    return {};
}

function makeDefault(){

    $.ajax(
        {
            type: 'GET',
            url: "/payments/getDefaultBankAccno",
            success: function (data) {
                if(data=="false"){
                    alert("Select a bank account first");
                    return;
                }
            }
        });
}

