let responses = {}; // فارغ بالبداية
let conversationHistory = [];
let currentLanguage = 'ar';
let conversationContext = {
    currentTopic: '',
    userMood: 'neutral',
    mentionedTopics: []
};

const placeholders = {
    ar: 'اكتب رسالتك هنا...',
    en: 'Type your message here...'
};

async function loadResponses() {
    try {
        const res = await fetch('responses.json'); // مسار ملف JSON
        responses = await res.json();
        console.log('Responses loaded successfully');
    } catch (err) {
        console.error('Error loading responses.json:', err);
    }
}

async function initChat() {
    await loadResponses();
    updatePlaceholder();
    setupEventListeners(); // إضافة هذا السطر المهم
}

document.addEventListener('DOMContentLoaded', initChat);

// ====================== تحليل المشاعر ======================
function analyzeSentiment(text) {
    const sentimentWords = {  
        "فرحان": 2, "مسرور": 2, "سعيدة": 2, "فرحة": 2,  
        "محبط": -2, "متضايق": -1.5, "منزعجة": -1.5, "تعبة": -1.5, "مرهق": -2,  
        "متفائل": 1.5, "متحمس": 1.5, "مندهش": 1.2, "ممتن": 1.5,  
        "سعيد": 2, "فرح": 2, "مبسوط": 2, "رائع": 1.5,  
        "حزين": -2, "تعيس": -2, "زعلان": -2, "غاضب": -2.5, "منزعج": -2  
    };  

    const modifiers = {  
        "جداً": 1.5, "مرة": 1.5, "مره": 2, "شوي": 0.5, "قليلاً": 0.5  
    };  

    const words = text.split(" ");  
    let score = 0;  
    let negation = false;  

    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (["مو", "ما", "مش", "ليس", "لست"].includes(word)) {
            negation = true;
            continue;
        }
        if (sentimentWords[word] !== undefined) {
            let value = sentimentWords[word];
            if (negation) {
                value = value * -1;
                negation = false;
            }
            let nextWord = words[i + 1];
            if (nextWord && modifiers[nextWord] !== undefined) {
                value *= modifiers[nextWord];
            }
            score += value;
        }
    }

    if (score > 1) return 'happiness';
    if (score < -2) return 'anger';
    if (score < -1) return 'sadness';
    return Math.random() > 0.5 ? 'greeting' : 'neutral';
}

// ====================== تحديث سياق المحادثة ======================
function updateConversationContext(text, emotion) {
    const topics = ['عمل', 'دراسة', 'عائلة', 'أصدقاء', 'صحة', 'شعر', 'نصائح', 'تنظيم'];
    const mentioned = topics.filter(topic => text.includes(topic));
    if (mentioned.length > 0) {
        conversationContext.currentTopic = mentioned[0];
        conversationContext.mentionedTopics.push(...mentioned);
    }
    conversationContext.userMood = emotion;
}

// ====================== استدعاء الرد من JSON ======================
function getRandomResponse(emotion) {
    if (!responses[currentLanguage] || !responses[currentLanguage][emotion]) 
        return "أنا هنا لأستمع إليك.";
    const choices = responses[currentLanguage][emotion];
    return choices[Math.floor(Math.random() * choices.length)];
}

function updatePlaceholder() {
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.placeholder = placeholders[currentLanguage] || placeholders['en'];
    }
}

// ====================== إعداد مستمعي الأحداث ======================
function setupEventListeners() {
    const button = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    if (button) {
        button.addEventListener('click', sendMessage);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentLanguage = this.getAttribute('data-lang');
            updatePlaceholder();
        });
    });
}

// ====================== إرسال الرسالة ======================
function sendMessage() {
    const userInput = document.getElementById('user-input');
    if (!userInput) return;
    
    const userText = userInput.value.trim();
    if (!userText) return;

    conversationHistory.push(userText);
    if (conversationHistory.length > 5) conversationHistory.shift();

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.textContent = userText;
    chatContainer.appendChild(userMsg);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    const typingTime = Math.min(3000, Math.max(1000, userText.length * 50));

    setTimeout(() => {
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        const contextText = conversationHistory.join(' ');
        const emotion = analyzeSentiment(contextText);
        updateConversationContext(userText, emotion);
        const smartResponse = getRandomResponse(emotion);

        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.textContent = smartResponse;

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-buttons';
        feedbackDiv.innerHTML = `
            <button class="feedback-btn" data-response="${encodeURIComponent(smartResponse)}" data-rating="good">👍</button>
            <button class="feedback-btn" data-response="${encodeURIComponent(smartResponse)}" data-rating="bad">👎</button>
        `;
        feedbackDiv.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const response = decodeURIComponent(this.getAttribute('data-response'));
                const rating = this.getAttribute('data-rating');
                rateResponse(response, rating);
            });
        });

        botMsg.appendChild(feedbackDiv);
        chatContainer.appendChild(botMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;

    }, typingTime);
}

// ====================== تقييم الرد ======================
function rateResponse(responseText, rating) {
    const contextData = {
        userInput: conversationHistory[conversationHistory.length - 1],
        emotion: conversationContext.userMood,
        topic: conversationContext.currentTopic
    };
    
    let ratings = JSON.parse(localStorage.getItem('responseRatings') || '{}');
    ratings[responseText] = {
        rating: rating,
        context: contextData,
        timestamp: Date.now()
    };
    localStorage.setItem('responseRatings', JSON.stringify(ratings));
    
    const thankYouMessages = {
        ar: 'شكرًا للتقييم! ستتحسن ردودي بناءً على ملاحظاتك.',
        en: 'Thank you for your feedback! I will improve my responses based on your input.'
    };
    alert(thankYouMessages[currentLanguage] || thankYouMessages['en']);
}

// ====================== DOMContentLoaded ======================
document.addEventListener('DOMContentLoaded', function() {
    const lottieContainer = document.getElementById('lottie-bg');

    // شغّل الخلفية مرة واحدة فقط
    if (lottieContainer && typeof lottie !== 'undefined') {
        lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'Background Full Screen-Night.json'
        });
    }
    
    updatePlaceholder();
});
