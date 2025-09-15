const responses = {

ar: {

"براحتك… لا تجبر نفسك على ابتسامة او مود يطلع في ثانية🫶🏻",

"واو! ضحكتك  معدية😂💛"	,

"هههه حسيت بالفرحة معاك 🌸😺	",

"مم… كل شي تمام ⚡😌",

" الطاقة هاي خلتني أبتسم 🤭",

"هههه… واضح فيه ارتياح اليوم 😄💫",

"… لحظة حلوة لازم تتشارك 😼"	,

"يا سلام… الجو كله إيجابي 💫🌞",

"ههه… ضحكك فعلاً مسلي 😆",

"🤌🏻… شعور رائع اليوم 💛",

"ههه… الطاقة هاي تخلي اليوم ممتع 💯😆"	,

"… أحلى إحساس💫",

"🙈! حسيت بالبهجة منك ⚡",

"لحضة ممتعة جدا😃	",

"مم… يومك فعلاً رائع 🌸",
      "ربما تحتاج إلى استراحة قصيرة لتهدأ",

"أشعر بالجوع فقط بالتفكير في الطعام! 🍕",

},

"Mmm… want to laugh a bit and forget it? 🫡",

"What’s the best way to release the energy? 🌿",

"…If you want, I can help think of a solution 🧠",

"…Any small thing that could cheer you up now? 💛",

"How’s the anger right now? Want to talk about it? 🫣"

},

es: {

'outraged', 'aggravated', 'bothered', 'exasperated', 'infuriated', 'resentful', 'livid', 'fuming', 'hostile', 'agitated', 'provoked', 'irked'],

},

es: {

},

fr: {

},

hi: {

},

tl: {

}

if (!detectedEmotion || maxMatches === 0) {

}

return detectedEmotion;

}

function sendMessage() {

const userInput = document.getElementById('user-input').value.trim();

if (!userInput) return;

const chatContainer = document.getElementById('chat-container');

const userMsg = document.createElement('div');

userMsg.className = 'message user-message';

userMsg.textContent =  ${userInput};

chatContainer.appendChild(userMsg);

document.getElementById('user-input').value = '';

chatContainer.scrollTop = chatContainer.scrollHeight;

// إظهار مؤشر الكتابة

const typingIndicator = document.getElementById('typing-indicator');

typingIndicator.style.display = 'block';

chatContainer.scrollTop = chatContainer.scrollHeight;

// تحديد وقت الانتظار بناءً على طول الرسالة

const typingTime = Math.min(3000, Math.max(1000, userInput.length * 50));

setTimeout(() => { function(){

document.getElementById('send-btn').addEventListener('click', sendMessage);

document.getElementById('user-input').addEventListener('keypress', function(e) {

});

document.querySelectorAll('.lang-btn').forEach(button => {

});

});

