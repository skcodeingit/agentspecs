from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json
import os
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LOG_FILE_PATH = "C:/venkatavisit/REA-main/agent_logs.txt"  # path to your log file

async def log_streamer():
    """Continuously watch a log file and yield new lines as JSON."""
    # If file doesn’t exist, create it
    if not os.path.exists(LOG_FILE_PATH):
        open(LOG_FILE_PATH, 'w').close()

    # Open file and move to the end
    with open(LOG_FILE_PATH, "r") as f:
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if line:
                # Format each line as JSON
                data = {"line": line.strip()}
                yield f"data: {json.dumps(data)}\n\n"
            else:
                await asyncio.sleep(0.5)

@app.get("/stream-logs")
async def stream_logs():
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",  # VERY important
    }
    """SSE endpoint that streams log lines in real-time."""
    return StreamingResponse(log_streamer(), media_type="text/event-stream")

