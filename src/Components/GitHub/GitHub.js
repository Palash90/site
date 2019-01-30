import React from 'react';
import GithubCard from 'react-github-card';
import GitHubCalendar from 'github-calendar';
import 'github-calendar/dist/github-calendar.css'

export default class GitHub extends React.Component {
    componentDidMount() {
        GitHubCalendar(".calendar", "palash90");
    }
    render() {
        return (
            <div>
                <GithubCard username="palash90" />
                <div className="calendar"></div>
            </div>

        );
    }
}