import React, { Component } from 'react';
import GoodReads from './Components/GoodReads/GoodReads';
import GitHub from './Components/GitHub/GitHub';



class App extends Component {
  render() {
    return (
      <div>
        <p>Palash Kanti Kundu</p>
        <GoodReads />
        <GitHub />
      </div>
    );
  }
}

export default App;
