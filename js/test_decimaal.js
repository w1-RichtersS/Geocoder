//ik moet in alle td's met id's die beginnen met: 'x', 'y', 'lat', 'lon'
// de punt vervangen door een komma, zodat je in excel niet in de opties de decimaal tekens hoeft om te wisselen
$(document).ready(function () {
    console.log($('#x1, #y1, #lat1, #lon1').html());
})
