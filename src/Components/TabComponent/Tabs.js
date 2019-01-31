import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Home from '../Home/Home';
import Header from '../Header/Header';
import Activities from '../Activities/ActivitiesComponent';

export default function Footer(props) {
    return (
        <div className="d-flex flex-column justify-content-around">
            <Tabs defaultIndex={1}>
                <TabList className="header">
                    <Header />
                    <div className="d-flex justify-content-end">
                        <Tab>Home</Tab>
                        <Tab>Activities</Tab>
                    </div>
                </TabList>
                <div className="main">
                    <TabPanel>
                        <Home />
                    </TabPanel>
                    <TabPanel>
                        <Activities />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}