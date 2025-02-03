import React, {useState, useRef} from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/icons/play";
import { PauseIcon } from "@/components/icons/pause";
import { SkipNextIcon } from "@/components/icons/skip-next";
import { SkipPreviousIcon } from "@/components/icons/skip-previous";
import { Slider } from "@/components/ui/slider";


function PodcastPlayer() {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    
    const handlePlayPause = () => {
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

    return (
        <div className="flex flex-col items-center justify-center">
            <audio
                ref={audioRef}
                src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                onTimeUpdate={handleTimeUpdate}
                onLoadedData={handleLoadedData}
            />
            <div className="flex items-center justify-center">
                <Button onClick={handleSkipBackward}>
                    <SkipPreviousIcon />
                </Button>
                <Button onClick={handlePlayPause}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <Button onClick={handleSkipForward}>
                    <SkipNextIcon />
                </Button>
            </div>
            <Slider
                value={currentTime}
                max={duration}
                onChange={handleSeek}
            />
        </div>
    );
}

export default function Player()
{
    const [youtubeLink, setYoutubeLink] = React.useState('https://www.youtube.com/watch?v=6JnGBs88sL0');



    return (
       <div className = "flex flex-col items-center justify-center">
           <Input
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter YouTube Link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
            />

            <Button onClick={() => console.log('Play')} className="w-full bg-blue-500 text-white py-2 rounded-lg">Play</Button>
       
       
          
       
        </div>
    );

}