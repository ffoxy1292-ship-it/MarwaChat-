function setupEventListeners() {
    console.log('جاري إعداد مستمعي الأحداث...');
    
    let button = document.getElementById('send-btn');
    let userInput = document.getElementById('user-input');
    
    if (!button) {
        console.error('زر الإرسال غير موجود!');
        return;
    }
    
    if (!userInput) {
        console.error('حقل الإدخال غير موجود!');
        return;
    }
    
    // استبدال العناصر مع الحفاظ على الموقع الأصلي (الطريقة الصحيحة)
    const newButton = button.cloneNode(true);
    const newInput = userInput.cloneNode(true);
    
    button.parentNode.replaceChild(newButton, button);
    userInput.parentNode.replaceChild(newInput, userInput);
    
    // تحديث المرجع إلى العناصر الجديدة
    button = document.getElementById('send-btn');
    userInput = document.getElementById('user-input');
    
    // إضافة event listeners
    button.addEventListener('click', sendMessage);
    console.log('تم تسجيل حدث النقر على الزر');
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('تم الضغط على Enter');
            sendMessage();
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            if (!responses[lang]) {
                alert(lang === 'ar' ? 
                    "هذه اللغة غير متوفرة حالياً" : 
                    `Language "${lang}" is not available now`);
                return;
            }
            
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentLanguage = lang;
            updatePlaceholder();
            
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
