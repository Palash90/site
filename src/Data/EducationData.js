var madhyamik = {
    id: 'Madhyamik',
    cols: [{
        id: 'degree',
        data: 'Madhyamik'
    }, {
        id: 'board',
        data: 'West Bengal Board of Secondary Education'
    }, {
        id: 'marks',
        data: '75.75%'
    }, {
        id: 'year',
        data: '2005'
    }, {
        id: 'Institution',
        data: 'Barddhaman Sri Ramakrishna Uchcha Vidyalaya'
    }]
};
var uchchaMadhyamik = {
    id: 'Uchcha Madhyamik',
    cols: [{
        id: 'degree',
        data: 'Uchcha Madhyamik(10 + 2)'
    }, {
        id: 'board',
        data: 'West Bengal Council of Higher Secondary Education'
    }, {
        id: 'marks',
        data: '72%'
    }, {
        id: 'year',
        data: '2007'
    }, {
        id: 'Institution',
        data: 'Barddhaman Sri Ramakrishna Uchcha Vidyalaya'
    }]
};
var bTech = {
    id: 'Bachelor of Technology',
    cols: [{
        id: 'degree',
        data: 'Bachelor of Technology'
    }, {
        id: 'board',
        data: 'West Bengal University of Technology'
    }, {
        id: 'marks',
        data: 'DGPA 7.34'
    }, {
        id: 'year',
        data: '2011'
    }, {
        id: 'Institution',
        data: 'College of Engineering and Management, Kolaghat'
    }]
};
var tableData = {
    headers: ['Degree', 'Board/University', 'Marks', 'Year', 'Institution'],
    rows: [madhyamik, uchchaMadhyamik, bTech]
};

var plotData = {
    data: [
        {
            orientation: 'h',
            x: ['2005-04-30', '2007-06-28', '2011-06-09'],
            y: ['', '', ""],
            type: 'scatter',
            mode: 'lines+markers',
            x0: '2005-04-30'
        }
    ]
}

var educationData = { tableData: tableData, plotData: plotData }
export default educationData;