import React from 'react';
import Plot from 'react-plotly.js';


export default class CustomPlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: this.props.data.layout
        };
        var state = this.state.layout;
        state['paper_bgcolor'] = 'rgba(0,0,0,0)';
        state['plot_bgcolor'] = 'rgba(0,0,0,0)';

    }
    render() {
        return (
            <Plot
                data={this.props.data.data}
                layout={this.state.layout}
                config={{ displayModeBar: false, responsive: true }} />
        );
    }
}