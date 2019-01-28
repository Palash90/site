import React, { Component } from 'react';
import GoodReads from './Components/GoodReads/GoodReads';
import GitHub from './Components/GitHub/GitHub';
import Header from './Components/Header/Header';



class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="float-left">
          <GoodReads />
        </div>
        <div className="float-right">
          <GitHub />
        </div>
      </div>
    );
  }
}

export default App;
