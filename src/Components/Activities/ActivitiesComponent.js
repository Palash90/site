import React from 'react';
import GitHub from '../GitHub/GitHub';
import GoodReads from '../GoodReads/GoodReads';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";

export default function Activities(props) {
    return (
        <div className="d-flex flex-column justify-content-around">
            <Tabs defaultIndex={0}>
                <TabList className="header-second-level">
                    <div className="d-flex justify-content-end">
                        <Tab>Github</Tab>
                        <Tab>Good Reads</Tab>
                    </div>
                </TabList>
                <div className="main-second-level">
                    <TabPanel>
                        <GitHub />
                    </TabPanel>
                    <TabPanel>
                        <GoodReads />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}