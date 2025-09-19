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

// كلمات المشاعر مع قيمها
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
];

async function loadResponses() {
    try {
        const res = await fetch('responses.json');
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // التحقق من صحة هيكل البيانات
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid JSON structure');
        }
        
        responses = data;
        console.log('تم تحميل الردود بنجاح');
        
    } catch (err) {
        console.error('خطأ في تحميل responses.json:', err);
        
        // استخدام ردود افتراضية شاملة
        responses = {
            ar: {
                greeting: ["مرحباً! أنا MarwaChat 🌸"],
                happiness: ["أشعر بسعادتك! 😊", "هذا رائع! 🌟"],
                sadness: ["أنا هنا من أجلك 🫂", "يمكنني الاستماع إذا أردت التحدث 💬"],
                anger: ["لنأخذ نفساً عميقاً 🌬️", "حاول أن تهدأ قليلاً ☮️"],
                neutral: ["أخبرني المزيد 🤔", "ممم فهمت 💭", "تابع 📝"],
                boredom: ["أقترح نقرأ كتاب معاً 📚", "لنستمع لموسيقى هادئة 🎵"],
                surprise: ["مفاجأة! 🎉", "لم أتوقع ذلك! 😮"],
                tiredness: ["خذ قسطاً من الراحة 🛌", "الجسم يحتاج للاسترخاء 🧘‍♀️"]
            },
            en: {
                greeting: ["Hello! I am MarwaChat 🌸"],
                happiness: ["I feel your happiness! 😊", "That's wonderful! 🌟"],
                sadness: ["I'm here for you 🫂", "I can listen if you want to talk 💬"],
                anger: ["Let's take a deep breath 🌬️", "Try to calm down a bit ☮️"],
                neutral: ["Tell me more 🤔", "I see 💭", "Continue 📝"],
                boredom: ["Let's read a book together 📚", "We can listen to calm music 🎵"],
                surprise: ["Surprise! 🎉", "I didn't expect that! 😮"],
                tiredness: ["Get some rest 🛌", "Your body needs relaxation 🧘‍♀️"]
            }
        };
    }
}

async function initChat() {
    console.log('بدء تهيئة التطبيق...');
    
    // تحميل الردود أولاً
    await loadResponses();
    
    // ثم تهيئة باقي المكونات
    updatePlaceholder();
    setupEventListeners();
    
    // تهيئة Lottie بعد تحميل الصفحة بالكامل
    initLottie();
    
    console.log('تم تهيئة التطبيق بنجاح');
}

function initLottie() {
    const lottieContainer = document.getElementById('lottie-bg');
    
    if (!lottieContainer) {
        console.warn('عنصر Lottie غير موجود');
        return;
    }
    
    if (typeof lottie === 'undefined') {
        console.warn('مكتبة Lottie غير محملة');
        return;
    }
    
    try {
        lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'Background Full Screen-Night.json'
        });
        console.log('تم تحميل animation بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل animation:', error);
    }
}

function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') return 'neutral';
    
    let score = 0;  
    let negation = false;  
    const words = text.split(/\s+/);
    let emotionWordsFound = 0;

    for (let i = 0; i < words.length; i++) {
        let word = words[i].toLowerCase().replace(/[.,!?;:]$/, '');
        
        if (negationWords.includes(word)) {
            negation = true;
            continue;
        }
        
        if (sentimentWords[word] !== undefined) {
            let value = sentimentWords[word];
            
            if (negation) {
                value = -value;
                negation = false;
            }
            
            // التحقق من وجود معدل في الكلمة التالية
            if (i + 1 < words.length) {
                let nextWord = words[i + 1].toLowerCase().replace(/[.,!?;:]$/, '');
                if (modifiers[nextWord] !== undefined) {
                    value *= modifiers[nextWord];
                }
            }
            
            score += value;
            emotionWordsFound++;
        }
    }

    // تحسين دقة التحليل
    if (emotionWordsFound === 0) return 'neutral';
    
    const averageScore = score / emotionWordsFound;
    
    if (averageScore > 1.2) return 'happiness';
    if (averageScore < -1.5) return 'anger';
    if (averageScore < -0.5) return 'sadness';
    if (averageScore > 0.3) return 'happiness';
    
    return 'neutral';
}

