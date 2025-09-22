let emotionsData = {};
let currentLanguage = 'ar';
let currentAnimation = null;

// تحميل بيانات المشاعر
async function loadEmotionsData() {
    try {
        const response = await fetch('emotions.json');
        emotionsData = await response.json();
        console.log('تم تحميل بيانات المشاعر بنجاح');
        setupEventListeners();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

// البحث الذكي عن المشاعر
function detectEmotion(message, language) {
    const langData = emotionsData[language];
    if (!langData) return null;
    
    message = message.toLowerCase();
    const detectedEmotions = [];
    
    // البحث في كل شعور
    for (const [emotion, data] of Object.entries(langData)) {
        for (const keyword of data.keywords) {
            if (message.includes(keyword.toLowerCase())) {
                detectedEmotions.push({
                    emotion: emotion,
                    confidence: keyword.length, // ثقة أعلى للكلمات الأطول
                    data: data
                });
            }
        }
    }
    
    // إرجاع الشعور الأكثر ثقة
    if (detectedEmotions.length > 0) {
        detectedEmotions.sort((a, b) => b.confidence - a.confidence);
        return detectedEmotions[0];
    }
    
    return null;
}

// تغيير الخلفية المتحركة
function changeBackgroundAnimation(animationFile) {
    // إيقاف الأنيميشن الحالي
    if (currentAnimation) {
        currentAnimation.destroy();
    }
    
    // تحميل الأنيميشن الجديد
    const animationContainer = document.getElementById('background-animation');
    if (!animationContainer) {
        // إنشاء حاوية للخلفية إذا لم تكن موجودة
        const container = document.createElement('div');
        container.id = 'background-animation';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '-1';
        document.body.appendChild(container);
    }
    
    // تحميل الأنيميشن الجديد
    currentAnimation = lottie.loadAnimation({
        container: document.getElementById('background-animation'),
        path: animationFile,
        renderer: 'svg',
        loop: true,
        autoplay: true
    });
}

// إرسال الرسالة مع الذكاء الاصطناعي
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // إضافة رسالة المستخدم
    addMessageToChat(message, 'user');
    userInput.value = '';
    
    // البحث عن المشاعر
    const detectedEmotion = detectEmotion(message, currentLanguage);
    
    // إعداد رد الذكاء الاصطناعي
    let botResponse = '';
    let animationFile = 'Background Full Screen-Night.json'; // افتراضي
    
    if (detectedEmotion) {
        const responses = detectedEmotion.data.responses;
        botResponse = responses[Math.floor(Math.random() * responses.length)];
        animationFile = detectedEmotion.data.animation;
        
        console.log(`تم اكتشاف الشعور: ${detectedEmotion.emotion}`);
    } else {
        // رد افتراضي إذا لم يتم التعرف على الشعور
        const defaultResponses = {
            'ar': 'أفهم مشاعرك، هل يمكنك شرح المزيد؟',
            'en': 'I understand your feelings, can you explain more?',
            'es': 'Entiendo tus sentimientos, ¿puedes explicar más?',
            'fr': 'Je comprends vos sentiments, pouvez-vous expliquer davantage ?',
            'hi': 'मैं आपकी भावनाओं को समझता हूं, क्या आप और समझा सकते हैं?',
            'tl': 'Naiintindihan ko ang iyong nararamdaman, maaari mo bang ipaliwanag nang higit pa?'
        };
        botResponse = defaultResponses[currentLanguage] || defaultResponses['ar'];
    }
    
    // تغيير الخلفية
    changeBackgroundAnimation(animationFile);
    
    // إضافة رد البوت بعد تأخير بسيط
    setTimeout(() => {
        addMessageToChat(botResponse, 'bot');
    }, 1000);
}

// إعداد event listeners
function setupEventListeners() {
    const button = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    button.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // أزرار اللغة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

// تبديل اللغة
function switchLanguage(lang) {
    if (!emotionsData[lang]) {
        alert('هذه اللغة غير متوفرة حالياً');
        return;
    }
    
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    
    // تحديث الرسالة الترحيبية
    const welcomeMsg = document.querySelector('.bot-message');
    if (welcomeMsg) {
        const greetings = {
            'ar': 'مرحباً! أخبرني عن مشاعرك اليوم 🌸',
            'en': 'Hello! Tell me about your feelings today 🌸',
            'es': '¡Hola! Cuéntame sobre tus sentimientos hoy 🌸',
            'fr': 'Bonjour ! Parlez-moi de vos sentiments aujourd\'hui 🌸',
            'hi': 'नमस्ते! आज मुझे अपनी भावनाओं के बारे में बताएं 🌸',
            'tl': 'Kamusta! Sabihin sa akin ang tungkol sa iyong nararamdaman ngayon 🌸'
        };
        welcomeMsg.textContent = greetings[lang] || greetings['ar'];
    }
}

// بدء التحميل
document.addEventListener('DOMContentLoaded', loadEmotionsData);
