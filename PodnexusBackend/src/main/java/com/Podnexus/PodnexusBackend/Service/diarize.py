import whisperx
import sys
import json

def transcribe(audio):
    model = whisperx.load_model("base", device="cpu")
    result = model.transcribe(audio)
    
    modified_model = whisperx.DiarizationPipeline()
    segments = modified_model(audio)
    
    result = whisperx.align(
        result["segments"], model.language, audio, device="cpu"
    )
    
    combined = []
    for segment in result["segments"]:
        speaker = segments.segment_to_speaker(segment["start"], segment["end"])
        combined.append({
            "speaker": speaker,
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"]
        })    
    print(json.dumps(combined, indent=2))
    
if __name__ == "__main__":
    audio = sys.argv[1]
    transcribe(audio)