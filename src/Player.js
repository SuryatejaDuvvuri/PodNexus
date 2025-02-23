import React, {useState, useRef} from 'react';
import { PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon} from '@radix-ui/react-icons';
import * as Slider from '@radix-ui/react-slider';


function PodcastPlayer() {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [youtubeLink, setYoutubeLink] = useState('');
    const [audio, setAudio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('')
    const audioRef = useRef(null);
    
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
                credentials: 'include',
                body: JSON.stringify({ youtubeUrl: youtubeLink })
            });

            if(response.ok)
            {
                const data = await response.text();
                const audioUrl =`http://localhost:8080${data.trim()}`;
                setAudio(audioUrl);
                // if(audioRef.current)
                // {
                //     audioRef.current.src = data;
                //     audioRef.current.load();
                //     audioRef.current.play();
                //     setIsPlaying(true);
                // }
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
        if (isPlaying) 
        {
            audioRef.current.pause();
        } else 
        {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = (e) => 
    {
        setCurrentTime(e.target.currentTime);
    }

    const handleLoadedData = (e) => 
    {
        setDuration(e.target.duration);
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
        return `${mins}:${secs.toString().padStart(2,'0')}`;    
    };

    return (
        // <div className="flex flex-col items-center justify-center">
        //     <audio
        //         ref={audioRef}
        //         src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        //         onTimeUpdate={handleTimeUpdate}
        //         onLoadedData={handleLoadedData}
        //     />
        //     <div className="flex items-center justify-center">
        //         <button className = "p-2 rounded-lg hover:bg-gray-200" onClick={handleSkipBackward}>
        //             <ChevronLeftIcon />
        //         </button>
        //         <button onClick={handlePlayPause}>
        //             {isPlaying ? <PauseIcon /> : <PlayIcon />}
        //         </button>
        //         <button onClick={handleSkipForward}>
        //             <ChevronRightIcon />
        //         </button>
        //     </div>
        //     <Slider
        //         value={currentTime}
        //         max={duration}
        //         onChange={handleSeek}
        //     />
        // </div>
        <div className = "w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className = "mb-4">
                <input
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter YouTube Link"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                />
            </div>
            <button disabled = {loading || !youtubeLink} onClick = {processAudio} className="w-full bg-blue-500 text-white py-2 rounded-lg">
                {loading ? 'Processing...' : 'Play'}
            </button>
            {error &&
                <p className = 'text-red-500 mt-2 text-sm'>
                    {error}
                </p>
            }
            {audio && (
        <div className="flex flex-col items-center justify-center space-y-4">
            <audio
                ref={audioRef}
                src={audio}
                onTimeUpdate={handleTimeUpdate}
                onLoadedData={handleLoadedData}
            />
            <div className="flex items-center justify-between text-sm text-gray-500">
                {/* <button className = "p-2 rounded-lg hover:bg-gray-200" onClick={handleSkipBackward}>
                    <ChevronLeftIcon />
                </button>
                <button onClick={handlePlayPause}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={handleSkipForward}>
                    <ChevronRightIcon />
                </button> */}
                <span>{format(currentTime)}</span>
                <span>{format(duration)}</span>
            </div>
            {/* <Slider
                value={currentTime}
                max={duration}
                onChange={handleSeek}
            /> */}
            <Slider.Root
            className="relative flex items-center w-full h-5"
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}>
                <Slider.Track className="relative h-1 w-full bg-gray-200 rounded-full">
                <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb
                className="block w-3 h-3 bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Volume"
                />
          </Slider.Root>
          <div className="flex items-center justify-center space-x-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleSkipBackward}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleSkipForward}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        )}
         <audio controls>
             <source src="http://localhost:8080/api/audio/One.mp3" type="audio/mpeg" />
          </audio>
        </div>
    );
}


export default PodcastPlayer;