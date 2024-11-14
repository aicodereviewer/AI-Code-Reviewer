const theKey = "ћѓЕјњїђЕѢѝѡѢѝЕжЙИючпЩЭїднљяЩјѢѐгњѡжЭОѝяЙПчсѢачнсэЯЮОоёСНзОПюнбѠЩМЕчѕяззяМЬєѢмпазЮЙмЛЪєъѓЮвщбќоѝЯгеЪЭОмЮЩтЩПќпКЛОіЮёађПдќРжЩнчљЯлжСЕчЯёќЬќъргьзџаеѝайљЮѠбоЬёћйЪбіњѐћЩ";

function decryptKey(theKey) {
    return theKey
        .split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) - 1000))
        .join('');
}

const apiKey = decryptKey(theKey);

async function getChatGPTResponse(prompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        // Extract detailed error information
        const errorData = await response.json();
        throw new Error(
            `Error ${response.status}: ${response.statusText}\n` +
            `Message: ${errorData.error?.message || "No detailed error message provided."}`
        );
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return alert("Please enter a prompt.");

    const chatResponse = document.getElementById("chat-response");
    chatResponse.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;
    document.getElementById("user-input").value = "";

    chatResponse.innerHTML += "<div><em>ChatGPT is typing...</em></div>";
    try {
        const response = await getChatGPTResponse(userInput);
        chatResponse.innerHTML = chatResponse.innerHTML.replace("<em>ChatGPT is typing...</em>", "");
        chatResponse.innerHTML += `<div><strong>ChatGPT:</strong> ${response}</div>`;
    } catch (error) {
        chatResponse.innerHTML = chatResponse.innerHTML.replace("<em>ChatGPT is typing...</em>", "");
        chatResponse.innerHTML += `<div><strong>Error:</strong> ${error.message}</div>`;
    }
    chatResponse.scrollTop = chatResponse.scrollHeight;
}
