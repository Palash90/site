import React, { Component } from 'react';
import GoodReads from './Components/GoodReads/GoodReads';
import GitHub from './Components/GitHub/GitHub';
import Header from './Components/Header/Header';
import Home from './Components/Home/Home';
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
