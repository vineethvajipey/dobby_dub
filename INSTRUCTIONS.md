# Dobby Dub – Product Requirements Document (PRD)

## 1. Project Overview

**Dobby Dub** is a web application that:
1. Lets users upload a video (within a certain size limit, e.g. 200–500 MB)
2. Transcribes the video in the background (via Whisper or an equivalent)
3. Summarizes the video context (provided by the user)
4. Uses a Large Language Model (LLM) called **"Dobby"** to generate commentary/reactions based on the video transcript and the user's summary/context
5. Converts the generated text commentary to speech (using Eleven Labs or Coqui TTS)
6. Merges or layers the commentary audio track onto the original video (via MoviePy or equivalent)
7. Automatically generates captions for the new commentary
8. Lets the user preview the final dubbed video and download or share it

The primary end goal is to automate the creation of short "reaction-style" commentary for user-uploaded videos with minimal manual steps.

## 2. Core Functionalities

### Video Upload & Summary Form
- **UI**: A simple upload form for the user to select a video file
- **User Input**: A short text summary or context describing the video  
- **Constraints**: Max file size (e.g., 200–500 MB). Possibly show an error for oversized files

### Automatic Video Transcription
- **Process**:
  - After the upload, the video is sent to a transcription service (e.g., OpenAI Whisper)
  - The resulting transcript is stored and becomes part of the LLM context
- **Status Indicator**: Show "Transcribing..." while waiting

### LLM-Based Commentary Generation
- **Data Flow**:
  - The transcript + user-provided summary is combined into a prompt for the LLM (codenamed "Dobby")
- **LLM**:
  - Use Vercel Fireworks API with the "Dobby" model to generate a short, humorous or insightful commentary  
  - Example API call:
  ```python
  import requests

  api_key = "fw_3ZjtsywUGddwa1wGY4VvB3eW"
  url = "https://api.fireworks.ai/inference/v1/chat/completions"

  data = {
      "model": "accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b#accounts/sentientfoundation/deployments/81e155fc",
      "messages": [
          {
              "role": "user",
              "content": "<TRANSCRIPT + SUMMARY>"
          }
      ]
  }

  headers = {
      "Authorization": f"Bearer {api_key}",
      "Content-Type": "application/json"
  }

  response = requests.post(url, json=data, headers=headers)
  dobby_output = response.json()['choices'][0]['message']['content']
  ```
- **Status Indicator**: Show "Generating commentary..." while the system is waiting for the LLM response

### Audio Generation (TTS)
- **Process**: Convert the LLM-generated text commentary to an MP3 or WAV file using Eleven Labs or Coqui TTS
- **Example** (Eleven Labs):
  ```python
  import sys
  from elevenlabs.client import ElevenLabs

  # input_text = "<DOBBY_GENERATED_TEXT>"
  client = ElevenLabs()
  audio = client.text_to_speech.convert(
      text=input_text,
      voice_id="52d3CDIZuiBA0XXTytxR",
      model_id="eleven_multilingual_v2",
      output_format="mp3_44100_128",
  )

  audio_data = b"".join(audio)
  with open("output.mp3", "wb") as file:
      file.write(audio_data)
  ```

### Video Dubbing (Merging Audio)
- **Process**:
  - Use MoviePy (or a similar library) to overlay or replace the original audio track in the uploaded video with the generated commentary track
- **Mixed Audio** (optional):
  - Let the original audio play softly in the background and overlay the TTS commentary
- **Example** (Replacing audio):
  ```python
  from moviepy.editor import VideoFileClip, AudioFileClip

  video_path = "examples/sama_vs_elon_1/sama_vs_elon_og.mp4"
  audio_path = "examples/sama_vs_elon_1/sama_vs_elon_audio.mp3"

  clip = VideoFileClip(video_path).subclip(0, 30)    # optional subclip
  dobby_audio = AudioFileClip(audio_path)
  clip.audio = dobby_audio
  clip.write_videofile("result.mp4")
  ```

### Automatic Captions
- **Implementation**:
  - Generate subtitles (SRT/VTT) from the commentary text or from the original transcription
  - Integrate them into the final video or provide them as a downloadable file

