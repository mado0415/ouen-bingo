let isEditMode = false;
let currentColor = '#ffb703'; 
let currentEmoji = '💪💛';       

const defaultTasks = [
    "朝の\n1再生", "SNSで\n曲を共有", "通勤・通学\nに聴く",
    "YouTube\nMV視聴", "ミュート\nにしない", "お風呂で\n1曲",
    "SNSの共有\nURLから聴く", "友達・家族に\n布教", "寝る前の\n1曲"
];

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
    const borderColor = `rgba(${r}, ${g}, ${b}, 0.25)`;
    
    document.documentElement.style.setProperty('--check-color', color);
    document.documentElement.style.setProperty('--check-text', textColor);
    document.documentElement.style.setProperty('--border-color', borderColor); 

    document.querySelectorAll('.color-dot').forEach(d => {
        if (d.getAttribute('data-color') === color) {
            d.classList.add('active');
        } else {
            d.classList.remove('active');
        }
    });

    const presets = ['#ffb703', '#7209b7', '#e2e8f0', '#4ea8de', '#f97316', '#2a9d8f', '#212529', '#e63946', '#ff69b4'];
    if (!presets.includes(color)) {
        document.getElementById('customColorWrapper').classList.add('active');
    } else {
        document.getElementById('customColorWrapper').classList.remove('active');
    }
}

function changeTheme(color, emoji) {
    applyTheme(color, emoji);
}

function customTheme(color) {
    applyTheme(color, '✨'); 
}

// 🎉 全マスチェック時の紙吹雪演出（常にSnow Manのメンカラ9色）
function checkAllComplete() {
    let checkedCount = 0;
    for (let i = 0; i < 9; i++) {
        if (localStorage.getItem('bingo_checked_' + i) === 'true') {
            checkedCount++;
        }
    }
    
    if (checkedCount === 9) {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 180, 
                spread: 100,
                origin: { y: 0.6 },
                colors: [
                    '#ffb703', // 岩本照くん (黄)
                    '#7209b7', // 深澤辰哉くん (紫)
                    '#ffffff', // ラウールくん (白)
                    '#4ea8de', // 渡辺翔太くん (青)
                    '#f97316', // 向井康二くん (オレンジ)
                    '#2a9d8f', // 阿部亮平くん (緑)
                    '#212529', // 目黒蓮くん (黒)
                    '#e63946', // 宮舘涼太くん (赤)
                    '#ff69b4'  // 佐久間大介くん (ピンク)
                ]
            });
        }
    }
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
    
    if (savedDate === "" && savedName === "") {
        metaContainer.style.display = 'none';
    } else {
        metaContainer.style.display = 'flex';
    }

    if (savedComment === "") {
        commentEl.style.display = 'none';
    } else {
        commentEl.style.display = 'block';
    }

    if (savedDate === "" && savedName === "" && savedComment === "") {
        titleEl.style.marginBottom = '16px';
    } else {
        titleEl.style.marginBottom = '4px';
    }
    
    const savedColor = localStorage.getItem('bingo_theme_color') || '#ffb703';
    const savedEmoji = localStorage.getItem('bingo_theme_emoji') || '💪💛';
    applyTheme(savedColor, savedEmoji);

    for (let i = 0; i < 9; i++) {
        const savedText = localStorage.getItem('sumin_task_' + i);
        const text = savedText !== null ? savedText : defaultTasks[i];
        
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = 'cell-' + i;
        cell.innerText = text;
        
        const isChecked = localStorage.getItem('bingo_checked_' + i) === 'true';
        if (isChecked) {
            cell.classList.add('checked');
        }
        
        cell.onclick = function() {
            if (isEditMode) return;
            this.classList.toggle('checked');
            const nowChecked = this.classList.contains('checked');
            localStorage.setItem('bingo_checked_' + i, nowChecked);
            
            if (nowChecked) {
                checkAllComplete();
            }
        };
        grid.appendChild(cell);
    }
}

