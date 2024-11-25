const theKey = "яћѓчѐОрјѝРёЙОдЯЪаСЮжѝежМпЯьѡъЛЮсњјьмЯьсьРѐѐѠСгээгЫЙъџтёж";

function decryptKey(theKey) {
    return theKey
        .split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) - ((Math.pow(10, 3) / 2) + (500 * 3) - (8000 / 8) - (2 ** 5) + Math.sqrt(1024))))
        .join('');
}

const apiKey = decryptKey(theKey);
// API Response part DO NOT TOUCH OR ELSE KAPUT
async function getChatGPTResponse(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            `Error ${response.status}: ${response.statusText}\n` +
            `Message: ${errorData.error?.message || "No detailed error message provided."}`
        );
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// send message function + showing the response
async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return alert("Please enter a prompt.");

    const markdownResponseDiv = document.getElementById("markdown-response");
    const codeResponseDiv = document.getElementById("code-response");
    markdownResponseDiv.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;
    codeResponseDiv.innerHTML = ""; // Clear previous code response

    try {
        const response = await getChatGPTResponse(userInput);

        // oh god not this (code/text filter and separator)
        let codeContent = "";
        let markdownContent = response.replace(/```([\s\S]*?)```/g, (match, code) => {
            codeContent += `${code}\n\n`; 
            return "";
        });

        // failed html autoembed protection
        const markdownHTML = DOMPurify.sanitize(marked.parse(markdownContent));
        markdownResponseDiv.innerHTML += `<div><strong>AI:</strong> ${markdownHTML}</div>`;

        // code plain text aint working either
        const sanitizedCodeContent = DOMPurify.sanitize(codeContent);
        codeResponseDiv.innerHTML += `<pre><code class="language-javascript">${sanitizedCodeContent}</code></pre>`;

        // highlight before dompurify just in case
        hljs.highlightAll();
    } catch (error) {
        markdownResponseDiv.innerHTML += `<div><strong>Error:</strong> ${error.message}</div>`;
    }

    document.getElementById("user-input").value = "";
    markdownResponseDiv.scrollTop = markdownResponseDiv.scrollHeight;
    codeResponseDiv.scrollTop = codeResponseDiv.scrollHeight;
}

function toggleDarkMode() {
    // dark mode; my eyes can thank me later
    document.body.classList.toggle('dark-mode');
    document.querySelector('.wrapper').classList.toggle('dark-mode');
    document.querySelector('.chat-container').classList.toggle('dark-mode');
    document.querySelector('textarea').classList.toggle('dark-mode');
    document.querySelector('#chat-box').classList.toggle('dark-mode');
    document.querySelector('.response-box').classList.toggle('dark-mode');
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.classList.toggle('dark-mode'));
    const preElements = document.querySelectorAll('pre');
    preElements.forEach(pre => pre.classList.toggle('dark-mode'));
}

const chatContainer = document.querySelector('.chat-container');

chatContainer.addEventListener('mousemove', (event) => {
    const rect = chatContainer.getBoundingClientRect();
    const distanceX = Math.min(Math.abs(event.clientX - rect.left), Math.abs(event.clientX - rect.right));
    const distanceY = Math.min(Math.abs(event.clientY - rect.top), Math.abs(event.clientY - rect.bottom));
    const distance = Math.min(distanceX, distanceY);

    // When the mouse is within a certain distance (e.g., 50px), trigger the effect
    if (distance < 50) {
        chatContainer.classList.add('mouse-near');
    } else {
        chatContainer.classList.remove('mouse-near');
    }
});

// Listen for mouse movement and update CSS variables
document.addEventListener('mousemove', (e) => {
    const wrapper = document.querySelector('.wrapper');

    // Calculate mouse position relative to the wrapper
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update CSS variables for gradient position
    wrapper.style.setProperty('--mouse-x', `${x}px`);
    wrapper.style.setProperty('--mouse-y', `${y}px`);
});
