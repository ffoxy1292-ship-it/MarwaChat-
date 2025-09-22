// script.js
let emotionsData = {};
let currentLanguage = 'ar';
let currentAnimation = null;

console.log('جاري تحميل البرنامج...');

// تحميل بيانات المشاعر
async function loadEmotionsData() {
    try {
        console.log('بدء تحميل emotions.json...');
        const response = await fetch('emotions.json');
        
        if (!response.ok) {
            throw new Error(`خطأ HTTP: ${response.status}`);
        }
        
        emotionsData = await response.json();
        console.log('تم تحميل بيانات المشاعر بنجاح:', emotionsData);
        setupEventListeners();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // بدء الإعداد حتى لو فشل تحميل JSON
        setupEventListeners();
    }
}

// دالة مبسطة لإضافة الرسائل
function addMessageToChat(message, sender) {
    console.log('إضافة رسالة:', message, 'من:', sender);
    
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) {
        console.error('عنصر chat-box غير موجود!');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.margin = '5px';
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

// دالة إرسال الرسالة المبسطة
function sendMessage() {
    console.log('تم استدعاء sendMessage');
    
    const userInput = document.getElementById('user-input');
    if (!userInput) {
        console.error('عنصر user-input غير موجود!');
        return;
    }
    
    const message = userInput.value.trim();
    console.log('الرسالة:', message);
    
    if (!message) {
        console.log('الرسالة فارغة');
        return;
    }
    
    // إضافة رسالة المستخدم
    addMessageToChat(message, 'user');
    userInput.value = '';
    
    // رد بسيط من البوت
    setTimeout(() => {
        const responses = {
            'ar': ['أهلاً بك!', 'كيف حالك؟', 'أنا هنا لمساعدتك'],
            'en': ['Hello!', 'How are you?', 'I am here to help you'],
            'es': ['¡Hola!', '¿Cómo estás?', 'Estoy aquí para ayudarte'],
            'fr': ['Bonjour !', 'Comment ça va ?', 'Je suis ici pour vous aider'],
            'hi': ['नमस्ते!', 'आप कैसे हैं?', 'मैं आपकी मदद के लिए यहां हूं'],
            'tl': ['Kamusta!', 'Kumusta ka?', 'Nandito ako para tulungan ka']
        };
        
        const langResponses = responses[currentLanguage] || responses['ar'];
        const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];
        
        addMessageToChat(randomResponse, 'bot');
    }, 1000);
}

// إعداد event listeners مع تصحيح الأخطاء
function setupEventListeners() {
    console.log('بدء إعداد event listeners...');
    
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
    
    console.log('تم العثور على العناصر بنجاح');
    
    // إزالة أي event listeners قديمة
    button.onclick = null;
    userInput.onkeypress = null;
    
    // إضافة event listeners جديدة
    button.addEventListener('click', function() {
        console.log('تم النقر على زر الإرسال');
        sendMessage();
    });
    
    userInput.addEventListener('keypress', function(e) {
        console.log('تم الضغط على مفتاح:', e.key);
        if (e.key === 'Enter') {
            console.log('تم الضغط على Enter');
            sendMessage();
        }
    });
    
    // أزرار اللغة
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('عدد أزرار اللغة:', langButtons.length);
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log('تم النقر على لغة:', lang);
            switchLanguage(lang);
        });
    });
    
    console.log('تم إعداد جميع event listeners بنجاح');
}

// تبديل اللغة
function switchLanguage(lang) {
    console.log('تبديل اللغة إلى:', lang);
    
    currentLanguage = lang;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // تحديث placeholder
    const userInput = document.getElementById('user-input');
    if (userInput) {
        const placeholders = {
            'ar': 'اكتب رسالتك هنا...',
            'en': 'Type your message here...',
            'es': 'Escribe tu mensaje aquí...',
            'fr': 'Tapez votre message ici...',
            'hi': 'अपना संदेश यहाँ लिखें...',
            'tl': 'I-type ang iyong mensahe dito...'
        };
        userInput.placeholder = placeholders[lang] || placeholders['ar'];
    }
}

// بدء التحميل عندما تكون الصفحة جاهزة
document.addEventListener('DOMContentLoaded', function() {
    console.log('الصفحة تم تحميلها بالكامل');
    loadEmotionsData();
});

// أيضًا نستدعي الإعداد عندما يتم تحميل الـ DOM بالكامل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEmotionsData);
} else {
    loadEmotionsData();
               }