### Video Preview & Download
- **Front-end**:
  - Once the new video is generated, let the user preview it with a video player in the browser
  - Provide a download button or share link for the final video (depending on file hosting constraints)

### Usage & Processing Status
- **Real-Time Notifications**:
  - Provide status updates: "Transcribing...," "Generating commentary...," "Creating final video..."
- **Email or In-app**:
  - Optional email notifications when the video is ready, or rely on in-app progress indicators

### Authentication & Rate Limiting
- **Purpose**: Control usage of LLM and TTS credits
- **Implementation**:
  - Restrict usage to registered or logged-in users only
  - Place daily/monthly quotas per user to limit TTS/LLM calls

## 3. Non-Functional Requirements

### Performance
- Must handle video uploads up to 500 MB
- Must complete typical short video processing (1–5 minutes of content) in under a few minutes (depending on concurrency and service limits)

### Scalability
- Should handle multiple concurrent requests, while ensuring we do not exceed external API usage limits (Fireworks LLM, TTS)

### Security
- Securely store any user data, transcripts, or final videos
- Ensure no malicious code can be uploaded (e.g., verifying file types)

### Reliability
- Should handle partial failures gracefully (e.g., if LLM call fails, inform the user and allow re-try)

## 4. Implementation Outline

### Front-End Flow
1. **User** visits the main page (`/`):
   - Sees a form to upload video + enter summary
2. **On Submit**:
   - The video and summary are sent to the `/api/dub` backend route
   - The front-end displays a status or progress indicator (e.g., "Uploading video...")
3. **During Processing**:
   - The route transcribes the video, calls the LLM, performs TTS, merges audio → final video
   - The front-end polls for status or waits for a response
4. **Completion**:
   - The user receives a link or immediate file download/preview
   - They can watch the new video in a `<video>` player on the same page or download it

### Back-End Flow (`/api/dub` route)
1. **Receive** the uploaded video & summary from the request
2. **Transcribe** the video using OpenAI Whisper (or a third-party transcription service)
3. **Prompt** the Fireworks LLM with the combined transcript & user summary
4. **Generate** commentary audio (TTS)
5. **Merge** new audio with the original video using MoviePy
6. **Generate** subtitles for the commentary
7. **Return** a response containing:
   - The final video file path or download URL
   - The subtitles file (if separate)

## 5. Current "Example" Code & Usage Context

### Vercel Fireworks LLM API call
```python
import requests

api_key = "fw_3ZjtsywUGddwa1wGY4VvB3eW"
url = "https://api.fireworks.ai/inference/v1/chat/completions"

data = {
    "model": "accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b#accounts/sentientfoundation/deployments/81e155fc",
    "messages": [
        {
            "role": "user",
            "content": "<TRANSCRIPT AND/OR SUMMARY>"
        }
    ]
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=data, headers=headers)
dobby_output = response.json()['choices'][0]['message']['content']
print("Dobby says:", dobby_output)
```

### Eleven Labs TTS
```python
import sys
from elevenlabs.client import ElevenLabs

# input_text = "<TEXT FROM DOBBY>"
client = ElevenLabs()
audio = client.text_to_speech.convert(
    text=input_text,
    voice_id="52d3CDIZuiBA0XXTytxR",
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128",
)

# Collect audio data from generator
audio_data = b"".join(audio)

# Save to file
with open("output.mp3", "wb") as file:
    file.write(audio_data)
```

### Add Audio to Video (MoviePy)
```python
from moviepy.editor import VideoFileClip, AudioFileClip

video_path = "examples/sama_vs_elon_1/sama_vs_elon_og.mp4"
audio_path = "examples/sama_vs_elon_1/sama_vs_elon_audio.mp3"

clip = VideoFileClip(video_path).subclip(0, 30)  # optional
dobby_audio = AudioFileClip(audio_path)
clip.audio = dobby_audio
clip.write_videofile("result.mp4")
```

## 6. Recommended File Structure

Below is a **minimal** but logical **Next.js 14 (app router)** structure. The goal is to keep files to a minimum while keeping code organized:

