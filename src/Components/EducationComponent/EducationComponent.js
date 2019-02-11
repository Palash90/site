import React from 'react';
import Infolet from '../Infolet/Infolet';
import educationData from '../../Data/EducationData';

export default function EducationComponent(props) {
    return (
        <Infolet tableData={educationData.tableData} plotData={educationData.plotData} changeOn={educationData.changeMode}/>
    );
}