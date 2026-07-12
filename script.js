let isEditMode = false;
let currentColor = '#ffb703'; 
let currentEmoji = '💪💛';       

const templates = {
    default: [
        "推しリク", "SNSで\n曲を共有\n朝", "移動中\nに聴く",
        "YouTube\nMV視聴", "ミュート\nにしない", "SNSで\n曲を共有\n夜",
        "SNSの共有\nURLから聴\nく", "友達・家族\nに\n布教", "寝る前の\n1曲"
    ],
    release: [
        "Shazamで\n検索＆共有\n3回", 
        "各種配信\nサイトで\nDL購入！", 
        "TikTok\n公式音源動画\n投稿\norいいね5回", 
        "新曲入り\nリストを\nストリーミング", 
        "今日も楽しく\n応援した！", 
        "身近な人や\nSNSで\n本日も1布教", 
        "公式タグで\n本日\n3ポスト", 
        "他動画も\n挟みながら\nMV再生3回", 
        "全マス\n埋めた！"
    ]
};

const snowmanColors = ['#ffb703', '#7209b7', '#ffffff', '#4ea8de', '#f97316', '#2a9d8f', '#212529', '#e63946', '#ff69b4'];

function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 140) ? '#1a2b3c' : '#ffffff';
}

function applyTheme(color, emoji) {
    currentColor = color;
    currentEmoji = emoji;
    const textColor = getContrastColor(color);
    
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    document.documentElement.style.setProperty('--border-color', `rgba(${r}, ${g}, ${b}, 0.35)`);
    document.documentElement.style.setProperty('--check-color', color);
    document.documentElement.style.setProperty('--check-text', textColor);

    document.querySelectorAll('.color-dot').forEach(d => {
        if (d.getAttribute('data-color') === color) {
            d.classList.add('active');
        } else {
            d.classList.remove('active');
        }
    });

    const presets = ['#ffb703', '#7209b7', '#ffffff', '#4ea8de', '#f97316', '#2a9d8f', '#212529', '#e63946', '#ff69b4'];
    if (!presets.includes(color)) {
        document.getElementById('customColorWrapper').classList.add('active');
    } else {
        document.getElementById('customColorWrapper').classList.remove('active');
    }
}

function changeTheme(color, emoji) { 
    applyTheme(color, emoji); 
    localStorage.setItem('bingo_theme_color', color);
    localStorage.setItem('bingo_theme_emoji', emoji);
}

function customTheme(color) { 
    applyTheme(color, '✨'); 
    localStorage.setItem('bingo_theme_color', color);
    localStorage.setItem('bingo_theme_emoji', '✨');
}

function checkAllComplete() {
    let checkedCount = 0;
    for (let i = 0; i < 9; i++) {
        if (localStorage.getItem('bingo_checked_' + i) === 'true') {
            checkedCount++;
        }
    }
    if (checkedCount === 9) {
        try {
            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: snowmanColors });
            } else if (window.confetti && typeof window.confetti === 'function') {
                window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: snowmanColors });
            }
        } catch(e) {
            console.log("Confetti processing...");
        }
    }
}

function saveToggleState() {
    const isChecked = document.getElementById('includeConfettiCheck').checked;
    localStorage.setItem('bingo_include_confetti', isChecked);
}

function saveSlotName(slot) {
    const inputVal = document.getElementById(`tmplName${slot}`).value.trim();
    localStorage.setItem(`bingo_my_tmpl_name_${slot}`, inputVal);
}

function updateCustomTmplButtons() {
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`loadBtn${i}`);
        const input = document.getElementById(`tmplName${i}`);
        if (!btn || !input) continue;

        const savedName = localStorage.getItem(`bingo_my_tmpl_name_${i}`) || "";
        input.value = savedName;

        const displayName = savedName !== "" ? savedName : `枠${i}`;
        const savedData = localStorage.getItem(`bingo_my_tmpl_${i}`);
        
        if (savedData) {
            btn.disabled = false;
            btn.innerText = `呼出 (${displayName})`;
        } else {
            btn.disabled = true;
            btn.innerText = `空き`;
        }
    }
}

