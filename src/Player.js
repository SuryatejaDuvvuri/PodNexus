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

    // const sendAudio = async () => {
    //     setLoading(true);
    //     try
    //     {
    //         if(!isRecorded)
    //         {
    //             console.error("No audio recorded");
    //             return;
    //         }
    //         const answer = await fetch(isRecorded);
    //         const audioBlob = await answer.blob();
    //         const formData = new FormData();
    //         formData.append('file', audioBlob, 'audio.webm');
    //         if (audioRef.current) 
    //         {
    //             formData.append('timestamp', format(audioRef.current.currentTime));
    //         }
    //         const response =await fetch('http://localhost:8080/api/analyzeAudio', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if(response.ok)
    //         {
    //             const data = await response.json();
    //             console.log("Transcript:", data.script);
    //             console.log("AI Response:", data.response);
    //             // aiResponse.play();
    //         }
    //         else
    //         {
    //             console.error('Audio could not be played');
    //         }
    //     }
    //     catch(err)
    //     {
    //         console.error(err);
    //     }
    //     finally
    //     {
    //         setLoading(false);
    //         setIsRecorded(null);
    //     }

    // }

    
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
    
        <div className = "w-screen max-w-6xl p-6 bg-white rounded-lg shadow-lg flex justify-between items-start">
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
            <div className="flex items-center justify-center text-sm text-gray-500">
               
                <div className="flex items-center justify-center text-sm text-gray-500">
                    <span className="mr-2">{format(currentTime)}</span> 
                    <span>{format(duration)}</span>
                </div>
            </div>
          
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
    
        <source src="http://localhost:8080/api/audio/One.mp3" type="audio/mpeg" />

        <div className="mt-6 space-y-2">
            <button
                onClick={toggleRecording}
                className={`w-full py-2 rounded-lg ${recording ? 'bg-red-500' : 'bg-green-500'} text-white`}
            >
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {isRecorded && (
                <audio controls src={isRecorded} className="w-full mt-2" />
            )}
            {aiResponse && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">AI Response:</h3>
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



        {/* {transcript.length > 0 && (
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Transcript:</h3>
                <div className="space-y-2">
                    {transcript.map((item, index) => (
                        <div key={index} className={`p-4 rounded-lg ${item.type === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'}`}>
                            <p className="whitespace-pre-wrap">{item.text}</p> 
                        </div>
                    ))}
                </div>
            </div>
        )} */}
        <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">AI Response</h3>
                <div className="space-y-2">
                <div className = "p-4 rounded-lg bg-gray-200 text-gray-700">
                            <p className="whitespace-pre-wrap">So, great question about rest between sets! You know, I was just getting into that topic a little while ago, and I think it's really important to understand the concept of recovery time.

For resistance training, like weightlifting or bodyweight exercises, your body needs time to recover from the physical stress you're putting on it. This is where the idea of EPOC comes in - excess post-exercise oxygen consumption. Essentially, when you exercise, you're creating micro-tears in your muscles, and your body needs time to repair them.

Now, the length of recovery time can vary depending on several factors, such as the intensity and duration of your workout, as well as your individual fitness level. However, a general rule of thumb is to aim for 60-90 seconds of rest between sets.

So, if you're doing a set of 10 reps, take 60-90 seconds to recover before moving on to the next set. This allows your muscles to recover from the physical stress of the previous set, and then you can go back and do another set at maximum intensity.

Now, some people might say, "But what about if I'm doing high-intensity interval training?" Well, in that case, you'll want to adjust your rest time accordingly. For HIIT, you'll typically want to aim for 30-60 seconds of rest between sets.

And then there's the concept of recovery periods - these are longer periods of time where you're not exercising at all. This is where your body can fully recover from the physical stress of exercise, and rebuild muscle tissue. For example, if you're doing a workout in the morning, you might want to take an hour or two to rest before doing another workout.

So, to summarize: rest between sets should be around 60-90 seconds for most exercises, but can vary depending on the intensity and duration of your workout. And don't forget about recovery periods - these are just as important as exercise itself when it comes to building muscle and improving overall fitness.

Thanks for asking that question! Do you have any others?</p> 
                        </div>
                </div>
            </div>



        {/* {podcastTranscript && (
            <div className="w-1/2 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Podcast Transcript:</h3>
                <div className="space-y-2">
                    {podcastTranscript.split('\n').map((line, index)  => (
                    <div key={index} className="p-4 rounded-lg bg-gray-200 text-gray-700">
                            <p className="whitespace-pre-wrap">{line}</p> 
                        </div>
                    ))}
                </div>
            </div>
        )} */}
         <div className="w-1/2 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Podcast Transcript</h3>
                <div className = "p-4 rounded-lg bg-gray-200 text-gray-700">
                            <p className="whitespace-pre-wrap">The question I often get is how long should I try to focus?
Well, the research literature point to the key importance of so-called ultradian cycles.
You've all probably heard of circadian cycles or circadian biology.
Circa the day circadian is about 24 hour cycle.
Well, our brain and body operate within that day or within each and every day, I should
say, with 90 minute ultradian cycles.
So my suggestion would be any time you're going to sit down and try and focus, you're
going to try and do a focused bout of physical exercise or skill learning or musical learning,
or maybe you're even just having a conversation.
Maybe you're a therapist or you're attending therapy or a class.
How long should it be?
And the ideal duration is about 90 minutes, not exactly 90 minutes, but we can reliably
say 90 minutes or less.
Okay, it doesn't have to be the full 90 minutes, but trying to push yourself to be able to
drop into two hours of focus or three hours of focus while possible is not really inline
with what we know about the underlying biology.
Everything from our sleep states or the different stages of sleep and our waking states is divided
into these 90 minute cycles or so called ultradian cycles.
So what I like to do is set a timer for 90 minutes.
I acknowledge and accept the fact that under most conditions, unless I'm really pressed
for a deadline and I'm optimally caffeinated, et cetera, the first five to 10 minutes of
that 90 minutes are a transition time.
It's like the warm up for focus, but I do include it in that 90 minutes.
And then I really try and drop into doing focused mental work or learning of some sort.
Again, this could be physical as well, motor skill learning or I think we're running or
lifting weights, et cetera, and really try and drop into that across the full 90 minutes.
Again, accepting the fact, okay, it's not just an idea.
The fact that occasionally our focus will flicker.
It will jump out of focus and then a big part of being able to focus is to go back to focusing.
The way I'd like you to conceptualize this perhaps is that arrowhead suddenly getting
very, very broad that you're focusing on many things or that arrow shifts to a different
location in the room.
The key is to be able to shift it back and to narrow it once again.
And that's an active process so much so that it requires a lot of metabolic energy.
Your brain is the chief consumer of metabolic energy.
The calories that you consume is so called basal metabolic rate.
Most of that isn't related to movement or heartbeat or breathing.
It's related to brain function.
Your brain is a glutton with respect to caloric need.
So understand that at the end of 90 minutes or maybe even after 45 minutes, you might feel
rather tired or even exhausted.
And it's very important that after about a focus that you take at least 10 minutes and
ideally as long as 30 minutes and go through what I call deliberate defocus.
You really want to focus on somewhat menial tasks or things that really don't require
a ton of your concentration.
This is starting to become a little bit of a movement out there in the kind of pop psychology
and optimization world.
This idea of not looking at your phone as you walk down the hall to the bathroom, certainly
not looking at your phone in the bathroom.
And I should mention, by the way, this is a particular annoyance of mine.
Have you noticed that weight times for restrooms and public places has increased substantially
in the last 10 years?
The reason for that is not digestive, okay?
It's not the gut microbiome, I mean, it might be the gut microbiome.
But chances are it's because people are on their phones in the bathroom.
So you're doing yourself and everybody else a favor by staying off your phone in the
restrooms, staying off your phone while walking down the hall, try and give yourself some
time to deliberately decompress, to let your mental state's idle, to not be focused on
any one thing.
That period of idling is essential for your ability to focus much in the same way that
rest between sets of resistance training or rest between exercise is vital to being able
to focus and perform during the actual sets or during the actual bouts of running or
recycling or whatever your particular form of exercise might be.
So deliberate decompression is key.
And I know this is hard because we're all being drawn in by the incredible rich array of sensory
information available on our phones and other devices.
But I can't emphasize this enough.
Our ability to focus is not just related to what happens during the entry and movement
through those focus bouts, but after those focus bouts, we really need to deliberately
decompress.
And of course, the ultimate decompress, the time in which we are not directing our thinking
and our action is during sleep.
And so it's no wonder, or I should say it holds together logically that that deep, long
lasting duration of not controlling where our mind is at, is in fact the ultimate form
of restoration, even if we have very intense dreams.
So take that period after each 90 minute or less focus about, right?
Remember those focus bouts don't have to be full 90 minutes.
Let's see, you do 45 minutes of work, you're just done with it, set it down and go do
something for maybe five, 10, maybe even 30 minutes that is functional for your day,
right?
Just not just walking around in circles or staring up the sky, although if you can do that,
do that.
But most of us have other things to do, but do things that are rather automatic or reflexive
for you and try not to do any focused reading, try not to bring your vision into a tight
location such as your phone and try and deliberately decompress because that will allow you to drop
into intense spouts of focus, again, repeatedly or repeatedly throughout the day.
</p> 
                </div>
        </div>
 

           

        </div>
    );
}


export default PodcastPlayer;