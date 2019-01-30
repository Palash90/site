import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Home from '../Home/Home';
import GitHub from '../GitHub/GitHub';
import GoodReads from '../GoodReads/GoodReads';
import Header from '../Header/Header';

export default function Footer(props) {
    return (
        <Tabs defaultIndex={0} >
            <div className="d-flex flex-column justify-content-start">
               <Header className="d-flex justify-content-start" />
                <TabList className="d-flex justify-content-end">
                    <Tab>Home</Tab>
                    <Tab>Github</Tab>
                    <Tab>Good Reads</Tab>
                </TabList>
            </div>
            <div className="d-flex flex-column justify-content-center">
                <TabPanel>
                    <Home />
                </TabPanel>
                <TabPanel>
                    <GitHub />
                </TabPanel>
                <TabPanel>
                    <GoodReads />
                </TabPanel>

            </div>
        </Tabs>
    );
}