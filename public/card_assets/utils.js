function convertToBengaliNumber(number){
    var output = '';
    var sNumber = number.toString();

    for (var j = 0; j < sNumber.length; j++) {
        switch (sNumber.charAt(j)) {
            case '0':
                output += '০';
                break;
            case '1':
                output += '১';
                break;
            case '2':
                output += '২';
                break;
            case '3':
                output += '৩';
                break;
            case '4':
                output += '৪';
                break;
            case '5':
                output += '৫';
                break;
            case '6':
                output += '৬';
                break;
            case '7':
                output += '৭';
                break;
            case '8':
                output += '৮';
                break;
            case '9':
                output += '৯';
                break;
        }
    }
    return output;
}

function convertToHindiNumber(number){
    var output = '';
    var sNumber = number.toString();

    for (var j = 0; j < sNumber.length; j++) {
        switch (sNumber.charAt(j)) {
            case '0':
                output += '०';
                break;
            case '1':
                output += '१';
                break;
            case '2':
                output += '२';
                break;
            case '3':
                output += '३';
                break;
            case '4':
                output += '४';
                break;
            case '5':
                output += '५';
                break;
            case '6':
                output += '६';
                break;
            case '7':
                output += '७';
                break;
            case '8':
                output += '८';
                break;
            case '9':
                output += '९';
                break;
        }
    }
    return output;
}