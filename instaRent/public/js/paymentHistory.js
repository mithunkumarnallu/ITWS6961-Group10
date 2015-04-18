function queryParams() {
    return {
        type: 'owner',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page: 1
    };
}

function downloadExcel(){
    $.ajax(
        {
            type: 'GET',
            url: "/payments/getPaymentHistory",
            success: function (data) {
                console.log("JSON data from API" + JSON.stringify(data));
                tdata = data;
                var array = typeof tdata != 'object' ? JSON.parse(tdata) : tdata;
                var str = '';
                var line = '';
                var head = array[0];

                for (var index in array[0]) {
                    if(index=="date" || index=="landlord_email" || index=="status"
                        || index=="rent") {
                        var value = index + "";
                        line += '"' + value.replace(/"/g, '""') + '",';
                    }
                }
                line = line.slice(0, -1);
                str += line + '\r\n';


                for (var i = 0; i < array.length; i++) {
                    var line = '';
                    for (var index in array[i]) {
                        if(index=="date" || index=="landlord_email" || index=="status"
                            || index=="rent") {
                            var value = array[i][index] + "";
                            line += '"' + value.replace(/"/g, '""') + '",';
                        }
                    }
                    line = line.slice(0, -1);
                    str += line + '\r\n';
                    console.log("Hello"+str);
                    var csv = str;
                    var downloadLink = document.createElement("a");
                    var blob = new Blob(["\ufeff", csv]);
                    var url = URL.createObjectURL(blob);
                    downloadLink.href = url;
                    downloadLink.download =  "PaymentHistory.csv";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }


            }
        });
}