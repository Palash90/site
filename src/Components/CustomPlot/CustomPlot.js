import React from 'react';
import Plot from 'react-plotly.js';


export default class CustomPlot extends React.Component {
    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.updateState = this.updateState.bind(this);
        this.state = {
            layout: this.props.data.layout
        };
        this.updateState();
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    updateDimensions() {
        this.updateState();
    }
    updateState() {
        var state = this.state.layout;
        state['paper_bgcolor'] = 'rgba(0,0,0,0)';
        state['plot_bgcolor'] = 'rgba(0,0,0,0)';
        state['width'] = (window.innerWidth * 98 / 100);
        this.setState({layout:state})
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