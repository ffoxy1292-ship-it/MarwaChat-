let responses = {};
let conversationHistory = [];
let currentLanguage = 'ar';
let conversationContext = {
    currentTopic: '',
    userMood: 'neutral',
    mentionedTopics: []
};

const placeholders = {
    ar: 'اكتب رسالتك هنا...',
    en: 'Type your message here...',
    es: 'Escribe tu mensaje aquí...',
    fr: 'Écrivez votre message ici...',
    hi: 'अपना संदेश यहाँ लिखें...',
    tl: 'I-type ang iyong mensahe dito...'
};

// كلمات المشاعر مع قيمها (يجب أن تكون خارج الدالة)
const sentimentWords = {
    // العربية
    "فرحان": 2, "مسرور": 2, "سعيدة": 2, "فرحة": 2,  
    "محبط": -2, "متضايق": -1.5, "منزعجة": -1.5, "تعبة": -1.5, "مرهق": -2,  
    "متفائل": 1.5, "متحمس": 1.5, "مندهش": 1.2, "ممتن": 1.5,  
    "سعيد": 2, "فرح": 2, "مبسوط": 2, "رائع": 1.5,  
    "حزين": -2, "تعيس": -2, "زعلان": -2, "غاضب": -2.5, "منزعج": -2,
    
    // الإنجليزية
    "happy": 2, "excited": 2, "joy": 2, "great": 1.5, "good": 1,
    "sad": -2, "angry": -2.5, "tired": -1.5, "upset": -2, "bad": -1.5,
    "love": 2.5, "hate": -2.5, "wonderful": 2, "terrible": -2,
    
    // الإسبانية
    "feliz": 2, "alegre": 2, "emocionado": 2, "contento": 1.5,
    "triste": -2, "enojado": -2.5, "cansado": -1.5, "molesto": -2,
    "encantado": 2, "enfadado": -2,
    
    // الفرنسية
    "heureux": 2, "joyeux": 2, "excité": 2, "content": 1.5,
    "triste": -2, "fatigué": -1.5, "fâché": -2.5, "énervé": -2,
    "ravi": 2, "mécontent": -2,
    
    // الهندية
    "खुश": 2, "उत्साहित": 2, "आनंदित": 2, "शानदार": 1.5,
    "दुखी": -2, "थका": -1.5, "गुस्सा": -2.5, "परेशान": -2,
    "प्यार": 2.5, "नफरत": -2.5,
    
    // التاغالوغية
    "masaya": 2, "saya": 2, "tuwa": 2, "galak": 1.5,
    "malungkot": -2, "pagod": -1.5, "galit": -2.5, "inis": -2,
    "mahal": 2.5, "poot": -2.5
};

const modifiers = {  
    "جداً": 1.5, "مرة": 1.5, "مره": 2, "شوي": 0.5, "قليلاً": 0.5,
    "very": 1.5, "so": 1.5, "a bit": 0.5, "little": 0.5,
    "muy": 1.5, "bastante": 1.2, "poco": 0.5,
    "très": 1.5, "assez": 1.2, "peu": 0.5,
    "बहुत": 1.5, "थोड़ा": 0.5,
    "napaka": 1.5, "medyo": 1.2, "kaunti": 0.5
};

const negationWords = [
    "مو", "ما", "مش", "ليس", "لست", "لا", "ليس", 
    "not", "no", "don't", "isn't", "aren't",
    "no", "tampoco", "nunca",
    "non", "ne", "pas", "jamais",
    "नहीं", "मत", "ना",
    "hindi", "ayaw", "huwag"
};

