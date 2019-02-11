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
        data: '1995-2005'
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
        data: '2005-2007'
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
        data: '2007-2011'
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
            x: ['1990-08-21', '1995-04-01', '2005-04-30', '2007-06-28', '2011-06-09'],
            y: ['', '', '', '', '', ''],
            hovertext: ['Born', 'Started Schooling', 'Madhyamik', 'Uchcha Madhyamik (10 + 2)', 'B. Tech'],
            type: 'scatter',
            mode: 'lines+markers',
            y0: '2005-04-30'
        }
    ],
    layout: {
        xaxis: {
            fixedrange: true,
            title: 'Time'
        },
        yaxis: {
            fixedrange: true,
            title: 'Degree'
        }
    },
    configuration: {
        showDetails: true,
        detailsData: {
            'Born': {State: 'West Bengal'},
            'Started Schooling': {},
            'Madhyamik': {},
            'Uchcha Madhyamik (10 + 2)': {},
            'B. Tech': {}
        }
    }
}

var educationData = { tableData: tableData, plotData: plotData }
export default educationData;