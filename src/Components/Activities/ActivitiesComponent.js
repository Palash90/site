import React from 'react';
import GitHub from '../GitHub/GitHub';
import GoodReads from '../GoodReads/GoodReads';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";

export default function Activities(props) {
    return (
        <Tabs defaultIndex={0} >
            <div className="d-flex flex-column justify-content-start">
                <TabList className="d-flex justify-content-end">
                    <Tab>Github</Tab>
                    <Tab>Good Reads</Tab>
                </TabList>
            </div>
            <div className="d-flex flex-column justify-content-center">
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