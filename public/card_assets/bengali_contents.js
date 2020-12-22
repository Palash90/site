function convertToBengaliNumbers(number){
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

var bengaliAlphabets = [
    {
        content: "&#x0985;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0986;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0987;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0988;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0989;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x098A;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x098B;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x098C;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x098F;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0990;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0993;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0994;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0995;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0996;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0997;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0998;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0999;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x099A;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x099B;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x099C;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x099D;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x099E;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x099F;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A0;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A1;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A2;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A3;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A4;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A5;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A6;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A7;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09A8;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09AA;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09AB;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09AC;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09AD;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09AE;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09AF;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09B0;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09B2;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09B6;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09B7;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09B8;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09B9;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09DC;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09DD;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x09DF;",
        type: "alphabet",
        desc: ""
    },
    {
        content: "&#x09CE;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0981;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0982;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    },
    {
        content: "&#x0983;",
        type: "alphabet",
        desc: {
            language: "Bengali"
        }
    }
];

for (var i = 1; i <= 200; i++) {
    bengaliAlphabets.push({
        content: convertToBengaliNumbers(i),
        type: "alphabet",
        desc: {
            language: i
        }
    })
}



var bengaliWords = []

var bengaliSentences = []