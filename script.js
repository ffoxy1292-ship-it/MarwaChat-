// script.js
let emotionsData = {};
let currentLanguage = 'ar';

// 1. تحميل بيانات المشاعر من JSON
async function loadEmotions() {
    try {
        const response = await fetch('emotions.json');
        emotionsData = await response.json();
        console.log('تم تحميل الردود بنجاح');
        initChat();
    } catch (error) {
        console.log('استخدم ردود افتراضية');
        emotionsData = {
            'ar': { greeting: 'مرحباً! أخبرني عن مشاعرك 🌸' },
            'en': { greeting: 'Hello! Tell me about your feelings 🌸' },
            'es': { greeting: '¡Hola! Cuéntame tus sentimientos 🌸' },
            'fr': { greeting: 'Bonjour! Parlez-moi de vos sentiments 🌸' },
            'hi': { greeting: 'नमस्ते! मुझे अपनी भावनाओं के बारे में बताएं 🌸' },
            'tl': { greeting: 'Kamusta! Sabihin sa akin ang iyong nararamdaman 🌸' }
        };
        initChat();
    }
}

// 2. البحث عن رد مناسب
function findResponse(userMessage) {
    const langData = emotionsData[currentLanguage];
    if (!langData) return 'اللغة غير متوفرة';
    
    userMessage = userMessage.toLowerCase();
    
    // كلمات مفتاحية بسيطة
    if (userMessage.includes('مرحبا') || userMessage.includes('hello') || userMessage.includes('hola')) {
        return langData.greeting || 'أهلاً بك!';
    }
    else if (userMessage.includes('حب') || userMessage.includes('love') || userMessage.includes('amour')) {
        return 'الحب أجمل شعور في العالم 💕';
    }
    else if (userMessage.includes('حزن') || userMessage.includes('sad') || userMessage.includes('triste')) {
        return 'لا تحزن، أنا هنا معك 🌸';
    }
    else if (userMessage.includes('فرح') || userMessage.includes('happy') || userMessage.includes('heureux')) {
        return 'الفرح يضيء العالم! 🌞';
    }
    else {
        return langData.greeting || 'أخبرني المزيد عن مشاعرك';
    }
}

// 3. تحميل خلفية متحركة
function loadLottieBackground(emotion) {
    const animationFiles = {
        'love': 'Background Full Screen-Romantic.json',
        'happy': 'Background Full Screen-Sunny.json', 
        'sad': 'Background Full Screen-Rain.json',
        'default': 'Background Full Screen-Night.json'
    };
    
    const fileName = animationFiles[emotion] || animationFiles.default;
    
    // إذا كان Lottie موجود، شغلي الخلفية
    if (typeof lottie !== 'undefined') {
        lottie.loadAnimation({
            container: document.getElementById('lottie-container'),
            path: fileName,
            renderer: 'svg',
            loop: true
        });
    }
}

// 4. إرسال الرسالة
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // أضيفي رسالة المستخدم
    addMessage(message, 'user');
    
    // امسحي الحقل مباشرة
    userInput.value = '';
    
    // رد البوت بعد تأخير
    setTimeout(() => {
        const response = findResponse(message);
        addMessage(response, 'bot');
        
        // غيري الخلفية حسب المشاعر
        if (message.includes('حب') || message.includes('love')) {
            loadLottieBackground('love');
        } else if (message.includes('فرح') || message.includes('happy')) {
            loadLottieBackground('happy');
        } else if (message.includes('حزن') || message.includes('sad')) {
            loadLottieBackground('sad');
        }
    }, 1000);
}

// 5. إضافة الرسالة للشات
function addMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `${sender}-message`;
    messageDiv.textContent = text;
    messageDiv.style.padding = '10px';
    messageDiv.style.margin = '10px 0';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.maxWidth = '70%';
    
    if (sender === 'user') {
        messageDiv.style.background = '#e3f2fd';
        messageDiv.style.marginLeft = 'auto';
        messageDiv.style.textAlign = 'left';
    } else {
        messageDiv.style.background = '#f5f5f5';
        messageDiv.style.marginRight = 'auto';
        messageDiv.style.textAlign = 'right';
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 6. تبديل اللغة
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // غيري الأزرار النشطة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    
    // غيري placeholder
    const placeholders = {
        'ar': 'اكتب رسالتك هنا...',
        'en': 'Type your message...',
        'es': 'Escribe tu mensaje...',
        'fr': 'Tapez votre message...',
        'hi': 'अपना संदेश लिखें...',
        'tl': 'I-type ang iyong mensahe...'
    };
    document.getElementById('user-input').placeholder = placeholders[lang] || placeholders.ar;
}

// 7. تهيئة الشات
function initChat() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    // event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // أزرار اللغة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchLanguage(this.getAttribute('data-lang'));
        });
    });
    
    console.log('الشات جاهز!');
}

// ابدئي عندما تتحمّل الصفحة
document.addEventListener('DOMContentLoaded', loadEmotions);