function loadPreset(key) {
    const data = templates[key] || templates['default'];
    for (let i = 0; i < 9; i++) {
        const textarea = document.querySelector(`#cell-${i} textarea`);
        if (textarea) textarea.value = data[i];
    }
}

function saveMyTemplate(slot) {
    const list = [];
    for (let i = 0; i < 9; i++) {
        const textarea = document.querySelector(`#cell-${i} textarea`);
        list.push(textarea ? textarea.value.trim() : "");
    }
    localStorage.setItem(`bingo_my_tmpl_${slot}`, JSON.stringify(list));
    saveSlotName(slot);
    
    const savedName = localStorage.getItem(`bingo_my_tmpl_name_${slot}`) || `枠${slot}`;
    alert(`「${savedName}」に現在の9マスを保存しました！`);
    updateCustomTmplButtons();
}

function loadMyTemplate(slot) {
    const saved = localStorage.getItem(`bingo_my_tmpl_${slot}`);
    if (!saved) return;
    const data = JSON.parse(saved);
    for (let i = 0; i < 9; i++) {
        const textarea = document.querySelector(`#cell-${i} textarea`);
        if (textarea && data[i] !== undefined) textarea.value = data[i];
    }
}

function deleteMyTemplate(slot) {
    const savedName = localStorage.getItem(`bingo_my_tmpl_name_${slot}`) || `枠${slot}`;
    if (!confirm(`「${savedName}」の保存データを削除してもよろしいですか？`)) return;
    
    localStorage.removeItem(`bingo_my_tmpl_${slot}`);
    localStorage.removeItem(`bingo_my_tmpl_name_${slot}`);
    
    const input = document.getElementById(`tmplName${slot}`);
    if (input) input.value = "";
    
    updateCustomTmplButtons();
    alert("削除しました。");
}

function initBingo() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    const savedTitle = localStorage.getItem('bingo_title') || "❄️ マイ応援BINGO ❄️";
    document.getElementById('bingoTitle').innerText = savedTitle;
    
    let savedDate = localStorage.getItem('bingo_date');
    if (savedDate === null) {
        const today = new Date();
        savedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        localStorage.setItem('bingo_date', savedDate);
    }
    const savedName = localStorage.getItem('bingo_name') || "";
    const savedComment = localStorage.getItem('bingo_comment') || "";
    
    const dateEl = document.getElementById('metaDate');
    const nameEl = document.getElementById('metaName');
    const commentEl = document.getElementById('metaComment');
    const metaContainer = document.querySelector('.card-meta');
    const titleEl = document.getElementById('bingoTitle');
    
    dateEl.innerText = savedDate;
    nameEl.innerText = savedName;
    commentEl.innerText = savedComment;
    
    if (savedDate === "" && savedName === "") { metaContainer.style.display = 'none'; } 
    else { metaContainer.style.display = 'flex'; }

    if (savedComment === "") { commentEl.style.display = 'none'; } 
    else { commentEl.style.display = 'block'; }

    if (savedDate === "" && savedName === "" && savedComment === "") { titleEl.style.marginBottom = '16px'; } 
    else { titleEl.style.marginBottom = '4px'; }
    
    const savedColor = localStorage.getItem('bingo_theme_color') || '#ffb703';
    const savedEmoji = localStorage.getItem('bingo_theme_emoji') || '💪💛';
    applyTheme(savedColor, savedEmoji);

    const savedToggle = localStorage.getItem('bingo_include_confetti');
    if (savedToggle !== null) {
        document.getElementById('includeConfettiCheck').checked = (savedToggle === 'true');
    }

    for (let i = 0; i < 9; i++) {
        const savedText = localStorage.getItem('bingo_cell_text_' + i);
        const text = savedText !== null ? savedText : templates.default[i];
        
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = 'cell-' + i;
        cell.innerText = text;
        
        if (localStorage.getItem('bingo_checked_' + i) === 'true') {
            cell.classList.add('checked');
        }
        
        cell.onclick = function() {
            if (isEditMode) return;
            this.classList.toggle('checked');
            const nowChecked = this.classList.contains('checked');
            localStorage.setItem('bingo_checked_' + i, nowChecked);
            if (nowChecked) checkAllComplete();
        };
        grid.appendChild(cell);
    }
    updateCustomTmplButtons();
}