async function loadResponses() {
    try {
        const res = await fetch('responses.json');
        responses = await res.json();
        console.log('تم تحميل الردود بنجاح');
        
        // التحقق من وجود جميع اللغات في الملف
        const availableLanguages = Object.keys(responses);
        console.log('اللغات المتاحة:', availableLanguages);
        
        // تعطيل أزرار اللغات غير المتوفرة
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (!availableLanguages.includes(lang)) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.title = 'هذه اللغة غير متوفرة';
            }
        });
    } catch (err) {
        console.error('خطأ في تحميل responses.json:', err);
        // استخدام ردود افتراضية بسيطة كاحتياطي
        responses = {
            ar: { 
                greeting: ["مرحباً! كيف يمكنني مساعدتك؟"],
                neutral: ["أخبرني المزيد عن ذلك"]
            },
            en: { 
                greeting: ["Hello! How can I help you?"],
                neutral: ["Tell me more about that"]
            }
        };
    }
}

async function initChat() {
    await loadResponses();
    updatePlaceholder();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initChat);

function analyzeSentiment(text) {
    console.log("تحليل المشاعر للنص:", text);
    let score = 0;  
    let negation = false;  
    const words = text.split(/\s+/);
    console.log("الكلمات المستخرجة:", words);

    for (let i = 0; i < words.length; i++) {
        let word = words[i].toLowerCase().replace(/[.,!?;:]$/, '');
        console.log("معالجة الكلمة:", word);
        
        if (negationWords.includes(word)) {
            console.log("كلمة نفي:", word);
            negation = true;
            continue;
        }
        
        if (sentimentWords[word] !== undefined) {
            let value = sentimentWords[word];
            console.log("كلمة مشاعر:", word, "القيمة:", value);
            
            if (negation) {
                value = value * -1;
                negation = false;
                console.log("تطبيق النفي، القيمة الجديدة:", value);
            }
            
            // التحقق من وجود معدل في الكلمة التالية
            if (i + 1 < words.length) {
                let nextWord = words[i + 1].toLowerCase().replace(/[.,!?;:]$/, '');
                if (modifiers[nextWord] !== undefined) {
                    value *= modifiers[nextWord];
                    console.log("تطبيق المعدل:", nextWord, "القيمة الجديدة:", value);
                }
            }
            
            score += value;
            console.log("النتيجة الحالية:", score);
        }
    }

    console.log("النتيجة النهائية:", score);
    
    if (score > 1) return 'happiness';
    if (score < -2) return 'anger';
    if (score < -1) return 'sadness';
    if (score === 0) return 'neutral';
    return Math.random() > 0.5 ? 'greeting' : 'neutral';
}

function updateConversationContext(text, emotion) {
    const topics = {
        ar: ['عمل', 'دراسة', 'عائلة', 'أصدقاء', 'صحة', 'شعر', 'نصائح', 'تنظيم'],
        en: ['work', 'study', 'family', 'friends', 'health', 'poetry', 'advice', 'organization'],
        es: ['trabajo', 'estudio', 'familia', 'amigos', 'salud', 'poesía', 'consejos', 'organización'],
        fr: ['travail', 'étude', 'famille', 'amis', 'santé', 'poésie', 'conseils', 'organisation'],
        hi: ['काम', 'अध्ययन', 'परिवार', 'दोस्त', 'स्वास्थ्य', 'कविता', 'सलाह', 'संगठन'],
        tl: ['trabaho', 'pag-aaral', 'pamilya', 'kaibigan', 'kalusugan', 'tula', 'payo', 'organisasyon']
    };

    const currentTopics = topics[currentLanguage] || topics['ar'];
    const mentioned = currentTopics.filter(topic => text.toLowerCase().includes(topic.toLowerCase()));
    
    if (mentioned.length > 0) {
        conversationContext.currentTopic = mentioned[0];
        if (!conversationContext.mentionedTopics.includes(mentioned[0])) {
            conversationContext.mentionedTopics.push(mentioned[0]);
        }
    }
    conversationContext.userMood = emotion;
}

