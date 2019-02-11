import React from 'react';
import Plot from 'react-plotly.js';


export default class CustomPlot extends React.Component {
    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.updateState = this.updateState.bind(this);
        this.showDetailsInDiv = this.showDetailsInDiv.bind(this);
        this.state = {
            layout: this.props.data.layout
        };
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

        if (this.props.data.configuration.showDetails) {
            state['width'] = (window.innerWidth * 78 / 100);
        } else {
            state['width'] = (window.innerWidth * 98 / 100);
        }
        this.setState({ layout: state })
    }
    showDetailsInDiv(data) {
        var details = '';
        data.data.points.map(function (d) {
            details = d.hovertext;
            return null;
        });
        for (var key in this.props.data.configuration.detailsData) {
            if (key === details) {
                this.setState({ details: this.props.data.configuration.detailsData[key] });
            }
        }
    }

    render() {
        return (
            <div className="row">
                <div className={this.props.data.configuration.showDetails ? "cols-10" : "cols-11"}>
                    <Plot
                        data={this.props.data.data}
                        layout={this.state.layout}
                        config={{ displayModeBar: false, responsive: true }}
                        onHover={(data) => this.showDetailsInDiv({ data })}
                        onUnhover={() => this.setState({ details: null })} />
                </div>
                <div className="cols-1">

                </div>
                {
                    this.props.data.configuration.showDetails ?
                        <div className="cols-1">
                            <div className="card">
                                {
                                    JSON.stringify(this.state.details)
                                }
                            </div>
                        </div> : ''
                }
            </div>
        );
    }
}