```
.
├── README.md
├── .env                  // For API keys & environment configs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── ... (images, logos, etc.)
└── src/
    ├── app/
    │   ├── layout.tsx           // Global layout for the Next.js app
    │   ├── page.tsx            // Main landing page (can contain VideoForm)
    │   └── api/
    │       └── dub/
    │           └── route.ts    // Single API route to handle:
    │                           //  - File upload/transcription
    │                           //  - LLM call
    │                           //  - TTS
    │                           //  - Merging audio into the video
    ├── components/
    │   └── VideoForm.tsx       // React component: upload input + summary + triggers API
    └── lib/
        └── services.ts         // "Backend" helpers (call LLM, TTS, transcription, etc.)
```

- **`layout.tsx`**: Defines the shared UI scaffolding (navigation, footers, etc.)
- **`page.tsx`**: Main landing page. Could show the `VideoForm`
- **`/api/dub/route.ts`**: The entire server-side logic for uploading, transcribing, calling LLM, TTS, merging audio, returning final result
- **`VideoForm.tsx`**: A single form component for handling the user upload & summary input, plus the logic to call our `/api/dub` route
- **`services.ts`**: Helper functions for:
  - Transcription (OpenAI Whisper or any other service)
  - LLM call to Fireworks API
  - TTS call to Eleven Labs or Coqui TTS
  - Merging audio with MoviePy or a Python script

As the codebase grows, you can split `services.ts` into multiple files if needed, but this skeleton is ideal for early development.

## 7. Phased Development Plan

### Phase 1: MVP
- Implement front-end form for file upload + summary
- Single Next.js API route (`/api/dub`) that:
  1. Receives the file & text summary
  2. Calls a placeholder or basic transcription step
  3. Skips or stubs out advanced features (like TTS)
- Returns a simple response (e.g., "Commentary: <LLM stub>")

### Phase 2: Full Implementation
- Integrate real transcription (e.g., Whisper)
- Integrate LLM calls (Fireworks API)
- Integrate TTS (Eleven Labs or Coqui)
- Merge audio with MoviePy and generate final video
- Include basic status updates in the UI

### Phase 3: Enhancements
- Automatic captions (SRT or VTT)
- Mixed-audio mode (original + commentary)
- In-app notification or email when video is ready
- Authentication & usage limits

## 8. Acceptance Criteria

1. **Upload**: User must be able to upload videos up to 500 MB without errors
2. **Transcription**: The system must generate an accurate transcript for 80%–90% of typical English content
3. **Commentary**: The generated commentary must be relevant to both the transcript and user's summary; length should be short enough to fit typical "reaction-style" content
4. **TTS**: Audio must be clear and properly timed to match the final video length
5. **Output**: The final video must be playable in standard video players; the user can download it
6. **Performance**: Processing (for a ~1–5 minute clip) should complete in under ~3–5 minutes (depending on concurrency)

## 9. Additional Notes & Constraints

- **Video Length**: For longer videos, consider timeouts or partial "highlight-based commentary." The MVP could limit uploads to short-form content (under 5–10 minutes)
- **Open-Source TTS**: If Eleven Labs is unavailable or cost-prohibitive, Coqui TTS offers an open-source approach (with trade-offs in voice quality)
- **MoviePy**: Typically runs on Python. Plan how Next.js will call Python scripts or containerize the environment. Alternatively, explore Node-based solutions or serverless workflow orchestrations if you prefer pure JS

## Summary

This PRD details the **Dobby Dub** system from end to end:
- **Core idea**: Upload → Transcribe → LLM Reaction → TTS → Merge → Final Video + Captions
- **API/Examples**: Provided code snippets for Fireworks LLM, Eleven Labs TTS, and MoviePy
- **Implementation**: Minimal file structure in Next.js 14, with a single route for all "dub" operations, plus a single form component and a `services` helper
- **Phases**: Start with an MVP, then expand features as code matures
- **Acceptance Criteria**: Key checks on functionality, performance, and reliability

This document should offer clear alignment and context to developers, ensuring the final deliverable meets the outlined requirements.