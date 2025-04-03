import React, {useState, useRef, useEffect} from 'react';
import { PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon} from '@radix-ui/react-icons';
import * as Slider from '@radix-ui/react-slider';


function PodcastPlayer() {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState([]);
    const [youtubeLink, setYoutubeLink] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [podcastTranscript, setPodcastTranscript] = useState(null);
    const [audio, setAudio] = useState('');
    const [audioRecorder, setAudioRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const [isRecorded, setIsRecorded] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('')
    const audioRef = useRef(null);

    const toggleRecording = async () => {
        if(recording)
        {
            audioRecorder.stop();
           
            setRecording(false);
        }
        else
        {
            try
            {
                const stream = await navigator.mediaDevices.getUserMedia({audio:true});
                const recorder = new MediaRecorder(stream);
                const parts = [];


                recorder.ondataavailable = (e) => {
                    parts.push(e.data);
                };

                recorder.onstop = async () => {
                    
                    try
                    {
                        const blob = new Blob(parts,{type: 'audio/webm;codecs=opus'});
                        console.log(blob);
                        const link = URL.createObjectURL(blob);
                        setIsRecorded(link);
                        
                        const formData = new FormData();
                        formData.append('file', blob, 'recording.webm');
                        if (audioRef.current) 
                        {
                            formData.append('timestamp', format(audioRef.current.currentTime));
                        }

                       
                        const response = await fetch('http://localhost:8080/api/analyzeAudio', {
                            method: 'POST',
                          
                            headers: {
                                'Accept': 'application/json'
                            },
                            credentials: 'include',
                            body: formData
                        });
            
                        if(response.ok)
                        {
                            const data = await response.json();
                            console.log(data);
                            
                            if(data.response && data.script) {
                                const audioUrl = `http://localhost:8080/api/audio/${data.response.trim()}`;
                                setAiResponse(audioUrl);

                                const audio = new Audio(audioUrl);
                                audio.onerror = (e) => {
                                    console.error("Error loading audio", e);
                                    setError('Audio format not supported or file not found.');
                                };
                                audio.oncanplaythrough = () => {
                                    audio.play().catch(err => {
                                        console.error("Error playing audio", err);
                                        setError('Audio could not be played. Please try again.');
                                    });
                                };
                            }

                            setTranscript(prev => [...prev, { type: 'user', text: 'You asked a question at ' + format(audioRef.current.currentTime) },
                                { type: 'ai', text: data.script }]);

                        }
                        else
                        {
                            console.error('Audio could not be played');
                        }
                    }
                    catch(err)
                    {
                        console.error("Error sending audio", err);
                        setError('Audio could not be sent. Please try again.');
                    }
                }

                recorder.start();
                setAudioRecorder(recorder);
                setRecording(true);

               
                
            }
            catch(err)
            {
                console.err("Microphone cannot be accessed",err);
            }
        }
    }


    
    const processAudio = async () => {
        try
        {
            setLoading(false);
            setError('');

            const response = await fetch ('http://localhost:8080/api/processAudio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ youtubeUrl: youtubeLink })
            });

            if(response.ok)
            {
                const data = await response.json();

                const audioUrl =`http://localhost:8080${data.audioPath}`;
                setAudio(audioUrl);

                if(data.transcript)
                {
                    const cleanTranscript = data.transcript
                    .replace(/\[\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}\]\s*/g, '')
                    .trim();
                    setPodcastTranscript(cleanTranscript);
                    console.log(data.transcript);
                }

                if(audioRef.current)
                {
                    audioRef.current.src = audioUrl;
                    await audioRef.current.load();
                }
            }
            else
            {
                const errorData = await response.text();
                throw new Error(errorData);
            }

        }
        catch(err)
        {
            setError('Youtube Link could not be processed. Please try again.')
            console.error(err);
        }
        finally
        {
            setLoading(false);
        }
    };

    const handlePlayPause = () => 
    {

       if(!audioRef.current)
         {
            console.error("Audio element is not available.");
            return;
        }
       
        if (isPlaying) 
        {
            audioRef.current.pause();
            setIsPlaying(false);

        } 
        else 
        {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = (e) => 
    {
        setCurrentTime(e.target.currentTime);
    }

    const handleLoadedData = (e) => 
    {
        setDuration(e.target.duration);

        if(audioRef.current && !isPlaying)
        {
            audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => {
                console.error("Could not be played.");
            });
        }
    }

    const handleSkipForward = () => 
    {
        audioRef.current.currentTime += 10;
    }

    const handleSkipBackward = () => 
    {
        audioRef.current.currentTime -= 10;
    }

    const handleSeek = (value) => 
    {
        audioRef.current.currentTime = value;
    }

    const format = (time) => 
    {
        const mins = Math.floor(time/60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;    
    };

    

    return (
        <div className="min h-screen mx-auto p-6 bg-gradient-to-br from-emerald-200 to-lime-200 rounded-lg shadow-lg">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1  bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 text-emerald-800">AI Response</h3>
                        <div className="bg-gray-100 rounded-lg p-4 h-[600px] overflow-y-auto">
                        {transcript.length > 0 && transcript.map((item, index) => {
                            return (
                                <div key={index} className="text-sm font-medium mr-2">
                                    <span className="text-gray-500 text-sm mr-2">{format(index*3)}</span>
                                    <span className="text-gray-700">{item.text}</span>
                                </div>
                            );
                        })}

                        </div>
                    
                        
                    </div>

                <div className="col-span-1 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col gap-4">
   
                        <input
                            className="w-full p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder="Enter YouTube Link"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                        />


                        <button 
                            disabled={loading || !youtubeLink} 
                            onClick={processAudio} 
                            className="w-full py-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Play'}
                        </button>


                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}


                        {audio && (
                            <div className="space-y-4">
                                <audio
                                    ref={audioRef}
                                    src={audio}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedData={handleLoadedData}
                                />
                                
                                <div className="flex justify-center text-sm text-gray-600">
                                    <span>{format(currentTime)}</span>
                                    <span className="mx-2">/</span>
                                    <span>{format(duration)}</span>
                                </div>

 
                                <Slider.Root
                                    className="relative flex items-center w-full h-5"
                                    value={[currentTime]}
                                    max={duration}
                                    step={1}
                                    onValueChange={handleSeek}
                                >
                                    <Slider.Track className="relative h-1 w-full bg-gray-200 rounded-full">
                                        <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
                                    </Slider.Track>
                                    <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </Slider.Root>

                                <div className="flex justify-center items-center gap-4">
                                    <button className="p-2 hover:bg-gray-100 rounded-full" onClick={handleSkipBackward}>
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600" onClick={handlePlayPause}>
                                        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full" onClick={handleSkipForward}>
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={toggleRecording}
                            className={`w-full py-3 rounded-lg text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {recording ? 'Stop Recording' : 'Start Recording'}
                        </button>

                        {isRecorded && (
                            <audio controls src={isRecorded} className="w-full" />
                        )}


                        {aiResponse && (
                            <div className="space-y-2">
                                <h3 className="font-medium">AI Response:</h3>
                                <audio 
                                    controls 
                                    src="http://localhost:8080/api/audio/output.mp3"
                                    className="w-full"
                                    autoPlay
                                    onError={(e) => {
                                        console.error('Audio player error:', e);
                                        setError('Failed to load audio response');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-span-1 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-800">Podcast Transcript</h3>
                    <div className="bg-gray-100 rounded-lg p-4 h-[600px] overflow-y-auto">
                    {podcastTranscript && podcastTranscript.split('\n').map((line, index) => {
       
                        return (
                            <div key={index} className="mb-2">
                                <span className="text-gray-500 text-sm mr-2">{format(index*3)}</span>
                                <span className="text-gray-700">{line}</span>
                            </div>
                        );
                    })}

                    </div>
                   
                    
                </div>
            </div>

            
        </div>
    );
}


export default PodcastPlayer;