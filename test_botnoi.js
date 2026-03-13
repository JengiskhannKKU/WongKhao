import fetch from 'node-fetch';

const token = 'yqPC5gXvPFWVIfYYnRfYBfjuZ0cPGKcl'; // the one from the .env

async function test() {
  try {
    const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio_v2', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'botnoi-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'สวัสดีครับ',
        speaker: '8',
        volume: 1,
        speed: 1,
        type_media: 'mp3',
        save_file: 'True',
        language: 'th'
      })
    });
    
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", data);
  } catch (e) {
    console.error(e);
  }
}

test();
