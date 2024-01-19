import React, { useState } from 'react';
import './Repositories.css';

const Repositories = () => {
    const [gitlabUrl, setGitlabUrl] = useState('https://gitlab.com');
    const [accessToken, setAccessToken] = useState('glpat-wx3VU4svrvGmzvvN-sg-');
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState("2013-09-30T13:46:02Z");
    const [changesSummary, setChangesSummary] = useState("");

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
        setLoading(false);
    };

    const fetchChanges = async () => {
        console.log("fetching changes: ");
        setLoading(true);

        const data = {
            gitlab_url: gitlabUrl,
            private_token: accessToken,
            date: date,
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

        setLoading(false);
    }

    const handleProjectSelect = (project) => {
        setSelectedProjectId(project.id);
        setSelectedProjectName(project.name);
        fetchChanges();
    };

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <h1>Gitlab Updates Analyzer</h1>
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
            <h2>
                Select a project to analyze:
            </h2>
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
            <h2>
                Changes summary: {changesSummary}
            </h2>
        </div>
    );
};

export default Repositories;