function toggleEditMode() {
    const grid = document.getElementById('grid');
    const editBtn = document.getElementById('editBtn');
    const shareBtn = document.getElementById('shareBtn');
    const titleEl = document.getElementById('bingoTitle');
    const dateEl = document.getElementById('metaDate');
    const nameEl = document.getElementById('metaName');
    const commentEl = document.getElementById('metaComment');
    const metaContainer = document.querySelector('.card-meta');
    
    if (!isEditMode) {
        isEditMode = true;
        grid.classList.add('edit-mode');
        editBtn.innerText = '💾 変更を保存する';
        editBtn.style.background = '#4ea8de';
        editBtn.style.color = 'white';
        shareBtn.disabled = true;
        
        const currentTitle = titleEl.innerText;
        titleEl.innerHTML = `<input type="text" id="titleInput" value="${currentTitle}" maxLength="25">`;
        titleEl.style.marginBottom = '4px';
        
        metaContainer.style.display = 'flex';
        commentEl.style.display = 'block';
        
        let currentDate = localStorage.getItem('bingo_date');
        if (currentDate === null) {
            const today = new Date();
            currentDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        }
        
        const today = new Date();
        const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        
        dateEl.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 3px;">
                <input type="text" id="dateInput" class="meta-input" value="${currentDate}" maxLength="12" placeholder="日付（任意）" style="width: 78px; text-align: left;">
                <button type="button" onclick="document.getElementById('dateInput').value='${todayStr}'" style="font-size: 10px; padding: 2px 5px; border: 1px solid var(--sub-text); background: #ffffff; color: var(--sub-text); border-radius: 4px; cursor: pointer; font-family: inherit;">今日</button>
            </div>
        `;
        
        const currentName = localStorage.getItem('bingo_name') || "";
        nameEl.innerHTML = `<input type="text" id="nameInput" class="meta-input" value="${currentName}" maxLength="15" placeholder="名前（任意）">`;
        
        const currentComment = localStorage.getItem('bingo_comment') || "";
        commentEl.innerHTML = `<input type="text" id="commentInput" class="meta-input" value="${currentComment}" maxLength="35" placeholder="一言コメントや説明文を入力（任意）" style="width: 100%; text-align: center;">`;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById('cell-' + i);
            const currentText = cell.innerText;
            cell.classList.remove('checked');
            
            const textarea = document.createElement('textarea');
            textarea.value = currentText;
            textarea.maxLength = 20;
            cell.innerHTML = '';
            cell.appendChild(textarea);
        }
    } else {
        isEditMode = false;
        grid.classList.remove('edit-mode');
        editBtn.innerText = '✏️ マス目・タイトルを編集する';
        editBtn.style.background = '#ffffff';
        editBtn.style.color = 'var(--sub-text)';
        shareBtn.disabled = false;
        
        const titleInput = document.getElementById('titleInput');
        let newTitle = titleInput.value.trim() || "❄️ マイ応援BINGO ❄️";
        localStorage.setItem('bingo_title', newTitle);
        
        const dateInput = document.getElementById('dateInput');
        let newDate = dateInput.value.trim();
        localStorage.setItem('bingo_date', newDate);
        
        const nameInput = document.getElementById('nameInput');
        let newName = nameInput.value.trim();
        localStorage.setItem('bingo_name', newName);
        
        const commentInput = document.getElementById('commentInput');
        let newComment = commentInput.value.trim();
        localStorage.setItem('bingo_comment', newComment);
        
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById('cell-' + i);
            const textarea = cell.querySelector('textarea');
            let newText = textarea.value.trim();
            
            if (newText === '') {
                newText = defaultTasks[i];
            }
            localStorage.setItem('sumin_task_' + i, newText);
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
    if (!confirm("すべて初期状態に戻しますか？\n（入力した文字・チェックもすべて消去されます）")) return;
    
    localStorage.removeItem('bingo_title');
    localStorage.removeItem('bingo_date');
    localStorage.removeItem('bingo_name');
    localStorage.removeItem('bingo_comment');
    localStorage.removeItem('bingo_theme_color');
    localStorage.removeItem('bingo_theme_emoji');
    localStorage.removeItem('bingo_clear_count');
    for (let i = 0; i < 9; i++) {
        localStorage.removeItem('sumin_task_' + i);
        localStorage.removeItem('bingo_checked_' + i);
    }
    
    if (isEditMode) {
        isEditMode = false;
        const grid = document.getElementById('grid');
        const editBtn = document.getElementById('editBtn');
        const shareBtn = document.getElementById('shareBtn');
        
        grid.classList.remove('edit-mode');
        editBtn.innerText = '✏️ マス目・タイトルを編集する';
        editBtn.style.background = '#ffffff';
        editBtn.style.color = 'var(--sub-text)';
        shareBtn.disabled = false;
    }
    initBingo();
}

function shareOnX() {
    if (isEditMode) return;
    const card = document.getElementById('bingoCard');
    
    html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
            const clonedCard = clonedDoc.getElementById('bingoCard');
            if (clonedCard) {
                clonedCard.style.width = '330px';
                clonedCard.style.margin = '0 auto';
            }
            const clonedCells = clonedDoc.querySelectorAll('.cell');
            clonedCells.forEach(cell => {
                cell.style.fontSize = '11.5px';
                cell.style.lineHeight = '1.3';
            });
            const clonedMetas = clonedDoc.querySelectorAll('.card-meta span, .card-comment');
            clonedMetas.forEach(meta => {
                meta.style.fontSize = '11px';
            });
        }
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        document.getElementById('modalImage').src = imgData;
        
        let checkedCount = 0;
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById('cell-' + i);
            if (cell.classList.contains('checked')) {
                checkedCount++;
            }
        }
        
        const currentTitle = localStorage.getItem('bingo_title') || "マイ応援BINGO";
        const url = window.location.href;
        
        const xText = `🎧 ${currentTitle} 🎧\n\n【${checkedCount}/9 クリア！】\n\nマイビンゴで楽しく応援中⛄️✨\n\n#SnowMan #応援タスクBINGO`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(url)}`;
        
        document.getElementById('modalShareBtn').onclick = function() {
            window.open(twitterUrl, '_blank');
        };
        
        const threadsText = `🎧 ${currentTitle} 🎧\n\n【${checkedCount}/9 クリア！】\n\nマイビンゴで楽しく応援中⛄️✨\n\n#SnowMan #応援タスクBINGO\n${url}`;
        const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsText)}`;
        
        document.getElementById('modalShareThreadsBtn').onclick = function() {
            window.open(threadsUrl, '_blank');
        };
        document.getElementById('shareModal').style.display = 'flex';
    });
}

function closeModal() {
    document.getElementById('shareModal').style.display = 'none';
}

initBingo();
