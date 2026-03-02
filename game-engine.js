/* --------配色／字級設定區（可自行調整）-------- */
/* <======== 檔案用途：遊戲核心邏輯與狀態管理 ======== > */

/* ================================================================
   【 ⚙️ GAME ENGINE - 最終完美版 】
   ================================================================ */
const GameEngine = {
    state: {
        score: 0,
        items: ['👕 粗製布衣'],
        location: '⛺ 新手村',
        status: '📦 檢整裝備中',
        achievements: [],
        weaponType: null,
        currentTrial: 0,
        examDate: null,      
        examDateLocked: false,
        resultDate: null,    
        resultDateLocked: false,
        bankDate: null,
        bankDateLocked: false,
        appointmentTime: "2026-03-09 10:00", 
        appointmentLocation: "等待公會發布..."
    },

    ranks: [
        { min: 101, title: "💎 SS級 神話級玩家" },
        { min: 96,  title: "🌟 S級 傳說級玩家" },
        { min: 80,  title: "🟢 A級 菁英玩家" },
        { min: 60,  title: "🥇 B級 穩健玩家" },
        { min: 40,  title: "🥈 C級 潛力玩家" },
        { min: 20,  title: "🥉 D級 基礎學徒" },
        { min: 10,  title: "🌱 實習小萌新" },
        { min: 0,   title: "🥚 報到新手村" }
    ],

    armorPath: ['👕 粗製布衣', '🧥 強化布衫', '🥋 實習皮甲', '🦺 輕型鎖甲', '🛡️ 鋼鐵重甲', '💠 秘銀胸甲', '🛡️ 聖光戰鎧', '🌟 永恆守護鎧'],
    
    weaponPaths: {
        '🗡️ 精鋼短劍': '⚔️ 騎士長劍', '⚔️ 騎士長劍': '⚔️ 破甲重劍', '⚔️ 破甲重劍': '🗡️ 聖光戰劍', '🗡️ 聖光戰劍': '👑 王者之聖劍',
        '🏹 獵人短弓': '🏹 精靈長弓', '🏹 精靈長弓': '🏹 迅雷連弓', '🏹 迅雷連弓': '🏹 追風神弓', '🏹 追風神弓': '☄️ 破曉流星弓',
        '🔱 鐵尖長槍': '🔱 鋼鐵戰矛', '🔱 鋼鐵戰矛': '🔱 破陣重矛', '🔱 破陣重矛': '🔱 龍膽銀槍', '🔱 龍膽銀槍': '🐉 滅世龍吟槍'
    },

    trialsData: {
        1: { progGain: 16, loc: '🏰 登錄公會', scoreGain: 16 },
        2: { progGain: 16, loc: '📁 裝備盤點', scoreGain: 16 },
        3: { progGain: 21, loc: '🛡️ 裝備鑑定所', scoreGain: 21 },
        4: { progGain: 16, loc: '🎒 出征準備營', scoreGain: 16 },
        5: { progGain: 14, loc: '💼 契約祭壇', scoreGain: 16 },
        6: { progGain: 0,  loc: '👑 榮耀殿堂', scoreGain: 0 }
    },

    init() {
        try {
            const saved = localStorage.getItem('hero_progress');
            if (saved) { this.state = Object.assign({}, this.state, JSON.parse(saved)); }
        } catch (e) { localStorage.removeItem('hero_progress'); }
        this.injectGlobalCSS();
        setTimeout(() => { this.updateUI(); }, 50);

        // 🌟 隱藏彩蛋：加上 ?delay=1 網址參數，直接觸發奪命連環閃警告！
        if (window.location.search.includes('delay=1')) {
            setTimeout(() => this.showDelayWarning(), 500);
        }
    },

    injectGlobalCSS() {
        if (document.getElementById('game-fx-style')) return;
        const style = document.createElement('style');
        style.id = 'game-fx-style';
        style.innerHTML = `
            @keyframes floatUp {
                0% { opacity: 0; transform: translateY(0) scale(0.5); }
                20% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                100% { opacity: 0; transform: translateY(-60px) scale(1); }
            }
            .floating-text {
                position: fixed; pointer-events: none; color: #fbbf24;
                font-weight: bold; font-size: 28px; text-shadow: 0 0 10px rgba(251,191,36,0.8);
                z-index: 10000; animation: floatUp 1.5s forwards;
            }
            @keyframes shinyUpdate {
                0% { filter: brightness(1); transform: scale(1); color: inherit; }
                40% { filter: brightness(2); transform: scale(1.3); color: #ffffff; text-shadow: 0 0 15px #fbbf24, 0 0 30px #fbbf24, 0 0 45px #fbbf24; }
                60% { filter: brightness(2); transform: scale(1.3); color: #ffffff; text-shadow: 0 0 15px #fbbf24, 0 0 30px #fbbf24, 0 0 45px #fbbf24; }
                100% { filter: brightness(1); transform: scale(1); color: inherit; }
            }
            .shiny-effect { animation: shinyUpdate 1s ease-in-out; display: inline-block; }
            .game-toast {
                position: fixed; bottom: 20px; right: -300px;
                background: #1a1a1a; color: #efefef; border: 1px solid #fbbf24;
                padding: 12px 20px; border-radius: 8px; z-index: 9999;
                transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 5px 15px rgba(0,0,0,0.5); font-weight: bold;
            }
            .game-toast.show { right: 20px; }
        `;
        document.head.appendChild(style);
    },

    // 🌟 針對單一特定元素進行閃爍特效
    flashElement(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('shiny-effect');
            void el.offsetWidth;
            el.classList.add('shiny-effect');
        }
    },

    // 🌟 主線防具與奇遇武器的專屬升級邏輯 (武器嚴格從頭升起)
    upgradeArmor() {
        let currentArmor = this.state.items.find(item => this.armorPath.includes(item));
        if (currentArmor) {
            let idx = this.armorPath.indexOf(currentArmor);
            if (idx < this.armorPath.length - 1) {
                let nextArmor = this.armorPath[idx + 1];
                this.state.items = this.state.items.map(item => item === currentArmor ? nextArmor : item);
                return true;
            }
        }
        return false;
    },

    upgradeWeapon() {
        let currentWeapon = this.state.items.find(item => Object.keys(this.weaponPaths).includes(item) || Object.values(this.weaponPaths).includes(item));
        if (currentWeapon && this.weaponPaths[currentWeapon]) {
            let nextWeapon = this.weaponPaths[currentWeapon];
            this.state.items = this.state.items.map(item => item === currentWeapon ? nextWeapon : item);
            return true;
        }
        return false;
    },

    // 🌟 延宕奪命連環閃警告動畫
    showDelayWarning() {
        if(document.getElementById('delay-warning-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'delay-warning-overlay';
        overlay.innerHTML = `<div class="warning-icon">⚠️ 警告</div><div class="warning-text">進度延宕，冒險積分持續流失中..</div>`;
        document.body.appendChild(overlay);
        
        void overlay.offsetWidth;
        overlay.classList.add('active');
        
        setTimeout(() => { overlay.querySelector('.warning-text').classList.add('show'); }, 1500); 
        
        overlay.onclick = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };
    },

    // 💰 解鎖機制 (大摺疊、小摺疊、隱藏武器、防具彩蛋)
    unlock(event, id, action) {
        if (this.state.achievements.includes(id)) return;
        
        let scoreGain = 0;
        let toastMsg = "";
        let alertMsg = "";
        let doFlashItem = false; 
        
        if (action === 'large_fold') {
            scoreGain = 2;
            alertMsg = `🔔 發現隱藏關卡，冒險積分 +${scoreGain}`;
        } else if (action === 'explore1') {
            scoreGain = 1;
            toastMsg = `✨ 深入探索，冒險積分+${scoreGain}`;
        } else if (action === 'explore2') {
            scoreGain = 1;
            toastMsg = `🧩 獲得情報，冒險積分 +${scoreGain}`;
        } else if (action === 'explore_armor') {
            scoreGain = 1;
            toastMsg = `✨ 防具升級，冒險積分+${scoreGain}`;
            if (this.upgradeArmor()) doFlashItem = true; 
        } else if (action === 'random_weapon') {
            scoreGain = 1; 
            const weapons = ['🗡️ 精鋼短劍', '🏹 獵人短弓', '🔱 鐵尖長槍'];
            const w = weapons[Math.floor(Math.random() * weapons.length)];
            this.state.weaponType = w;
            this.state.items.push(w);
            toastMsg = `⚔️ 獲得武器：${w}，戰力大幅提升！`;
            doFlashItem = true;
        }

        if (alertMsg) { alert(alertMsg); }

        this.createFloatingText(event, `+${scoreGain}`);
        this.state.achievements.push(id);
        this.state.score += scoreGain;
        this.save();
        
        setTimeout(() => {
            if (toastMsg) this.showToast(toastMsg);
            this.updateUI();
            
            if (scoreGain > 0 && action !== 'random_weapon') {
                this.flashElement('score-text');
            }
            if (doFlashItem) {
                this.flashElement('item-text'); 
                this.flashElement('rank-name'); 
            }
        }, 1000);
    },

    createFloatingText(e, text) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.innerText = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'game-toast';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000); 
    },

    save() { localStorage.setItem('hero_progress', JSON.stringify(this.state)); },

    updateUI() {
        const rank = this.ranks.find(r => this.state.score >= r.min) || this.ranks[this.ranks.length - 1];
        const rEl = document.getElementById('rank-text');
        const sEl = document.getElementById('status-tag');
        
        if (rEl) rEl.innerHTML = `<span style="color:#fbbf24;">戰力：</span><span id="rank-name">${rank.title}</span>　｜　<span style="color:#fbbf24;">關卡：</span><span id="loc-text">${this.state.location}</span>`;
        if (sEl) sEl.innerHTML = `<span style="color:#8ab4f8;">道具：</span><span id="item-text">${this.state.items.join(' ')}</span>　｜　<span style="color:#8ab4f8;">狀態：</span><span id="dyn-status">${this.state.status}</span>`;
        
        const scoreEl = document.getElementById('score-text');
        if (scoreEl) scoreEl.innerText = this.state.score + "分";
        const scoreFill = document.getElementById('score-fill');
        if (scoreFill) scoreFill.style.width = Math.min(this.state.score, 100) + "%";

        // 🌟 逼死強迫症：非整數進度條計算 (83% 主線 + 17% 隱藏)
        let currentProg = 0;
        for(let i=1; i<=this.state.currentTrial; i++) {
            if(i <= 5) currentProg += this.trialsData[i].progGain;
        }
        if(this.state.achievements.includes('faq_main')) currentProg += 6;
        if(this.state.achievements.includes('onboard_main')) currentProg += 6;
        if(this.state.achievements.includes('pg2-m-1')) currentProg += 5;
        currentProg = Math.min(100, currentProg);

        const progVal = document.getElementById('prog-val');
        if (progVal) progVal.innerText = currentProg + "%";
        const progFill = document.getElementById('prog-fill');
        if (progFill) progFill.style.width = currentProg + "%";

        this.updateDateControls();
        const timeEl = document.getElementById('dyn-apt-time');
        if (timeEl) timeEl.innerText = this.state.appointmentTime;
        this.updateButtonStyles();
    },

    updateDateControls() {
        const d1 = document.getElementById('input-exam-date');
        const b1 = document.getElementById('btn-lock-exam');
        if (d1 && b1) {
            d1.value = this.state.examDate || "";
            if (this.state.examDateLocked) { d1.disabled = true; b1.innerText = "已鎖定"; b1.disabled = true; b1.style.opacity = "0.5"; }
        }
        const d2 = document.getElementById('input-result-date');
        const b2 = document.getElementById('btn-lock-result');
        if (d2 && b2) {
            d2.value = this.state.resultDate || "";
            if (this.state.resultDateLocked) { d2.disabled = true; b2.innerText = "已鎖定"; b2.disabled = true; b2.style.opacity = "0.5"; }
        }
        const d3 = document.getElementById('input-bank-date');
        const b3 = document.getElementById('btn-lock-bank');
        if (d3 && b3) {
            d3.value = this.state.bankDate || "";
            if (this.state.bankDateLocked) { d3.disabled = true; b3.innerText = "已鎖定"; b3.disabled = true; b3.style.opacity = "0.5"; }
        }
    },

    lockDate(type) {
        const id = type === 'exam' ? 'input-exam-date' : type === 'result' ? 'input-result-date' : 'input-bank-date';
        const val = document.getElementById(id).value;
        if (!val) { alert("請先選擇日期！"); return; }
        
        const confirmLock = confirm("鎖定就不能更改了喔，確定要鎖定嗎？");
        if (!confirmLock) return;

        if (type === 'exam') { this.state.examDate = val; this.state.examDateLocked = true; }
        else if (type === 'result') { this.state.resultDate = val; this.state.resultDateLocked = true; }
        else if (type === 'bank') { this.state.bankDate = val; this.state.bankDateLocked = true; }
        
        this.save(); 
        this.updateUI();
    },

    requestChange() {
        const val = document.getElementById('input-change-date').value;
        if (!val) return;
        alert("🚨 已送出申請，請私訊人資承辦，核准後將為您解鎖，會因此扣分喔！");
        const btn = document.getElementById('btn-lock-change');
        if (btn) { btn.disabled = true; btn.innerText = "申請"; btn.style.opacity = "0.5"; }
    },

    canUnlockTrial5() {
        if (!this.state.appointmentTime || this.state.appointmentTime.includes("等待")) return { can: false, reason: "⚠️ 尚未發布報到時間。" };
        const now = new Date();
        const aptDate = new Date(this.state.appointmentTime);
        const openTime = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate(), 8, 0, 0);
        if (now < openTime) return { can: false, reason: `⚠️ 營地大門深鎖，請於報到日 (${aptDate.toLocaleDateString()}) 08:00 後再來。` };
        return { can: true };
    },

    completeTrial(event, trialNum) {
        if (this.state.currentTrial >= trialNum) return;
        if (trialNum === 5 && !this.canUnlockTrial5().can) { alert(this.canUnlockTrial5().reason); return; }
        
        const tData = this.trialsData[trialNum];
        this.state.currentTrial = trialNum;
        this.state.location = tData.loc;
        this.state.score += tData.scoreGain;
        
        // 🌟 武器嘲諷判定：第 6 關身上還是沒武器
        if (trialNum === 6) {
            const hasWeapon = this.state.items.some(item => Object.keys(this.weaponPaths).includes(item) || Object.values(this.weaponPaths).includes(item) || ['👑 王者之聖劍', '☄️ 破曉流星弓', '🐉 滅世龍吟槍'].includes(item));
            if (!hasWeapon) {
                alert("📝 系統判定：\n勇者雖已通關，但未詳閱《鍛造秘笈》，\n仍全程赤手空拳完成試煉...敬佩！敬佩！");
            }
        }
        
        let doFlashItem = false;
        if (this.upgradeArmor()) doFlashItem = true;
        if (this.upgradeWeapon()) doFlashItem = true;

        this.save(); 
        this.updateUI();

        if (doFlashItem) this.flashElement('item-text');
        this.flashElement('loc-text');
        this.flashElement('prog-val');
        this.flashElement('score-text');

        // 🌟 通用過關通知區分
        if(trialNum === 3) {
            this.showToast('📣 此階段任務已完成，請稍待鑑定！');
        } else {
            this.showToast('📣 此階段任務已完成，請繼續前進！');
        }
    },

    updateButtonStyles() {
        const lockedTexts = {
            1: "🔒 啟程點・已封印",
            2: "🔒 行囊區・已封印",
            3: "⏳ 鑑定所・審核中",
            4: "🔒 前線營・已就緒",
            5: "📜 誓約日・已締約",
            6: "👑 聖殿區・已加冕"
        };
        
        const trials = [1, 2, 3, 4, 5, 6];
        trials.forEach(n => {
            const btn = document.getElementById(`btn-trial-${n}`);
            const detailsBlock = document.getElementById(`detail-trial-${n}`);
            
            if (btn) {
                if (this.state.currentTrial >= n) {
                    btn.disabled = true;
                    btn.innerText = lockedTexts[n];
                    
                    if (detailsBlock) {
                        const inputs = detailsBlock.querySelectorAll('input');
                        inputs.forEach(input => {
                            input.disabled = true;
                            if(input.type === 'checkbox' || input.type === 'radio') {
                                input.style.opacity = "0.5";
                                input.style.cursor = "not-allowed";
                            }
                        });
                    }
                }
            }
            
            // 🌟 關卡順序防偷跑解鎖邏輯
            if (detailsBlock) {
                if (n === 1) {
                    detailsBlock.classList.remove('locked-details');
                } else {
                    if (this.state.currentTrial >= n - 1) {
                        detailsBlock.classList.remove('locked-details');
                    } else {
                        detailsBlock.classList.add('locked-details');
                        detailsBlock.removeAttribute('open'); // 強制關閉並鎖定
                    }
                }
            }
        });
    }
};
window.addEventListener('load', () => GameEngine.init());
