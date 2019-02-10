import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Home from '../Home/Home';
import Header from '../Header/Header';
import Activities from '../Activities/ActivitiesComponent';
import Infolet from '../Infolet/Infolet';
import educationData from '../../Data/EducationData'
import EducationComponent from '../EducationComponent/EducationComponent';

export default function Footer(props) {
    return (
        <div className="d-flex flex-column justify-content-around">
            <Tabs defaultIndex={0}>
                <TabList className="header">
                    <Header />
                    <div className="d-flex justify-content-end">
                        <Tab>Home</Tab>
                        <Tab>Activities</Tab>
                        <Tab>Education</Tab>

                    </div>
                </TabList>
                <div className="main">
                    <TabPanel>
                        <Home />
                    </TabPanel>
                    <TabPanel>
                        <Activities />
                    </TabPanel>
                    <TabPanel>
                        <EducationComponent />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}