function updateConversationContext(text, emotion) {
    const topics = {
        ar: ['عمل', 'دراسة', 'عائلة', 'أصدقاء', 'صحة', 'شعر', 'نصائح', 'تنظيم', 'جامعة', 'وظيفة'],
        en: ['work', 'study', 'family', 'friends', 'health', 'poetry', 'advice', 'organization', 'university', 'job'],
        es: ['trabajo', 'estudio', 'familia', 'amigos', 'salud', 'poesía', 'consejos', 'organización', 'universidad', 'trabajo'],
        fr: ['travail', 'étude', 'famille', 'amis', 'santé', 'poésie', 'conseils', 'organisation', 'université', 'emploi'],
        hi: ['काम', 'अध्ययन', 'परिवार', 'दोस्त', 'स्वास्थ्य', 'कविता', 'सलाह', 'संगठन', 'विश्वविद्यालय', 'नौकरी'],
        tl: ['trabaho', 'pag-aaral', 'pamilya', 'kaibigan', 'kalusugan', 'tula', 'payo', 'organisasyon', 'unibersidad', 'trabaho']
    };

    const currentTopics = topics[currentLanguage] || topics['ar'];
    const mentioned = currentTopics.filter(topic => 
        text.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (mentioned.length > 0) {
        conversationContext.currentTopic = mentioned[0];
        if (!conversationContext.mentionedTopics.includes(mentioned[0])) {
            conversationContext.mentionedTopics.push(mentioned[0]);
        }
    }
    conversationContext.userMood = emotion;
}

function getRandomResponse(emotion) {
    // إذا لم يتم تحميل الردود بعد، استخدم الردود الافتراضية
    if (Object.keys(responses).length === 0) {
        return getFallbackResponse(emotion);
    }
    
    if (!responses[currentLanguage]) {
        return currentLanguage === 'ar' ? 
            "عذراً، لا تتوفر ردود بلغتك حالياً." : 
            "Sorry, responses in your language are not available.";
    }
    
    if (!responses[currentLanguage][emotion]) {
        return getFallbackResponse(emotion);
    }
    
    const choices = responses[currentLanguage][emotion];
    return choices[Math.floor(Math.random() * choices.length)];
}

function getFallbackResponse(emotion) {
    const fallbackResponses = {
        'ar': {
            'happiness': ['أشعر بسعادتك! 🌸', 'هذا رائع! 🌟'],
            'sadness': ['أنا هنا من أجلك 🫂', 'يمكنني الاستماع إذا أردت التحدث 💬'],
            'anger': ['لنأخذ نفساً عميقاً 🌬️', 'حاول أن تهدأ قليلاً ☮️'],
            'neutral': ['أخبرني المزيد 🤔', 'ممم فهمت 💭'],
            'greeting': ['مرحباً! كيف يمكنني مساعدتك؟ 🌸'],
            'boredom': ['أقترح نقرأ كتاب معاً 📚', 'لنستمع لموسيقى هادئة 🎵'],
            'surprise': ['مفاجأة! 🎉', 'لم أتوقع ذلك! 😮'],
            'tiredness': ['خذ قسطاً من الراحة 🛌', 'الجسم يحتاج للاسترخاء 🧘‍♀️']
        },
        'en': {
            'happiness': ['I feel your happiness! 🌸', 'That\'s wonderful! 🌟'],
            'sadness': ['I\'m here for you 🫂', 'I can listen if you want to talk 💬'],
            'anger': ['Let\'s take a deep breath 🌬️', 'Try to calm down a bit ☮️'],
            'neutral': ['Tell me more 🤔', 'I see 💭'],
            'greeting': ['Hello! How can I help you? 🌸'],
            'boredom': ['Let\'s read a book together 📚', 'We can listen to calm music 🎵'],
            'surprise': ['Surprise! 🎉', 'I didn\'t expect that! 😮'],
            'tiredness': ['Get some rest 🛌', 'Your body needs relaxation 🧘‍♀️']
        }
    };
    
    // إذا كانت اللغة غير موجودة، استخدم الإنجليزية
    const lang = fallbackResponses[currentLanguage] ? currentLanguage : 'en';
    
    if (fallbackResponses[lang][emotion]) {
        const choices = fallbackResponses[lang][emotion];
        return choices[Math.floor(Math.random() * choices.length)];
    }
    
    // إذا لم يكن هناك رد للمشاعر، استخدم رد محايد
    return fallbackResponses[lang]['neutral'][0];
}

function updatePlaceholder() {
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.placeholder = placeholders[currentLanguage] || placeholders['en'];
    }
}

