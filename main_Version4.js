class PokerApp {
    constructor() {
        this.user = null;
        this.currentPage = 'auth';
        this.verificationCode = '123456';
        this.balance = 1000;
        this.language = 'ar';
        this.chatMessages = [{user:'System',msg:'مرحبا بك في اللعبة!'}];
        this.init();
    }
    init() {
        this.createBubbles();
        this.fillCountries();
        this.setupPages();
        this.setupEvents();
        this.loadUser();
        this.showPage('auth');
    }
    createBubbles() {
        const bubbleShapes = ['♠️','♥️','♦️','♣️','👑'];
        const container = document.getElementById('bubble-container');
        for(let i=0;i<16;i++) {
            const b = document.createElement('span');
            b.className = 'bubble';
            b.textContent = bubbleShapes[Math.floor(Math.random()*bubbleShapes.length)];
            b.style.left = Math.random()*98+'vw';
            b.style.top = (Math.random()*90+5)+'vh';
            b.style.fontSize = (Math.random()*1.5+1.1)+'em';
            b.style.animationDelay = (Math.random()*8)+'s';
            container.appendChild(b);
        }
    }
    fillCountries() {
        const arCountries = [
            {code:'SA',name:'السعودية',dial:'+966'},
            {code:'AE',name:'الإمارات',dial:'+971'},
            {code:'EG',name:'مصر',dial:'+20'},
            {code:'JO',name:'الأردن',dial:'+962'},
            {code:'IQ',name:'العراق',dial:'+964'},
            {code:'MA',name:'المغرب',dial:'+212'},
            {code:'DZ',name:'الجزائر',dial:'+213'},
            {code:'LB',name:'لبنان',dial:'+961'},
            {code:'SY',name:'سوريا',dial:'+963'},
            {code:'OM',name:'عمان',dial:'+968'},
            {code:'YE',name:'اليمن',dial:'+967'},
            {code:'KW',name:'الكويت',dial:'+965'},
            {code:'QA',name:'قطر',dial:'+974'},
            {code:'BH',name:'البحرين',dial:'+973'},
            {code:'SD',name:'السودان',dial:'+249'},
            {code:'LY',name:'ليبيا',dial:'+218'},
            {code:'PS',name:'فلسطين',dial:'+970'},
            {code:'TN',name:'تونس',dial:'+216'},
            {code:'MR',name:'موريتانيا',dial:'+222'}
        ];
        const enCountries = [
            {code:'US',name:'United States',dial:'+1'},
            {code:'GB',name:'United Kingdom',dial:'+44'},
            {code:'FR',name:'France',dial:'+33'},
            {code:'DE',name:'Germany',dial:'+49'},
            {code:'IT',name:'Italy',dial:'+39'},
            {code:'ES',name:'Spain',dial:'+34'},
            {code:'TR',name:'Turkey',dial:'+90'},
            {code:'CN',name:'China',dial:'+86'},
            {code:'RU',name:'Russia',dial:'+7'},
            {code:'IN',name:'India',dial:'+91'},
            {code:'BR',name:'Brazil',dial:'+55'},
            {code:'CA',name:'Canada',dial:'+1'}
        ];
        const select = document.getElementById('countryCode');
        arCountries.concat(enCountries).forEach(c=>{
            const opt = document.createElement('option');
            opt.value = c.dial;
            opt.textContent = `${c.name} (${c.dial})`;
            select.appendChild(opt);
        });
    }
    setupPages() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
                btn.classList.add('active');
                this.showPage(btn.dataset.nav);
                playSound('click');
            }
        });
    }
    setupEvents() {
        document.getElementById('register-form').onsubmit = e => {
            e.preventDefault();
            this.handleRegistration();
        };
        document.getElementById('capture-btn').onclick = () => {
            this.handleBiometric();
        };
        document.getElementById('verify-btn').onclick = () => {
            this.handleEmailVerification();
        };
        document.getElementById('resend-btn').onclick = () => {
            this.resendVerificationCode();
        };
        document.getElementById('save-settings').onclick = () => {
            this.saveSettings();
        };
        document.querySelectorAll('.coins-package').forEach(pkg => {
            pkg.onclick = () => this.showPurchaseModal(pkg.dataset.amount);
        });
        document.querySelectorAll('.level-item').forEach(level => {
            level.onclick = () => this.selectLevel(level.dataset.level);
        });
        document.getElementById('chat-send').onclick = () => {
            this.sendChatMessage();
        };
        document.getElementById('deal-btn').onclick = () => this.startNewRound();
        document.getElementById('bet-btn').onclick = () => this.placeBet();
        document.getElementById('fold-btn').onclick = () => this.fold();
        document.getElementById('restart-btn').onclick = () => this.restartRound();
        setTimeout(() => {
            if (!document.getElementById('sell-coins-btn')) {
                let btn = document.createElement('button');
                btn.className = "gold-button";
                btn.id = "sell-coins-btn";
                btn.textContent = "بيع الكوينزات";
                btn.style.margin = "10px";
                btn.onclick = () => this.showSellModal();
                document.querySelector('.balance-section').appendChild(btn);
            }
        }, 800);
    }
    loadUser() {
        let user = localStorage.getItem('pokerUser');
        if (user) {
            this.user = JSON.parse(user);
            this.balance = this.user.balance;
            this.language = this.user.language || 'ar';
        }
    }
    showPage(page) {
        document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
        document.getElementById(`${page}-page`).style.display = 'block';
        this.currentPage = page;
        document.querySelectorAll('.content-section').forEach(sec=>sec.classList.remove('active'));
        if (page === 'main') document.getElementById('main-content').classList.add('active');
        if (page === 'wallet') document.getElementById('wallet-content').classList.add('active');
        if (page === 'settings') document.getElementById('settings-content').classList.add('active');
        if (page === 'levels') document.getElementById('levels-content').classList.add('active');
        if (page === 'main') this.renderMainPage();
        if (page === 'wallet') this.renderWallet();
        if (page === 'settings') this.renderSettings();
        if (page === 'levels') this.renderLevels();
    }
    handleRegistration() {
        let data = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            country: document.getElementById('countryCode').selectedOptions[0]?.textContent,
            phone: document.getElementById('phone').value.trim(),
            idType: document.querySelector('input[name="idType"]:checked')?.value,
            idDocument: document.getElementById('idDocument').files[0]
        };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{8,15}$/;
        if(!data.firstName || !data.lastName || !emailRegex.test(data.email) || !phoneRegex.test(data.phone) || !data.idDocument) {
            this.showNotif('error','يرجى ملء جميع الحقول بشكل صحيح');
            playSound('fail');
            return;
        }
        document.getElementById('auth-page').style.display='none';
        document.getElementById('biometric-page').style.display='block';
        navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}}).then(stream=>{
            let video=document.getElementById('camera-feed');
            video.srcObject=stream;
        }).catch(()=>{
            this.showNotif('error','لا يمكن الوصول إلى الكاميرا');
            playSound('fail');
        });
        window._regData = data;
    }
    handleBiometric() {
        let guide = document.querySelector('.face-guide');
        if(!window._regData._mov) window._regData._mov=0;
        const movements=['الأعلى','الأسفل','اليمين','اليسار'];
        if(window._regData._mov<movements.length){
            guide.textContent = `يرجى تحريك رأسك إلى ${movements[window._regData._mov]}`;
            window._regData._mov++;
            playSound('click');
            return;
        }
        let video = document.getElementById('camera-feed');
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 260;
        canvas.height = video.videoHeight || 260;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        let imageData = canvas.toDataURL('image/png');
        video.srcObject?.getTracks().forEach(tr=>tr.stop());
        window._regData.selfie = imageData;
        document.getElementById('biometric-page').style.display='none';
        document.getElementById('verify-email-page').style.display='block';
        window._regData.verifyCode = this.verificationCode;
        console.log(`تم إرسال رمز التحقق "${this.verificationCode}" إلى البريد:`, window._regData.email);
        this.showNotif('success','تم أخذ صورة التحقق الحيوي بنجاح!');
        playSound('success');
    }
    handleEmailVerification() {
        let code = document.getElementById('verification-code').value.trim();
        if(code===this.verificationCode){
            this.user = { ...window._regData, balance: this.balance, language: this.language, displayName: window._regData.firstName+' '+window._regData.lastName };
            localStorage.setItem('pokerUser', JSON.stringify(this.user));
            document.getElementById('verify-email-page').style.display='none';
            document.getElementById('main-page').style.display='block';
            this.renderMainPage();
            this.showNotif('success','تم التحقق بنجاح!');
            playSound('success');
        }else{
            this.showNotif('error','رمز التحقق غير صحيح');
            playSound('fail');
        }
    }
    resendVerificationCode() {
        this.showNotif('success','تم إعادة إرسال الكود!');
        playSound('success');
        console.log("رمز التحقق:", this.verificationCode);
    }
    saveSettings() {
        this.user.displayName = document.getElementById('display-name').value;
        this.user.mobile = document.getElementById('mobile-number').value;
        this.user.language = document.getElementById('language-select').value;
        localStorage.setItem('pokerUser', JSON.stringify(this.user));
        this.language = this.user.language;
        this.showNotif('success', 'تم حفظ الإعدادات');
        playSound('success');
    }
    renderMainPage() {
        document.getElementById('user-name').textContent = this.user.displayName || 'لاعب';
        document.getElementById('user-avatar').src = 'avatar.png';
        document.getElementById('current-balance').textContent = this.balance;
        renderPokerTable();
        renderChat(this.chatMessages);
    }
    renderWallet() {
        document.getElementById('current-balance').textContent = this.balance;
    }
    renderSettings() {
        document.getElementById('display-name').value = this.user.displayName || '';
        document.getElementById('mobile-number').value = this.user.mobile || '';
        document.getElementById('language-select').value = this.language;
    }
    renderLevels() {}
    showPurchaseModal(amount) {
        const modal = document.createElement('div');
        modal.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);
        display:flex;align-items:center;justify-content:center;z-index:10000;`;
        modal.innerHTML = `
        <div style="background:#222;padding:34px 22px;border-radius:18px;border:2px solid #ffd700;text-align:center;">
            <h3 class="logo-title">شراء ${amount} 💎</h3>
            <p>اختر طريقة الدفع:</p>
            <button class="gold-button" id="pay-bank">حوالة بنكية (ويسترن يونيون/موني جرام)</button>
            <button class="gold-button" id="pay-wallet">محفظة إلكترونية</button>
            <button class="gold-button" id="pay-admin">شراء من المشرف مباشرة</button>
            <button class="gold-button" id="cancel-pay">إلغاء</button>
        </div>`;
        document.body.appendChild(modal);
        document.getElementById('pay-bank').onclick = () => this.finishPurchase(modal, amount, "حوالة بنكية");
        document.getElementById('pay-wallet').onclick = () => this.finishPurchase(modal, amount, "محفظة إلكترونية");
        document.getElementById('pay-admin').onclick = () => this.finishPurchase(modal, amount, "المشرف مباشرة");
        document.getElementById('cancel-pay').onclick = () => modal.remove();
    }
    finishPurchase(modal, amount, method) {
        modal.remove();
        this.balance += parseInt(amount);
        this.user.balance = this.balance;
        localStorage.setItem('pokerUser', JSON.stringify(this.user));
        this.renderWallet();
        this.showNotif('success', `تم شراء ${amount} 💎 عبر ${method}`);
        playSound('coins');
    }
    showSellModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);
        display:flex;align-items:center;justify-content:center;z-index:10000;`;
        modal.innerHTML = `
        <div style="background:#222;padding:34px 22px;border-radius:18px;border:2px solid #ffd700;text-align:center;">
            <h3 class="logo-title">بيع الكوينزات</h3>
            <input type="number" id="sell-amount" min="10" max="${this.balance}" value="10" style="padding:9px;font-size:16px;margin:10px;">
            <p>اختر طريقة البيع:</p>
            <button class="gold-button" id="sell-bank">تحويل بنكي</button>
            <button class="gold-button" id="sell-admin">بيع للمشرف مباشرة</button>
            <button class="gold-button" id="exchange-money">استبدال بأموال حقيقية</button>
            <button class="gold-button" id="cancel-sell">إلغاء</button>
        </div>`;
        document.body.appendChild(modal);
        document.getElementById('sell-bank').onclick = () => this.finishSell(modal, "تحويل بنكي");
        document.getElementById('sell-admin').onclick = () => this.finishSell(modal, "المشرف مباشرة");
        document.getElementById('exchange-money').onclick = () => this.finishSell(modal, "استبدال بأموال");
        document.getElementById('cancel-sell').onclick = () => modal.remove();
    }
    finishSell(modal, method) {
        let amount = parseInt(document.getElementById('sell-amount').value);
        if (isNaN(amount) || amount < 10 || amount > this.balance) {
            this.showNotif('error', 'أدخل كمية صحيحة للبيع');
            playSound('fail');
            return;
        }
        this.balance -= amount;
        this.user.balance = this.balance;
        localStorage.setItem('pokerUser', JSON.stringify(this.user));
        modal.remove();
        this.renderWallet();
        this.showNotif('success', `تم بيع ${amount} 💎 عبر ${method}`);
        playSound('coins');
    }
    selectLevel(level) {
        this.showNotif('success', `تم اختيار مستوى ${level}`);
        playSound('success');
        dealPokerTable(level, this.user.displayName || 'أنت');
    }
    sendChatMessage() {
        let msg = document.getElementById('chat-input').value;
        if (msg.trim()) {
            this.chatMessages.push({user:this.user.displayName||'أنت',msg});
            renderChat(this.chatMessages);
            document.getElementById('chat-input').value = '';
            playSound('chat');
        }
    }
    startNewRound() {
        let hands = dealPokerHands(window.PokerApp.user.displayName || 'أنت');
        renderPokerTableWithHands(hands);
        let winner = evaluatePokerWinner(hands);
        setTimeout(() => {
            this.showNotif('success', 'الفائز هو: '+winner.player+' ('+winner.rank.name+')');
            playSound('deal');
            if (winner.player === window.PokerApp.user.displayName) {
                this.balance += 100;
                this.user.balance = this.balance;
                localStorage.setItem('pokerUser', JSON.stringify(this.user));
                this.renderWallet();
            }
        }, 1800);
    }
    placeBet() {
        this.showNotif('success', 'تم وضع الرهان');
        playSound('bet');
    }
    fold() {
        this.showNotif('success', 'تم الانسحاب');
        playSound('fold');
    }
    restartRound() {
        this.startNewRound();
        playSound('restart');
    }
    showNotif(type, msg) {
        let notif = document.getElementById('notif');
        notif.innerHTML = `<div class="notification ${type}">${msg}</div>`;
        setTimeout(()=>notif.innerHTML='',2200);
    }
}
window.PokerApp = new PokerApp();