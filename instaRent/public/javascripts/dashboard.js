 // Calls the function mdy why to get our date
 function mdy(todaysdate) {
    return todaysdate.getMonth()+1+"/"+todaysdate.getDate()
 }

// Get username
 function getName(user) {
 	document.getElementById("firstName").innerHTML = "Peter";
 }

 // Show landlord's name and email
 $(document).ready(function(){
    $("#show").click(function(){
        $("#LandlordInfo").fadeToggle();
    });

});

// Show and hide days to due
$(document).ready(function(){
    $("#show").click(function(){
        $("#DueDay").fadeToggle();
    });

});

// Show and hide Rents
$(document).ready(function(){
    $("#show").click(function(){
        $("#Rents").fadeToggle();
    });
});

// Show and hide Active Complaints
$(document).ready(function(){
    $("#show").click(function(){
        $("#ActiveComplaints").fadeToggle();
    });
});