function setupEventListeners() {
    console.log('جاري إعداد مستمعي الأحداث...');
    
    const button = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    if (!button) {
        console.error('زر الإرسال غير موجود!');
        return;
    }
    
    if (!userInput) {
        console.error('حقل الإدخال غير موجود!');
        return;
    }
    
    // إزالة أي event listeners موجودة لمنع التكرار
    button.replaceWith(button.cloneNode(true));
    userInput.replaceWith(userInput.cloneNode(true));
    
    // الحصول على العناصر الجديدة
    const newButton = document.getElementById('send-btn');
    const newInput = document.getElementById('user-input');
    
    newButton.addEventListener('click', sendMessage);
    console.log('تم تسجيل حدث النقر على الزر');
    
    newInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('تم الضغط على Enter');
            sendMessage();
        }
    });

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
                const greetings = {
                    'ar': 'مرحباً! أنا MarwaChat، كيف يمكنني مساعدتك اليوم؟ 🌸',
                    'en': 'Hello! I am MarwaChat, how can I help you today? 🌸',
                    'es': '¡Hola! Soy MarwaChat, ¿cómo puedo ayudarte hoy? 🌸',
                    'fr': 'Bonjour ! Je suis MarwaChat, comment puis-je vous aider aujourd\'hui ? 🌸',
                    'hi': 'नमस्ते! मैं MarwaChat हूं, आज मैं आपकी कैसे मदद कर सकता हूं? 🌸',
                    'tl': 'Kamusta! Ako si MarwaChat, paano kita matutulungan ngayon? 🌸'
                };
                
                welcomeMsg.textContent = greetings[lang] || greetings['ar'];
            }
        });
    });
    
    console.log('تم إعداد جميع مستمعي الأحداث بنجاح');
}

function sendMessage() {
    console.log('محاولة إرسال رسالة...');
    
    const userInput = document.getElementById('user-input');
    if (!userInput) {
        console.error('حقل الإدخال غير موجود');
        return;
    }
    
    const userText = userInput.value.trim();
    if (!userText) {
        console.log('النص فارغ، لا شيء للإرسال');
        return;
    }

    conversationHistory.push(userText);
    if (conversationHistory.length > 5) conversationHistory.shift();

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) {
        console.error('حاوية المحادثة غير موجودة');
        return;
    }
    
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
    console.log(`وقت الكتابة: ${typingTime}ms`);

    setTimeout(() => {
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        const contextText = conversationHistory.join(' ');
        const emotion = analyzeSentiment(contextText);
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
    console.log('تقييم الرد:', rating, 'للنص:', responseText);
    
    // تحقق من دعم localStorage
    if (typeof(Storage) === "undefined") {
        alert("عذراً، المتصفح لا يدعم خاصية التخزين المحلي");
        return;
    }
    
    try {
        const contextData = {
            userInput: conversationHistory[conversationHistory.length - 1] || '',
            emotion: conversationContext.userMood,
            topic: conversationContext.currentTopic
        };
        
        let ratings = {};
        try {
            const storedRatings = localStorage.getItem('responseRatings');
            ratings = storedRatings ? JSON.parse(storedRatings) : {};
        } catch (e) {
            console.error('خطأ في قراءة localStorage:', e);
            localStorage.removeItem('responseRatings');
            ratings = {};
        }
        
        ratings[responseText] = {
            rating: rating,
            context: contextData,
            timestamp: Date.now()
        };
        
        localStorage.setItem('responseRatings', JSON.stringify(ratings));
        console.log('تم حفظ التقييم بنجاح');
        
    } catch (error) {
        console.error('خطأ في حفظ التقييم:', error);
        alert('حدث خطأ في حفظ التقييم');
        return;
    }
    
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

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل DOM بالكامل');
    initChat();
});

// إضافة وظيفة للتصحيح في حالة الطوارئ
function emergencyFix() {
    console.log('تنفيذ الإصلاح الطارئ...');
    
    // مسح localStorage
    if (typeof(Storage) !== "undefined") {
        localStorage.clear();
        console.log('تم مسح localStorage');
    }
    
    // إعادة تحميل الصفحة
    location.reload();
}

// جعل الوظيفة متاحة globally للاستخدام في console
window.emergencyFix = emergencyFix;
