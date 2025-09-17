// ====================== قاعدة البيانات المتقدمة ====================== 
const responses = { 
  ar: { 
    sadness: [
      "أعرف شعورك، لما تحس إن كل شيء حواليك ثقيل وكأن الدنيا صارت ضدك",
      "الحزن أوقات يجي فجأة ويخلي كل شي باهت، وكأن الألوان اختفت",
      "أحيانًا نبغى نهرب من الحزن، نغلق عيوننا ونقول إنه مش موجود",
      "يمكن دموعك تبينلك ضعف، بس في الحقيقة كل دمعة دليل إنك إنسان واعي",
      "وش الكلمة اللي كان ودك تسمعها اليوم؟",
      "كان ودي أقدر أشيل عنك النص",
      "ما في داعي تشرح... أنا افهم",
      "خليني أشاركك الثقل",
      "وش أكثر شي ضاغط عليك الحين؟",
      "تبغى أحكي معك ولا أسمع بس؟"
    ], 
    happiness: [
      "حسيت بفرحة كبيرة اليوم! كل شيء حوالينا كأنو مضوي",
      "هههه… ما تتخيل قد إيش حسيت بالبهجة لما شاركت معي اليوم",
      "مم… ضحكتك اليوم كانت معدية! ما كنت متوقع إنها تأثر علي بهالطريقة",
      "يا سلام… شعور الفرح اللي حسيت فيه اليوم يخليك تفكر إن الدنيا كلها ممكن تكون جميلة",
      "واو! هذا رائع جداً!",
      "فرحتي لفرحك لا توصف!",
      "قلبي يرقص من السعادة!",
      "أشعر بأن اليوم سيصبح أفضل بكثير!"
    ], 
    anger: [
      "أشعر أنك منزعج بعض الشيء. خذ نفسًا عميقًا.. الأمور ستتحسن",
      "الغضب طبيعي أحيانًا، لكن تذكر أنك قادر على تهدئة نفسك",
      "أتفهم سبب غضبك، هذا الموقف صعب حقاً",
      "لا بأس أن تشعر بالغضب، لكن لا تدعه يسيطر عليك"
    ], 
    greeting: [
      "مرحباً! كيف حالك اليوم؟",
      "أهلاً وسهلاً! كيف تقضي يومك؟",
      "مرحباً بك! كيف يمكنني مساعدتك اليوم？"
    ], 
    weather: [
      "الطقس جميل اليوم، أليس كذلك？",
      "أتمنى أن يكون الجو معتدلاً في منطقتك",
      "الطقس يؤثر كثيراً على مزاجنا، كيف الطقس عندك？"
    ] 
  }, 
  en: { 
    sadness: [
      "I know how you feel when everything around you feels heavy",
      "Sometimes sadness comes suddenly and makes everything seem dull",
      "I understand the loneliness that accompanies sadness",
      "It's okay to feel this way. I'm here with you"
    ], 
    happiness: [
      "I felt such a big joy today! Everything around you seemed bright",
      "You can't imagine how happy I felt when you shared with me",
      "Your joy today was contagious! I didn't expect it to affect me this way"
    ], 
    anger: [
      "I feel you're a bit upset. Take a deep breath.. things will get better",
      "Anger is natural sometimes, but remember you can calm yourself"
    ], 
    greeting: [
      "Hello! How are you today?",
      "Hi there! How's your day going?",
      "Welcome! How can I help you today?"
    ] 
  } 
};

// ====================== الكلمات المفتاحية ====================== 
const keywords = { 
  ar: { 
    sadness: ['حزين', 'تعبان', 'ضغط', 'مشكلة', 'أحباط'], 
    happiness: ['فرح', 'سعيد', 'مبسوط', 'ضحك', 'جميل'], 
    anger: ['غاضب', 'منزعج', 'غيظ', 'ضيق'], 
    greeting: ['مرحبا', 'اهلا', 'السلام'], 
    weather: ['طقس', 'جو', 'حر', 'برد'] 
  }, 
  en: { 
    sadness: ['sad', 'tired', 'pressure', 'problem'], 
    happiness: ['happy', 'joy', 'excited', 'laugh'], 
    anger: ['angry', 'annoyed', 'frustrated'], 
    greeting: ['hello', 'hi', 'hey'], 
    weather: ['weather', 'sunny', 'rain'] 
  } 
};

// ====================== Placeholders للغات المختلفة ======================
const placeholders = {
  ar: 'اكتب رسالتك هنا...',
  en: 'Type your message here...',
  es: 'Escribe tu mensaje aquí...',
  fr: 'Écrivez votre message ici...',
  hi: 'अपना संदेश यहाँ लिखें...',
  tl: 'Type your message here...'
};

let conversationHistory = [];
let currentLanguage = 'ar';
let conversationContext = {
    currentTopic: '',
    userMood: 'neutral',
    mentionedTopics: []
};

