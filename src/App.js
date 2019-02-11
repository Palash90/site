import React, { Component } from 'react';
import Footer from './Components/Footer/Footer';
import Tabs from './Components/TabComponent/Tabs'

class App extends Component {
  render() {
    return (
      <div>
        <Tabs />
        <Footer />
      </div>

    );
  }
}

export default App;
