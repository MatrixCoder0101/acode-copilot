const completion = async (prefix: string, suffix: string, language: string) => {
   const response = await fetch('https://goutam.is-a.dev/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        type: "text-generation",
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: `You are a ${ language ? language + " " : "" }programmer that replaces <FILL_ME> part with the right code. Only output the code that replaces <FILL_ME> part. Do not add any explanation or markdown.` },
            { role: "user", content: `${prefix}<FILL_ME>${suffix}` },
          ]
      })
    });
   const prediction = await response.json()
   return prediction?.content;
}

export default completion;