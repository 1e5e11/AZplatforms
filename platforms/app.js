var content = [
    // 为项目补上图标时，将 icon 设置为 .ico、.png 或 .svg 图片路径。
    { type: "", t: "AZ Platforms", s: "点击 docs 查看更多信息", d: "", o: "https://ssssssss.eu.org/", g: "https://ssssssss.eu.org/docs", ai: 1, firstDev: "2026-08-23", lastUpdate: "", icon: "" },
    { type: "函数画板", t: "啊这函数画板", s: "推荐使用啊这函数画板", d: "", o: "http://h.ssssssss.eu.org/", g: "http://h.ssssssss.eu.org/v/19/course.txt", ai: 0, firstDev: "2022-04-23", lastUpdate: "2025-03-07", icon: "http://h.ssssssss.eu.org/v/19/az-128.ico" },
    { type: "数学工具", t: "啊这数字性质查看器", s: "AZNumberChecker", d: "", o: "https://ssssssss.eu.org/n/", g: "#", ai: 0, firstDev: "2025-07-21", lastUpdate: "", icon: "" },
    { type: "游戏", t: "啊这猜数字游戏", s: "AZNumberGuess", d: "", o: "https://ssssssss.eu.org/ng/", g: "#", ai: 0, firstDev: "2025-11-08", lastUpdate: "", icon: "" },
    { type: "ai", t: "啊这手写数字识别", s: "AZ Number Recognition", d: "", o: "https://ssssssss.eu.org/nr/", g: "#", ai: 1, firstDev: "2026-09-15", lastUpdate: "2026-09-15", icon: ""  },
    { type: "游戏", t: "啊这扫雷", s: "生成无猜布局", d: "", o: "https://minesweeper.ssssssss.eu.org/", g: "#", ai: 1, firstDev: "2026-06-14", lastUpdate: "2026-08-04", icon: "" },
    { type: "工具", t: "啊这翻译器", s: "啊这生草器", d: "", o: "https://bjsdfz.ssssssss.eu.org/mdy/", g: "#", ai: 0, firstDev: "2023", lastUpdate: "", icon: "" },
    { type: "工具", t: "红楼梦人物关系查询", s: "", d: "", o: "https://bjsdfz.ssssssss.eu.org/hongloumeng/", g: "#", ai: 0, firstDev: "2024-09-01", lastUpdate: "", icon: "" },
    { type: "工具", t: "啊这起始页", s: "", d: "", o: "https://qsy.ssssssss.eu.org/", g: "#", ai: 0, firstDev: "2022-02", lastUpdate: "", icon: "https://qsy.ssssssss.eu.org/img/az-128.ico" },
    { type: "", t: "AZOS", s: "", d: "", o: "https://bjsdfz.ssssssss.eu.org/azos", g: "#", ai: 0, firstDev: "2021-10", lastUpdate: "", icon: "" },
    { type: "工具", t: "啊这字符复制", s: "复制字符、公式、花体", d: "", o: "https://ssssssss.eu.org/copy/", g: "#", ai: 1, firstDev: "2026-09-06", lastUpdate: "2026-10-02", icon: ""  },
    { type: "工具", t: "啊这md文档编辑器", s: "", d: "", o: "https://ssssssss.eu.org/md/", g: "#", ai: 1, firstDev: "2026-09-12", lastUpdate: "2026-11-02", icon: ""  },
    { type: "工具", t: "WeaponOObeUI", s: "use ai in browser", d: "", o: "https://ssssssss.eu.org/WeaponOObeUI/", g: "#", ai: 1, firstDev: "2026-09-28", lastUpdate: "2026-10-20", icon: ""  },
    { type: "ai", t: "AZAI", s: "AZ Intelligence", d: "", o: "https://ai.realgeneral.eu.org", g: "#", ai: 1, firstDev: "2026-10-01", lastUpdate: "2026-10-01", icon: "http://ssssssss.eu.org/ai/frontend-256.ico"  },
    { type: "ai", t: "AZ presented", s: "AZ blog", d: "", o: "https://ssssssss.eu.org/AZpresented", g: "#", ai: 1, firstDev: "2026-10-31", lastUpdate: "2026-11-02", icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='3' fill='%23fff'/%3E%3Cpath d='M14 46 L32 16 L50 46 Z' fill='none' stroke='%237c0a21' stroke-width='3'/%3E%3Ccircle cx='32' cy='38' r='4' fill='%237c0a21'/%3E%3C/svg%3E"  },
];

function openjc(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

function dateValue(value) {
    if (!value) return 0;
    var parts = value.split('-');
    return Number(parts[0]) * 10000 + Number(parts[1] || 1) * 100 + Number(parts[2] || 1);
}

function sortedContent(mode) {
    return content.map(function (item, index) {
        return { item: item, index: index };
    }).sort(function (a, b) {
        var difference = 0;
        if (mode === 'latest') {
            difference = dateValue(b.item.lastUpdate || b.item.firstDev) - dateValue(a.item.lastUpdate || a.item.firstDev);
        } else if (mode === 'earliest') {
            difference = dateValue(b.item.firstDev) - dateValue(a.item.firstDev);
        }
        return difference || a.index - b.index;
    }).map(function (entry) { return entry.item; });
}

function layoutCards() {
    var wrap = document.getElementById('cardarea');
    var canvas = wrap.firstElementChild;
    if (!canvas) return;
    var gap = 16;
    var pad = 8;
    var cardHeight = 260;
    var width = Math.min(360, wrap.clientWidth - pad * 2);
    var columns = Math.max(1, Math.floor((wrap.clientWidth - pad * 2 + gap) / (width + gap)));
    var left = Math.max(pad, (wrap.clientWidth - columns * width - (columns - 1) * gap) / 2);
    var cards = canvas.children;
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.left = left + (i % columns) * (width + gap) + 'px';
        cards[i].style.top = pad + Math.floor(i / columns) * (cardHeight + gap) + 'px';
        cards[i].style.width = width + 'px';
    }
    var rows = Math.ceil(cards.length / columns);
    canvas.style.height = pad * 2 + rows * cardHeight + Math.max(0, rows - 1) * gap + 'px';
}

function render() {
    var wrap = document.getElementById('cardarea');
    var mode = document.getElementById('sort-order').value;
    var canvas = document.createElement('div');
    canvas.className = 'card-canvas';

    sortedContent(mode).forEach(function (it) {
        var card = document.createElement('article');
        card.className = 'card';
        if (it.icon) {
            var iconImage = document.createElement('img');
            iconImage.className = 'card-bg-icon';
            iconImage.src = it.icon;
            iconImage.alt = '';
            iconImage.onerror = function () { this.hidden = true; };
            iconImage.setAttribute('aria-hidden', 'true');
            card.appendChild(iconImage);
        }

        var header = document.createElement('div');
        header.className = 'card-header';
        var heading = document.createElement('div');
        heading.className = 'card-heading';
        var title = document.createElement('h2');
        title.className = 't';
        title.textContent = it.t;
        heading.appendChild(title);
        header.appendChild(heading);
        card.appendChild(header);

        if (it.s || it.d) {
            var description = document.createElement('div');
            description.className = 'card-description';
            if (it.s) {
                var subtitle = document.createElement('p');
                subtitle.className = 's';
                subtitle.textContent = it.s;
                description.appendChild(subtitle);
            }
            if (it.d) {
                var detail = document.createElement('p');
                detail.className = 'd';
                detail.textContent = it.d;
                description.appendChild(detail);
            }
            card.appendChild(description);
        }

        var footer = document.createElement('div');
        footer.className = 'card-footer';
        if (it.ai) {
            var ai = document.createElement('span');
            ai.className = 'ai';
            ai.textContent = 'AI 开发';
            footer.appendChild(ai);
        }
        var time = document.createElement('div');
        time.className = 'time';
        if (it.firstDev) {
            var first = document.createElement('span');
            first.textContent = '首次开发 ' + it.firstDev;
            time.appendChild(first);
        }
        if (it.lastUpdate) {
            var last = document.createElement('span');
            last.textContent = '最后更新 ' + it.lastUpdate;
            time.appendChild(last);
        }
        footer.appendChild(time);

        var actions = document.createElement('div');
        actions.className = 'card-actions';
        var open = document.createElement('button');
        open.className = 'btn o';
        open.type = 'button';
        open.textContent = '打开';
        open.setAttribute('aria-label', '打开' + it.t);
        open.onclick = function () { openjc(it.o); };
        actions.appendChild(open);
        if (it.g && it.g !== '#') {
            var docs = document.createElement('button');
            docs.className = 'btn g';
            docs.type = 'button';
            docs.textContent = '文档';
            docs.setAttribute('aria-label', '查看' + it.t + '的文档');
            docs.onclick = function () { openjc(it.g); };
            actions.appendChild(docs);
        }
        footer.appendChild(actions);
        card.appendChild(footer);
        canvas.appendChild(card);
    });
    wrap.replaceChildren(canvas);
    layoutCards();
}

window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sort-order').addEventListener('change', render);
    window.addEventListener('resize', layoutCards);
    render();
});
