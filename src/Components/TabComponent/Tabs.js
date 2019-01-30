import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Home from '../Home/Home';
import GitHub from '../GitHub/GitHub';
import GoodReads from '../GoodReads/GoodReads';

export default function Footer(props) {
    return (
        <div className="d-flex justify-content-center">
            <Tabs defaultIndex={0} >
                <TabList>
                    <Tab>Home</Tab>
                    <Tab>Github</Tab>
                    <Tab>Good Reads</Tab>
                </TabList>
                <TabPanel>
                    <Home />
                </TabPanel>
                <TabPanel>
                    <GitHub />
                </TabPanel>
                <TabPanel>
                    <GoodReads />
                </TabPanel>
            </Tabs>
        </div>
    );
}