function analyzeSentiment(text) {
const sentimentWords = {  
  "فرحان": 2, "مسرور": 2, "سعيدة": 2, "فرحة": 2,  
  "محبط": -2, "متضايق": -1.5, "منزعجة": -1.5, "تعبة": -1.5, "مرهق": -2,  
  "متفائل": 1.5, "متحمس": 1.5, "مندهش": 1.2, "ممتن": 1.5,  
  "سعيد": 2, "فرح": 2, "مبسوط": 2, "رائع": 1.5,  
  "حزين": -2, "تعيس": -2, "زعلان": -2, "غاضب": -2.5, "منزعج": -2  
};  

const modifiers = {  
  "جداً": 1.5,  
  "مرة": 1.5,  
  "مره": 2,   // ← صححتها هنا  
  "شوي": 0.5,  
  "قليلاً": 0.5  
};  

  const words = text.split(" ");  
  let score = 0;  
  let negation = false;  

  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    // تحقق من النفي
    if (["مو", "ما", "مش", "ليس", "لست"].includes(word)) {
      negation = true;
      continue; // نكمل للكلمة اللي بعدها
    }

    // تحقق من وجود الكلمة في القاموس
    if (sentimentWords[word] !== undefined) {
      let value = sentimentWords[word];

      // قلب المعنى لو فيه نفي
      if (negation) {
        value = value * -1;
        negation = false;
      }

      // تحقق من الكلمة اللي بعدها (مضاعف أو مخفف)
      let nextWord = words[i + 1];
      if (nextWord && modifiers[nextWord] !== undefined) {
        value = value * modifiers[nextWord];
      }

      score += value;
    }
  }

 
        


    if (score > 1) return 'happiness';
    if (score < -2) return 'anger';
    if (score < -1) return 'sadness';
    return Math.random() > 0.5 ? 'greeting' : 'neutral';
}

function updateConversationContext(text, emotion) {
    const topics = ['عمل', 'دراسة', 'عائلة', 'أصدقاء', 'صحة'];
    const mentioned = topics.filter(topic => text.includes(topic));
    
    if (mentioned.length > 0) {
        conversationContext.currentTopic = mentioned[0];
        conversationContext.mentionedTopics.push(...mentioned);
    }
    conversationContext.userMood = emotion;
}

function getSmartResponse(emotion, context) {
    const contextualResponses = {
        sadness: {
            work: "أتفهم ضغط العمل. هل تريدين نصيحة عملية لتخفيف التوتر؟",
            study: "الدراسة ممكن تكون صعبة احياناً. أي مادة تعتبرينها الأصعب؟",
            general: "أسمع حزنك في صوتك. تريدين تتكلمين عن الشيء المزعج؟"
        },
        happiness: {
            work: "واو! يبدو أن العمل يمشي بشكل رائع اليوم! 💼✨",
            study: "مبروك! إنجاز الدراسة شعور لا يوصف! 🎓🔥", 
            general: "فرحتي لفرحك! ايش الشيء الجميل اللي صار؟ 🌈"
        },
        anger: {
            work: "الشغل أحياناً يزعل. ايش اللي مزعجك بالضبط؟",
            study: "الدراسة ممكن تسبب عصبية. ايش المادة اللي تزعلك؟",
            general: "أسمع غضبك. تريدين تتكلمين عن اللي صار؟"
        },
        greeting: {
            general: "أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم？ 🤗"
        },
        weather: {
            general: "الطقس جميل اليوم، أليس كذلك？ ☀️"
        }
    };

    
    
    return contextualResponses[emotion]?.[context.currentTopic] 
        || contextualResponses[emotion]?.general
        || responses[currentLanguage][emotion]?.[0]
        || responses[currentLanguage]['greeting'][0];
}

function detectEmotion(text, language) {
    if (!responses[language]) language = 'en';
    
    const textLower = text.toLowerCase();
    let detectedEmotion = null;
    let maxMatches = 0;

    for (const [emotion, words] of Object.entries(keywords[language])) {
        let matches = 0;
        for (const word of words) {
            if (textLower.includes(word)) matches++;
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedEmotion = emotion;
        }
    }

    if (!detectedEmotion) {
        const emotions = Object.keys(responses[language]);
        detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    }

    return detectedEmotion;
}

function updatePlaceholder() {
    const inputField = document.getElementById('user-input');
    inputField.placeholder = placeholders[currentLanguage] || placeholders['en'];
}

function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    
    if (!userInput) return;
    
    conversationHistory.push(userInput);
    if (conversationHistory.length > 5) conversationHistory.shift();

    const chatContainer = document.getElementById('chat-container');
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.textContent = userInput;
    chatContainer.appendChild(userMsg);

    document.getElementById('user-input').value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const typingTime = Math.min(3000, Math.max(1000, userInput.length * 50));

    setTimeout(() => {
        typingIndicator.style.display = 'none';
        
        const contextText = conversationHistory.join(' ');
        const emotion = analyzeSentiment(contextText);
        updateConversationContext(userInput, emotion);
        const smartResponse = getSmartResponse(emotion, conversationContext);
        
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
        es: '¡Gracias por tu comentario! Mejoraré mis respuestas basándome en tu opinión.',
        fr: 'Merci pour votre commentaire ! J\'améliorerai mes réponses en fonction de votre avis.',
        hi: 'आपके फीडबैक के लिए धन्यवाद! मैं आपके इनपुट के आधार पर अपनी प्रतिक्रियाओं में सुधार करूंगा।',
        tl: 'Salamat sa iyong feedback! Pagbutihin ko ang aking mga tugon batay sa iyong input.'
    };
    
    alert(thankYouMessages[currentLanguage] || thankYouMessages['en']);
}

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('send-btn');
    const lottieContainer = document.getElementById('lottie-bg');

    function changeBackground() {
        lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'Background Full Screen-Night.json'
        });
    }

    button.addEventListener('click', changeBackground, { once: true });
    document.getElementById('send-btn').addEventListener('click', sendMessage);

    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentLanguage = this.getAttribute('data-lang');
            updatePlaceholder();
        });
    });
    
    updatePlaceholder();
});
