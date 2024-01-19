import React, { useState } from 'react';
import './Repositories.css';

const Repositories = () => {
    const [gitlabUrl, setGitlabUrl] = useState('https://gitlab.com');
    const [accessToken, setAccessToken] = useState('glpat-wx3VU4svrvGmzvvN-sg-');
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [loading, setLoading] = useState(false);

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
        setLoading(false)
    };

    const handleProjectSelect = (project) => {
        setSelectedProjectId(project.id);
        setSelectedProjectName(project.name);
    };

    return (
        <div>
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
                Selected project: {selectedProjectName}
            </h2>
        </div>
    );
};

export default Repositories;
