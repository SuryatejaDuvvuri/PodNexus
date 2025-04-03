import whisperx
import sys
import json


def find_speaker(start, end, diarization_segments):
    for entry in diarization_segments:
        if entry["start"] <= start < entry["end"]:
            return entry["speaker"]
    return "UNKNOWN"


def transcribe(audio):
    model = whisperx.load_model("base", device="cpu", compute_type="int8")
    result = model.transcribe(audio)
    
    modified_model = whisperx.DiarizationPipeline(use_auth_token="",device="cpu")
    segments = modified_model(audio)
    
    diarization_segments = [
        {"start": seg["start"], "end": seg["end"], "speaker": seg["speaker"]}
        for seg in segments.to_dict(orient="records")
    ]
    
    
    language = result["language"]
    model_a, metadata = whisperx.load_align_model(language, device="cpu")
    result = whisperx.align(result["segments"], model_a, metadata, audio, device="cpu")
    
    speakers = set()
    
    for segment in result["segments"]:
        # speaker = segments.segment_to_speaker(segment["start"], segment["end"])
        speaker = find_speaker(segment["start"], segment["end"], diarization_segments)
        speakers.add(speaker)
        
        
    
    combined = []
    
    if(len(speakers) <= 1):
        for segment in result["segments"]:
            combined.append({
                "speaker": "SPEAKER_00",
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"]
            })
    else:
        for segment in result["segments"]:
            # speaker = segments.segment_to_speaker(segment["start"], segment["end"]) or "UNKNOWN"
            speaker = find_speaker(segment["start"], segment["end"], diarization_segments)
            
            combined.append({
                "speaker": speaker,
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"]
            })
    # for segment in result["segments"]:
    #     speaker = segments.segment_to_speaker(segment["start"], segment["end"])
    #     combined.append({
    #         "speaker": speaker,
    #         "start": segment["start"],
    #         "end": segment["end"],
    #         "text": segment["text"]
    #     })    

    print(json.dumps(combined))
    # return combined
    
if __name__ == "__main__":
    audio = sys.argv[1]
    transcribe(audio)