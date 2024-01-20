import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'
import './Repositories.css';

const Repositories = () => {
    const [gitlabUrl, setGitlabUrl] = useState('https://gitlab.com');
    const [accessToken, setAccessToken] = useState('glpat-vhW7ZYkRC6JDFLqymUbs');
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(null);
    const [changesSummary, setChangesSummary] = useState(null);
    const [stage, setStage] = useState(1);

    const fetchProjects = async () => {
        setLoading(true);
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);

        try {
            const response = await fetch(`${gitlabUrl}/api/v4/projects?membership=true`, { headers });
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.statusText})`);
            }
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setStage(2);
        setLoading(false);
    };

    const fetchChanges = async () => {
        console.log("fetching changes: ");
        setLoading(true);

        const formattedDate = new Date(date).toISOString();

        const data = {
            gitlab_url: gitlabUrl,
            private_token: accessToken,
            date: formattedDate,
            project_id: selectedProjectId
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/get_diffs', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.statusText})`);
            }
            
            const responseData = await response.json();
            setChangesSummary(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        setStage(4);
        setLoading(false);
    }

    const handleProjectSelect = (project) => {
        setSelectedProjectId(project.id);
        setStage(3);
    };

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <h1>GitLab Updates Analyzer</h1>
            <h2>GitLab Analsis tool that tracks repository changes from a specific date.</h2>
            {stage === 1 && (
            <div>
                <h3>Please provide your gitlab url and accessToken: </h3>
                <div>
                    <input 
                        type="text"
                        value={gitlabUrl}
                        onChange={(e) => setGitlabUrl(e.target.value)}
                        placeholder="GitLab URL"
                    />
                    <input 
                        type="text"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="Access Token"
                    />
                    <button onClick={fetchProjects}>Fetch Projects</button>
                </div>
            </div>
            )}
            {stage > 1 && (<div>
                <h3>
                    Select a project to analyze:
                </h3>
                <ul>
                    {projects.map(project => (
                        <li key={project.id}>
                            <label>
                                <input
                                    type="radio"
                                    name="project"
                                    value={project.id}
                                    onChange={() => handleProjectSelect(project)}
                                    checked={selectedProjectId === project.id}
                                />
                                {project.name}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            )}
            {stage > 2 && (
            <div>
                <h3>Select a date to analyze from:</h3>
                <input
                    type="date"
                    id="dateInput"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <button onClick={fetchChanges}>
                    {stage > 3 ? "Regenerate response" : "Get changes summary"}
                </button>
            </div>
             )}
            {stage > 3 && (
            <div className="summary">
                <h3> Changes summary. Feel free to regenreate it ⬆️</h3>
                {/* <h3>{changesSummary}</h3> */}
                <ReactMarkdown>{JSON.parse(changesSummary).main_result}</ReactMarkdown>
                <h3>Merge requests merged since selected date:</h3>
                {JSON.parse(changesSummary).merges.map(mr => (
                    <li>
                        Title: {mr.title}
                        {mr.description && (
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Description: {mr.description}</div>
                        )}
                    </li>
                ))}
                <div>
                </div>
            </div>
            )}
        </div>
    );
};

export default Repositories;
