export const generateBotnoiAudio = async (text, options = {}) => {
  const token = import.meta.env.VITE_BOTNOI_TOKEN;
  if (!token) {
    throw new Error('Botnoi token is missing');
  }

  const defaultOptions = {
    speaker: '8', // Adjust speaker as needed
    volume: 1,
    speed: 1,
    type_media: 'mp3',
    save_file: 'True',
    language: 'th'
  };

  const body = {
    text,
    ...defaultOptions,
    ...options
  };

  try {
    const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio_v2', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'botnoi-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate audio');
    }

    const data = await response.json();
    return data; // Usually contains { audio_url: "..." }
  } catch (error) {
    console.error('Error in generateBotnoiAudio:', error);
    throw error;
  }
};
