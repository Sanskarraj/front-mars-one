// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client'; // Import io object from socket.io-client
import "./App.css"

const ENDPOINT = 'https://back-mars-one.onrender.com';



function App() {
    const [url, setUrl] = useState('');
    const [phases, setPhases] = useState([]);
    const [isExecutionCompleted, setIsExecutionCompleted] = useState(false);
    const [videoData, setVideoData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (indexData) => {
        const clientId = uuidv4();
        const socket = io(ENDPOINT, {
            query: { clientId, indexData },
        });


        // initiate downlaod code implementation which sends requests to backend download endpoint
        const initiateDownload = () => {
            setTimeout(() => {
                const downloadUrl = 'https://back-mars-one.onrender.com/download'; // Replace with actual download endpoint
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'large_file.zip'; // Change the filename if needed
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 4000); // 10 seconds delay
        };







        socket.on('phase_executed', ({ phase, indexData }) => {
            setPhases((prevPhases) => [...prevPhases, { phase, indexData }]);
        });

        socket.on('execution_completed', () => {
            setIsExecutionCompleted(true);
            socket.disconnect(); // Disconnect socket after execution completion
            initiateDownload();
        });


        setPhases([]);
        setIsExecutionCompleted(false);
        console.log("connection");
        socket.emit('start_execution', { message: url });
    };

    const fetchData = async () => {
        setVideoData(null);
        setIsLoading(true);
        try {
            const response = await axios.get(`https://back-mars-one.onrender.com/data?url=${url}`);
            setVideoData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    return (
        <div>
            <h1>YouTube Downloader</h1>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube URL"
            />
            <button onClick={fetchData} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Fetch Data'}
            </button>
            {videoData && (
                <div>
                    <h3>Video Information</h3>
                    <ul>
                        {videoData.map((item, index) => (
                            <button key={index} onClick={() => handleSubmit(index)}>
                                Format: {item.Format}, Size: {item.Size}, Quality: {item.Quality}, AV: {item.AV}
                            </button>
                        ))}
                    </ul>
                </div>
            )}
            {phases.length > 0 && !isExecutionCompleted && (
                <div>
                    <h3>Execution Phases:</h3>
                    <ul>
                        {phases.map((phase, index) => (
                            <li key={index}>{phase.phase}</li>
                        ))}
                    </ul>
                    <div>Loading...</div>
                </div>
            )}
            {isExecutionCompleted && (
                <div>
                    <h3>Execution Completed</h3>
                    {/* Add any completion message or action here */}
                </div>
            )}
        </div>
    );
}

export default App;
