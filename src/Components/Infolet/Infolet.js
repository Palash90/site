import React from 'react';
import './styles.css';

export default class Infolet extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showData: false };
    }
    render() {
        return (
            <div className="fade-div"
                onMouseOver={() => this.setState({ showData: true })}
                onMouseOut={() => this.setState({ showData: false })}>
                {this.state.showData ? "Hello" : 'Hi'}
            </div>
        );
    }
}