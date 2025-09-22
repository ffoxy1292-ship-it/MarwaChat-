let allResponses = {};
async function loadResponses() {
  const res = await fetch('responses.json');
  allResponses = await res.json();
}
function showMessage(message, sender="Bot") {
  const chatContainer = document.getElementById('chat-container');
  const p = document.createElement('p');
  p.textContent = `${sender}: ${message}`;
  chatContainer.appendChild(p);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
function getBotResponse(userMessage, lang="en") {
  userMessage = userMessage.toLowerCase();

  for (const key in allResponses) {
    if (userMessage.includes(key)) {
      const responses = allResponses[key][lang];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  return "Message received.";
}
document.getElementById('send-btn').addEventListener('click', async () => {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';

  showMessage(message,"You");

  if (!allResponses || Object.keys(allResponses).length === 0) {
    await loadResponses();
  }

  const lang = "en";
  const botReply = getBotResponse(message, lang);
  showMessage(botReply,"bot");
});