function toggleEditMode() {
    const grid = document.getElementById('grid');
    const editBtn = document.getElementById('editBtn');
    const shareBtn = document.getElementById('shareBtn');
    const titleEl = document.getElementById('bingoTitle');
    const dateEl = document.getElementById('metaDate');
    const commentEl = document.getElementById('metaComment');
    const metaContainer = document.querySelector('.card-meta');
    const templateArea = document.getElementById('templateArea');
    
    if (!isEditMode) {
        isEditMode = true;
        grid.classList.add('edit-mode');
        editBtn.innerText = '💾 変更を保存する';
        editBtn.style.background = '#4ea8de';
        editBtn.style.color = 'white';
        shareBtn.disabled = true;
        templateArea.style.display = 'block'; 
        
        const currentTitle = titleEl.innerText;
        titleEl.innerHTML = `<input type="text" id="titleInput" value="${currentTitle}" maxLength="25">`;
        titleEl.style.marginBottom = '4px';
        
        metaContainer.style.display = 'flex';
        commentEl.style.display = 'block';
        
        let currentDate = localStorage.getItem('bingo_date') || "";
        const today = new Date();
        const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        
        document.getElementById('metaDate').innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 3px;">
                <input type="text" id="dateInput" class="meta-input" value="${currentDate}" maxLength="12" placeholder="日付（任意）" style="width: 78px; text-align: left;">
                <button type="button" onclick="document.getElementById('dateInput').value='${todayStr}'" style="font-size: 10px; padding: 2px 5px; border: 1px solid #7fa0c0; background: #ffffff; color: #7fa0c0; border-radius: 4px; cursor: pointer; font-family: inherit;">今日</button>
            </div>
        `;
        
        const currentName = localStorage.getItem('bingo_name') || "";
        document.getElementById('metaName').innerHTML = `<input type="text" id="nameInput" class="meta-input" value="${currentName}" maxLength="15" placeholder="名前（任意）">`;
        
        const currentComment = localStorage.getItem('bingo_comment') || "";
        commentEl.innerHTML = `<input type="text" id="commentInput" class="meta-input" value="${currentComment}" maxLength="35" placeholder="一言コメントや説明文を入力（任意）" style="width: 100%; text-align: center;">`;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById('cell-' + i);
            const currentText = cell.innerText;
            cell.classList.remove('checked');
            
            const textarea = document.createElement('textarea');
            textarea.value = currentText;
            textarea.maxLength = 25;
            cell.innerHTML = '';
            cell.appendChild(textarea);
        }
        updateCustomTmplButtons();
    } else {
        isEditMode = false;
        grid.classList.remove('edit-mode');
        editBtn.innerText = '✏️ マス目・タイトルを編集する';
        editBtn.style.background = '#ffffff';
        editBtn.style.color = '#5b799e';
        shareBtn.disabled = false;
        templateArea.style.display = 'none'; 
        
        const titleInput = document.getElementById('titleInput');
        let newTitle = titleInput.value.trim() || "❄️ マイ応援BINGO ❄️";
        localStorage.setItem('bingo_title', newTitle);
        
        localStorage.setItem('bingo_date', document.getElementById('dateInput').value.trim());
        localStorage.setItem('bingo_name', document.getElementById('nameInput').value.trim());
        localStorage.setItem('bingo_comment', document.getElementById('commentInput').value.trim());
        
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById('cell-' + i);
            const textarea = cell.querySelector('textarea');
            let newText = textarea ? textarea.value.trim() : "";
            if (newText === '') newText = templates.default[i];
            localStorage.setItem('bingo_cell_text_' + i, newText);
        }
        initBingo();
    }
}

function clearAllChecks() {
    if (isEditMode) return; 
    if (!confirm("すべてのマスのチェックを消してリセットしますか？")) return;
    for (let i = 0; i < 9; i++) {
        localStorage.setItem('bingo_checked_' + i, 'false');
        const cell = document.getElementById('cell-' + i);
        if (cell) cell.classList.remove('checked');
    }
}

function resetToDefault() {
    if (!confirm("現在の内容を初期状態に戻しますか？\n（入力した文字・チェック・タイトル等はリセットされますが、保存したマイテンプレートは消えません）")) return;
    
    localStorage.removeItem('bingo_title');
    localStorage.removeItem('bingo_date');
    localStorage.removeItem('bingo_name');
    localStorage.removeItem('bingo_comment');
    localStorage.removeItem('bingo_theme_color');
    localStorage.removeItem('bingo_theme_emoji');
    localStorage.removeItem('bingo_include_confetti');
    
    for (let i = 0; i < 9; i++) {
        localStorage.removeItem('bingo_cell_text_' + i);
        localStorage.removeItem('bingo_checked_' + i);
    }

    if (isEditMode) {
        isEditMode = false;
        document.getElementById('grid').classList.remove('edit-mode');
        document.getElementById('editBtn').style.background = '#ffffff';
        document.getElementById('editBtn').style.color = '#5b799e';
        document.getElementById('shareBtn').disabled = false;
        document.getElementById('templateArea').style.display = 'none';
    }
    initBingo();
}

function shareOnX() {
    if (isEditMode) return;
    const card = document.getElementById('bingoCard');
    let checkedCount = 0;
    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById('cell-' + i);
        if (cell && cell.classList.contains('checked')) checkedCount++;
    }
    const includeConfetti = document.getElementById('includeConfettiCheck').checked;

    html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2.5, 
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
            const clonedCard = clonedDoc.getElementById('bingoCard');
            if (clonedCard) {
                clonedCard.style.width = '330px';
                clonedCard.style.margin = '0 auto';
                
                const clonedCells = clonedCard.querySelectorAll('.cell');
                clonedCells.forEach(c => {
                    c.style.height = '94px';
                    c.style.boxSizing = 'border-box';
                    if (c.classList.contains('checked')) {
                        c.style.border = '1px solid transparent';
                    }
                });

                if (checkedCount === 9 && includeConfetti) {
                    for (let k = 0; k < 65; k++) {
                        const fakeItem = clonedDoc.createElement('div');
                        fakeItem.className = 'fake-confetti';
                        fakeItem.style.backgroundColor = snowmanColors[Math.floor(Math.random() * snowmanColors.length)];
                        fakeItem.style.left = (Math.random() * 90 + 5) + '%';
                        fakeItem.style.top = (Math.random() * 90 + 5) + '%';
                        const size = (Math.random() * 6 + 6) + 'px';
                        fakeItem.style.width = size; fakeItem.style.height = size;
                        if (Math.random() > 0.5) { fakeItem.classList.add('circle'); } 
                        else { fakeItem.style.transform = `rotate(${Math.random() * 360}deg)`; }
                        clonedCard.appendChild(fakeItem);
                    }
                }
            }
        }
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        document.getElementById('modalImage').src = imgData;
        const currentTitle = localStorage.getItem('bingo_title') || "マイ応援BINGO";
        const url = window.location.href;
        
        const text = `🎧 ${currentTitle} 🎧\n\n【${checkedCount}/9 クリア！】\n\nマイビンゴで楽しく応援中⛄️✨\n\n#SnowMan #応援タスクBINGO`;
        document.getElementById('modalShareBtn').onclick = () => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        };
        document.getElementById('modalShareThreadsBtn').onclick = () => {
            window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
        };
        document.getElementById('shareModal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('shareModal').style.display = 'none'; }

initBingo();
