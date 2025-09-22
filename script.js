// script.js
document.getElementById('send-btn').addEventListener('click', function() {
    let input = document.getElementById('user-input');
    let message = input.value;
    
    if (message) {
        // أضف رسالة المستخدم
        let userMsg = document.createElement('div');
        userMsg.textContent = "أنت: " + message;
        document.getElementById('chat-box').appendChild(userMsg);
        
        // امسح الحقل
        input.value = "";
        
        // رد البوت
        setTimeout(function() {
            let botMsg = document.createElement('div');
            botMsg.textContent = "البوت: تم استلام رسالتك!";
            document.getElementById('chat-box').appendChild(botMsg);
        }, 1000);
    }
});
