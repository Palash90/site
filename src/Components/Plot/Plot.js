import React from 'react';
import Plot from 'react-plotly.js';


export default function CustomPlot(props) {
    return (
        <Plot
        data={props.data}
        layout={props.layout}
        config={{displaylogo: false}} />
    );
}