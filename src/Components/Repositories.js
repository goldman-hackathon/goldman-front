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
    const [ownPrompt, setOwnPrompt] = useState("");
    const [questionResonse, setQuestionResponse] = useState("")
    const [selectedGif, setSelectedGif] = useState('/on-tap-beer.gif');
    const [showGifOptions, setShowGifOptions] = useState(false);
    const gifOptions = [
        '/on-tap-beer.gif',
        '/loading.gif',
        '/never-gonna.gif',
        '/fortnite-dance-fortnite.gif',
        '/beer.gif',
        '/polish-dancing-cow-dancing.gif'
    ];

    const selectGif = (gifUrl) => {
        setSelectedGif(gifUrl);
        setShowGifOptions(false);
    };

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
    // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const fetchChanges = async () => {
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
            // await sleep(90000); // Sleep for 2000 milliseconds (2 seconds)
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

    const askQuestion = async () => {
        setLoading(true);
        const formattedDate = new Date(date).toISOString();

        const data = {
            prompt: ownPrompt,
            context: changesSummary
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/ask_question', {
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
            setQuestionResponse(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        setStage(5);
        setLoading(false);
    }

    const handleProjectSelect = (project) => {
        setSelectedProjectId(project.id);
        setStage(3);
    };

    return (
        <div className="app-container">
            <div className="gif-selector">
                <button onClick={() => setShowGifOptions(!showGifOptions)}>Select GIF</button>
                {showGifOptions && (
                    <ul>
                        {gifOptions.map((gif, index) => (
                            <li style={{ width: '8%' }} key={index} onClick={() => selectGif(gif)}>
                                <img src={gif} alt={`GIF ${index + 1}`} width="100" />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner" style={{ background: `url(${selectedGif}) no-repeat center center` }}></div>
                </div>
            )}
            <header>
                <h1>GitLab Updates Analyzer</h1>
                <h2>Track repository changes from a specific date.</h2>
            </header>
            <main>
                {stage === 1 && (
                    <div className="input-section">
                        <h3>Please provide your GitLab URL and access token:</h3>
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
                )}
                {stage > 1 && (
                    <div className="project-selection">
                        <h3>Select a project to analyze:</h3>
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
                    <div className="date-selection">
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
                        {changesSummary && JSON.parse(changesSummary).merges.length > 0 ? (
                            <div>
                                <h2>Changes summary. Feel free to regenerate it ⬆️</h2>
                                <ReactMarkdown>{JSON.parse(changesSummary).main_result}</ReactMarkdown>
                                <h2>Merge requests merged since selected date:</h2>
                                <ReactMarkdown>
                                    {JSON.parse(changesSummary).merges.map(mr => (
                                        `### Title: ${mr.title}\n\n` +
                                        `${mr.description ? `**Description:** ${mr.description}\n\n` : ''}` +
                                        `${mr.report ? `**Report:** ${mr.report}\n\n` : ''}`
                                    )).join('')}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div>
                                <h3>No merge requests merged since selected date</h3>
                            </div>
                        )}
                        <h2>Now you can ask the AI some questions about the changes yourself</h2>
                        <input
                            className="text2"
                            type="text"
                            value={ownPrompt}
                            onChange={(e) => setOwnPrompt(e.target.value)}
                            placeholder="Insert your own prompt"
                            style={{ width: '85%' }}
                        />
                        <button onClick={askQuestion}>askQuestion</button>
                    </div>
                )}
                {stage > 4 && (
                    <div className="questiionReponse">
                        <h3>AI's reponse: </h3>
                        <ReactMarkdown>{questionResonse.main_result}</ReactMarkdown>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Repositories;
