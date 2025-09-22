// ---------------- تحميل ملفات JSON ----------------
let allResponses = {}; // ردود المشاعر
let keywords = {};     // كلمات مفتاحية لكل شعور

async function loadJSON() {
  const responsesRes = await fetch('responses.json'); // اسم ملف الردود عندك
  allResponses = await responsesRes.json();

  const keywordsRes = await fetch('keywords.json'); // ملف الكلمات المفتاحية
  keywords = await keywordsRes.json();
}

// ---------------- إعداد الانيميشن ----------------
const animationContainer = document.getElementById('animationContainer');
let animationLoaded = false;
let animation;

function loadAnimationOnce() {
  if (!animationLoaded) {
    animation = lottie.loadAnimation({
      container: animationContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'Background Full Screen-Night.json'
    });
    animationLoaded = true;
  }
}

// ---------------- دوال اكتشاف المشاعر ----------------
function detectEmotion(message, lang) {
  for (const emotion in keywords) {
    for (const word of keywords[emotion][lang]) {
      if (message.toLowerCase().includes(word.toLowerCase())) {
        return emotion;
      }
    }
  }
  return "neutral"; // افتراضي
}

function getResponse(emotion, lang) {
  if (allResponses[emotion] && allResponses[emotion][lang]) {
    const responses = allResponses[emotion][lang];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return "Hmm..."; // fallback
}

// ---------------- عرض الرسائل ----------------
function showReply(reply, sender="Bot") {
  const messagesDiv = document.getElementById('messages');
  const p = document.createElement('p');
  p.textContent = `${sender}: ${reply}`;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ---------------- التعامل مع المستخدم ----------------
document.getElementById('send-Btn').addEventListener('click', async () => {
  const input = document.getElementById('user-Input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';

  // عرض رسالة المستخدم
  showReply(message, "You");

  // تحميل ملفات JSON إذا لم تحمل بعد
  if (!allResponses || Object.keys(allResponses).length === 0) {
    await loadJSON();
  }

  // تشغيل الانيميشن مرة واحدة عند أول إرسال
  loadAnimationOnce();

  // افتراض اللغة الإنجليزية، يمكن تعديلها ديناميكياً حسب المستخدم
  const lang = "en"; 
  const emotion = detectEmotion(message, lang);

  // اختيار الرد الذكي
  const reply = getResponse(emotion, lang);

  // عرض الرد
  showReply(reply);
});
