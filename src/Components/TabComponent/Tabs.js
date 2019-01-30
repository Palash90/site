import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Home from '../Home/Home';
import GitHub from '../GitHub/GitHub';

export default function Footer(props) {
    return (

        <div className="d-flex justify-content-center">
            <Tabs defaultIndex={0} >
                <TabList>
                    <Tab>Home</Tab>
                    <Tab>Github</Tab>
                </TabList>
                <TabPanel>
                    <Home />
                </TabPanel>
                <TabPanel>
                    <GitHub />
                </TabPanel>
            </Tabs>
        </div>
    );
}