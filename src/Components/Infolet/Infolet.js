import React from 'react';
import './styles.css';
import CustomPlot from '../CustomPlot/CustomPlot';
import TableData from '../TableData/TableData';

export default class Infolet extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showTable: false };
    }
    render() {
        return (
            <div>
                {
                    this.props.changeOn === 'click' ?
                        <div className="infolet-div" onClick={() => this.setState({ showTable: !this.state.showTable })}>
                            {
                                this.state.showTable ?
                                    <TableData data={this.props.tableData} /> :
                                    <CustomPlot data={this.props.plotData} />
                            }
                        </div>
                        :
                        <div className="infolet-div">
                            {
                                this.state.showTable ?
                                    <TableData data={this.props.tableData} /> :
                                    <CustomPlot data={this.props.plotData} />
                            }
                        </div>
                }
                {
                    this.props.changeOn === 'click' ? '' :
                        <button onClick={() => this.setState({ showTable: !this.state.showTable })}>
                            {
                                this.state.showTable ?
                                    'Pictorial' :
                                    'Tabular'
                            }
                        </button>
                }

            </div>
        );
    }
}