function getRandomResponse(emotion) {
    console.log("العاطفة المحددة:", emotion);
    console.log("اللغة الحالية:", currentLanguage);
    console.log("الردود المتاحة:", responses[currentLanguage]);
    
    if (!responses[currentLanguage]) {
        return currentLanguage === 'ar' ? 
            "عذراً، لا تتوفر ردود بلغتك حالياً." : 
            "Sorry, responses in your language are not available.";
    }
    
    if (!responses[currentLanguage][emotion]) {
        console.log("لا توجد ردود للعاطفة:", emotion);
        // إذا لم يكن هناك ردود للمشاعر المحددة، استخدم الردود المحايدة
        if (responses[currentLanguage]['neutral']) {
            const neutralChoices = responses[currentLanguage]['neutral'];
            return neutralChoices[Math.floor(Math.random() * neutralChoices.length)];
        }
        
        return currentLanguage === 'ar' ? 
            "أنا هنا لأستمع إليك." : 
            "I'm here to listen to you.";
    }
    
    const choices = responses[currentLanguage][emotion];
    console.log("الاختيارات المتاحة:", choices);
    return choices[Math.floor(Math.random() * choices.length)];
}

function updatePlaceholder() {
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.placeholder = placeholders[currentLanguage] || placeholders['en'];
    }
}

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
            const lang = this.getAttribute('data-lang');
            
            // التحقق من أن اللغة متوفرة قبل التبديل
            if (!responses[lang]) {
                alert(lang === 'ar' ? 
                    "هذه اللغة غير متوفرة حالياً" : 
                    `Language "${lang}" is not available now`);
                return;
            }
            
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentLanguage = lang;
            updatePlaceholder();
            
            // تحديث رسالة الترحيب بناءً على اللغة المختارة
            const welcomeMsg = document.querySelector('.bot-message');
            if (welcomeMsg) {
                if (lang === 'ar') {
                    welcomeMsg.textContent = 'مرحباً! أنا MarwaChat، كيف يمكنني مساعدتك اليوم؟ 🌸';
                } else if (lang === 'en') {
                    welcomeMsg.textContent = 'Hello! I am MarwaChat, how can I help you today? 🌸';
                } else if (lang === 'es') {
                    welcomeMsg.textContent = '¡Hola! Soy MarwaChat, ¿cómo puedo ayudarte hoy? 🌸';
                } else if (lang === 'fr') {
                    welcomeMsg.textContent = 'Bonjour ! Je suis MarwaChat, comment puis-je vous aider aujourd\'hui ? 🌸';
                } else if (lang === 'hi') {
                    welcomeMsg.textContent = 'नमस्ते! मैं MarwaChat हूं, आज मैं आपकी कैसे मदद कर सकता हूं? 🌸';
                } else if (lang === 'tl') {
                    welcomeMsg.textContent = 'Kamusta! Ako si MarwaChat, paano kita matutulungan ngayon? 🌸';
                }
            }
        });
    });
}

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
        console.log("النص الكامل:", contextText);
        console.log("العاطفة المكتشفة:", emotion);
        
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
        en: 'Thank you for your feedback! I will improve my responses based on your input.',
        es: '¡Gracias por tu feedback! Mejoraré mis respuestas basándome en tus comentarios.',
        fr: 'Merci pour votre feedback ! J\'améliorerai mes réponses en fonction de vos commentaires.',
        hi: 'आपके फीडबैक के लिए धन्यवाद! मैं आपकी प्रतिक्रिया के आधार पर अपनी प्रतिक्रियाओं में सुधार करूंगा।',
        tl: 'Salamat sa iyong feedback! Pagbutihin ko ang aking mga tugon batay sa iyong input.'
    };
    
    alert(thankYouMessages[currentLanguage] || thankYouMessages['en']);
}

// تهيئة Lottie عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const lottieContainer = document.getElementById('lottie-bg');
    if (lottieContainer && typeof lottie !== 'undefined') {
        lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'Background Full Screen-Night.json'
        });
    }
});
