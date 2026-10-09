/* ===== 数据:字符分类 ===== */
var DATA = {
  emoji: [
    ["😀","开心"],["😁","大笑"],["😂","笑哭"],["🤣","笑翻"],
    ["😊","微笑"],["😍","花痴"],["😘","飞吻"],["😎","墨镜"],
    ["🤔","思考"],["😴","睡觉"],["😭","大哭"],["😤","生气"],
    ["😡","愤怒"],["😱","惊吓"],["😨","害怕"],["😰","冷汗"],
    ["😅","汗"],["😳","脸红"],["🤗","拥抱"],["🤐","闭嘴"],
    ["🤫","嘘"],["🤨","挑眉"],["😐","无语"],["😑","面无表情"],
    ["😏","得意"],["😒","不屑"],["🙄","翻白眼"],["😢","伤心"],
    ["😔","沮丧"],["🥺","委屈"],["😇","天使"],["😈","恶魔"],
    ["👍","赞"],["👎","踩"],["👌","OK"],["✌️","胜利"],
    ["🤞","祈祷"],["🤟","爱你"],["🤘","摇滚"],["👏","鼓掌"],
    ["🙏","合十"],["💪","肌肉"],["👋","挥手"],["🤝","握手"],
    ["👐","张开"],["👆","上指"],["👇","下指"],["👈","左指"],
    ["👉","右指"],["🖕","中指"],["✍️","书写"],["💅","美甲"],
    ["❤️","红心"],["🧡","橙心"],["💛","黄心"],["💚","绿心"],
    ["💙","蓝心"],["💜","紫心"],["🖤","黑心"],["🤍","白心"],
    ["💔","碎心"],["💕","双心"],["💖","闪心"],["💗","跳心"],
    ["💓","心搏"],["💞","旋心"],["💘","箭心"],["💯","百分"],
    ["🔥","火"],["✨","闪亮"],["⭐","星"],["🌟","亮星"],
    ["💫","晕眩"],["🎉","庆祝"],["🎊","彩带"],["🥳","派对"],
    ["🎈","气球"],["🎁","礼物"],["🎀","蝴蝶结"],["🏆","奖杯"],
    ["🥇","金牌"],["🥈","银牌"],["🥉","铜牌"],["🎯","靶心"],
    ["🎮","游戏"],["🎲","骰子"],["🎧","耳机"],["📱","手机"],
    ["💻","电脑"],["⌨️","键盘"],["🖥️","显示器"],["🖱️","鼠标"],
    ["📷","相机"],["🎥","摄像机"],["📚","书本"],["📝","笔记"],
    ["✏️","铅笔"],["📌","图钉"],["📍","定位"],["📎","回形针"],
    ["📁","文件夹"],["📂","打开夹"],["🗑️","垃圾桶"],["🔍","放大镜"],
    ["🔒","锁"],["🔓","开锁"],["🔑","钥匙"],["💡","灯泡"],
    ["🔔","铃铛"],["📢","喇叭"],["📣","扩音"],["⏰","闹钟"],
    ["🕐","一点"],["🕑","两点"],["🕒","三点"],["🕓","四点"],
    ["🕔","五点"],["🕕","六点"],["🕖","七点"],["🕗","八点"],
    ["🕘","九点"],["🕙","十点"],["🕚","十一点"],["🕛","十二点"],
    ["☀️","太阳"],["🌙","月亮"],["⭐","星星"],["🌈","彩虹"],
    ["☁️","云"],["⛅","多云"],["🌧️","雨"],["⛈️","雷雨"],
    ["❄️","雪"],["🌊","浪"],["🍀","四叶草"],["🌹","玫瑰"],
    ["🌸","樱花"],["🌻","向日葵"],["🌵","仙人掌"],["🎄","圣诞树"],
    ["🍎","苹果"],["🍊","橙子"],["🍋","柠檬"],["🍌","香蕉"],
    ["🍉","西瓜"],["🍇","葡萄"],["🍓","草莓"],["🍑","桃子"],
    ["🍒","樱桃"],["🍍","菠萝"],["🥑","牛油果"],["🍔","汉堡"],
    ["🍟","薯条"],["🍕","披萨"],["🌭","热狗"],["🍿","爆米花"],
    ["🍰","蛋糕"],["🍩","甜甜圈"],["🍪","饼干"],["🍫","巧克力"],
    ["🍬","糖果"],["🍭","棒棒糖"],["🍦","冰淇淋"],["🍺","啤酒"],
    ["🍻","干杯"],["🥂","香槟"],["☕","咖啡"],["🍵","茶"],
    ["💧","水滴"],["⚽","足球"],["🏀","篮球"],["🏈","橄榄球"],
    ["⚾","棒球"],["🎾","网球"],["🏐","排球"],["🏓","乒乓球"],
    ["🎱","台球"],["🏸","羽毛球"],["🥊","拳击"],["🎳","保龄球"],
    ["🚗","汽车"],["🚕","出租车"],["🚌","公交"],["🚲","自行车"],
    ["🏍️","摩托"],["✈️","飞机"],["🚀","火箭"],["⛵","帆船"],
    ["🚢","轮船"],["🚄","高铁"],["🚇","地铁"],["🛸","飞碟"],
    ["🐶","狗"],["🐱","猫"],["🐭","老鼠"],["🐹","仓鼠"],
    ["🐰","兔子"],["🦊","狐狸"],["🐻","熊"],["🐼","熊猫"],
    ["🐨","考拉"],["🐯","老虎"],["🦁","狮子"],["🐮","牛"],
    ["🐷","猪"],["🐸","青蛙"],["🐵","猴子"],["🐔","鸡"],
    ["🐧","企鹅"],["🐦","鸟"],["🐤","小鸡"],["🦆","鸭子"],
    ["🦅","鹰"],["🦉","猫头鹰"],["🐺","狼"],["🐴","马"],
    ["🦄","独角兽"],["🐝","蜜蜂"],["🐛","虫子"],["🦋","蝴蝶"],
    ["🐌","蜗牛"],["🐞","瓢虫"],["🐢","乌龟"],["🐍","蛇"],
    ["🐙","章鱼"],["🦑","鱿鱼"],["🦐","虾"],["🦀","螃蟹"],
    ["🐳","鲸鱼"],["🐬","海豚"],["🐟","鱼"],["🐠","热带鱼"],
    ["🦈","鲨鱼"],["🐊","鳄鱼"],["🦖","恐龙"],["🦕","腕龙"],
    ["👦","男孩"],["👧","女孩"],["👨","男人"],["👩","女人"],
    ["👴","老人"],["👵","老妇"],["👶","婴儿"],["👮","警察"],
    ["💂","卫兵"],["👷","工人"],["👨‍⚕️","医生"],["👩‍🎓","学生"],
    ["👨‍🍳","厨师"],["👨‍🚒","消防"],["👨‍🎤","歌手"],["👨‍💻","程序员"],
    ["👨‍🔧","技师"],["👨‍🏫","老师"],["👨‍✈️","飞行员"],["👨‍🚀","宇航员"],
    ["💃","跳舞"],["🕺","男舞"],["👯","双人"],["🧘","瑜伽"],
    ["🏃","跑步"],["🚶","走路"],["💇","理发"],["💆","按摩"],
    ["🛀","洗澡"],["🚿","淋浴"],["🛏️","床"],["🛋️","沙发"],
    ["🍽️","餐具"],["🔪","刀"],["🥄","勺子"],["🍴","叉勺"],
    ["⚡","闪电"],["💥","爆炸"],["💦","汗水"],["🫧","泡泡"],
    ["🎵","音符"],["🎶","乐谱"],["🎤","麦克风"],["🎹","钢琴"],
    ["🎸","吉他"],["🥁","鼓"],["🎻","小提琴"],["🪗","手风琴"],
    ["📞","电话"],["📟","寻呼机"],["📠","传真"],["📺","电视"],
    ["🔋","电池"],["🔌","插头"],["💾","软盘"],["💿","光盘"],
    ["📀","DVD"],["🖨️","打印机"],["🖊️","圆珠笔"],["🖍️","蜡笔"],
    ["🔮","水晶球"],["🎭","面具"],["🎪","马戏团"],["🎡","摩天轮"],
    ["🎠","旋转木马"],["🎢","过山车"],["🛍️","购物袋"],["💰","钱袋"],
    ["💎","钻石"],["🪙","硬币"],["💵","美元"],["💶","欧元"],
    ["💷","英镑"],["💴","日元"],["💸","飞钱"],["🏦","银行"],
    ["🧧","红包"],["🎴","花牌"],["🀄","麻将"],["♠️","黑桃"],
    ["♥️","红桃"],["♦️","方块"],["♣️","梅花"],["🃏","小丑"]
  ],
  roman: [
    ["Ⅰ","罗马1"],["Ⅱ","罗马2"],["Ⅲ","罗马3"],["Ⅳ","罗马4"],
    ["Ⅴ","罗马5"],["Ⅵ","罗马6"],["Ⅶ","罗马7"],["Ⅷ","罗马8"],
    ["Ⅸ","罗马9"],["Ⅹ","罗马10"],["Ⅺ","罗马11"],["Ⅻ","罗马12"],
    ["ⅰ","小写1"],["ⅱ","小写2"],["ⅲ","小写3"],["ⅳ","小写4"],
    ["ⅴ","小写5"],["ⅵ","小写6"],["ⅶ","小写7"],["ⅷ","小写8"],
    ["ⅸ","小写9"],["ⅹ","小写10"],["ⅺ","小写11"],["ⅻ","小写12"],
    ["Ⅼ","50"],["Ⅽ","100"],["Ⅾ","500"],["Ⅿ","1000"],
    ["ↀ","1000变体"],["ↁ","5000"],["ↂ","10000"]
  ],
  math: [
    ["∞","无穷大"],["π","圆周率"],["e","自然常数"],["φ","黄金比例"],
    ["α","阿尔法"],["β","贝塔"],["γ","伽马"],["δ","德尔塔"],
    ["ε","艾普西龙"],["ζ","泽塔"],["η","伊塔"],["θ","西塔"],
    ["ι","艾欧塔"],["κ","卡帕"],["λ","兰布达"],["μ","缪"],
    ["ν","纽"],["ξ","克西"],["ο","欧米克隆"],["π","派"],
    ["ρ","柔"],["σ","西格玛"],["τ","陶"],["υ","宇普西龙"],
    ["φ","费"],["χ","凯"],["ψ","普赛"],["ω","欧米伽"],
    ["Γ","大写伽马"],["Δ","大写德尔塔"],["Θ","大写西塔"],["Λ","大写兰布达"],
    ["Ξ","大写克西"],["Π","大写派"],["Σ","大写西格玛"],["Φ","大写费"],
    ["Ψ","大写普赛"],["Ω","大写欧米伽"],
    ["∈","属于"],["∉","不属于"],["⊂","子集"],["⊃","超集"],
    ["⊆","子集或等"],["⊇","超集或等"],["∅","空集"],["∪","并集"],
    ["∩","交集"],["⊄","不包含"],["⊅","不包含"],["⊈","不包含于"],
    ["⊉","不包含于"],["∋","包含"],["∌","不包含"],["∉","不属于"]
  ],
  mathops: [
    ["＋","加号"],["－","减号"],["×","乘号"],["÷","除号"],
    ["±","正负号"],["∓","负正号"],["∑","求和"],["∏","求积"],
    ["∐","余积"],["∫","积分"],["∬","二重积分"],["∭","三重积分"],
    ["∮","曲线积分"],["∯","面积分"],["∰","体积分"],["∂","偏微分"],
    ["∇","纳布拉"],["√","根号"],["∛","立方根"],["∜","四次根"],
    ["∴","所以"],["∵","因为"],["≡","恒等于"],["≠","不等于"],
    ["≈","约等于"],["≌","全等"],["≃","相似约等"],["≅","全等约等"],
    ["≒","近似等"],["≓","约等于变体"],["∝","正比"],["≍","渐近等"],
    ["∼","相似"],["≪","远小于"],["≫","远大于"],["≤","小于等于"],
    ["≥","大于等于"],["<","小于"],[">","大于"],["≦","小于等于变体"],
    ["≧","大于等于变体"],["≨","不大于等于"],["≩","不小于等于"],
    ["≠","不等于"],["≢","不恒等"],["≮","不小于"],["≯","不大于"],
    ["⊰","小关系"],["⊥","垂直"],["∥","平行"],["∦","不平行"],
    ["∠","角"],["∡","测量角"],["∢","球面角"],["°","度"],
    ["′","分"],["″","秒"],["‴","三撇"],["§","节"],
    ["‰","千分号"],["‱","万分号"],["%","百分号"],["µ","微"],
    ["℧","姆欧"],["Ω","欧姆"],["Å","埃"],["ℓ","升"]
  ],
  super: [
    ["⁰","上标0"],["¹","上标1"],["²","上标2"],["³","上标3"],
    ["⁴","上标4"],["⁵","上标5"],["⁶","上标6"],["⁷","上标7"],
    ["⁸","上标8"],["⁹","上标9"],["⁺","上标+"],["⁻","上标-"],
    ["⁽","上标("],["⁾","上标)"],["ⁿ","上标n"],["ⁱ","上标i"],
    ["ª","上标a"],["º","上标o"],["⁰","上标0"],["₁","下标1"],
    ["₂","下标2"],["₃","下标3"],["₄","下标4"],["₅","下标5"],
    ["₆","下标6"],["₇","下标7"],["₈","下标8"],["₉","下标9"],
    ["₀","下标0"],["₊","下标+"],["₋","下标-"],["₍","下标("],
    ["₎","下标)"],["ₐ","下标a"],["ₑ","下标e"],["ₒ","下标o"],
    ["ₓ","下标x"],["ₔ","下标schwa"],["ₕ","下标h"],["ₖ","下标k"],
    ["ₗ","下标l"],["ₘ","下标m"],["ₙ","下标n"],["ₚ","下标p"],
    ["ₛ","下标s"],["ₜ","下标t"],["ₓ","下标x"],["ₖ","下标k"],
    ["ₚ","下标p"],["ᵢ","下标i"],["ⱼ","下标j"],["ᵣ","下标r"],
    ["ᵤ","下标u"],["ᵥ","下标v"],["ᵦ","下标β"],["ᵧ","下标γ"],
    ["ᵨ","下标ρ"],["ᵩ","下标φ"],["ᵪ","下标χ"],["₊","下标+"],
    ["₋","下标-"],["₌","下标="],["₍","下标("],["₎","下标)"],
    ["ₐ","下标a"],["ₑ","下标e"],["ₒ","下标o"],["ₓ","下标x"]
  ],
  space: [
    [" ", "半角空格"],["\u00A0", "不间断空格"],["\u2002", "En空格"],["\u2003", "Em空格"],
    ["\u2004", "三分Em空格"],["\u2005", "四分Em空格"],["\u2006", "六分Em空格"],
    ["\u2007", "数字空格"],["\u2008", "标点空格"],["\u2009", "细空格"],
    ["\u200A", "极细空格"],["\u200B", "零宽空格"],["\u200C", "零宽不连字"],
    ["\u200D", "零宽连字"],["\u202F", "窄不间断空格"],["\u205F", "数学空格"],
    ["\u3000", "全角空格"],["\u1680", "欧甘空格"],["\u180E", "蒙古文分离符"],
    ["\u2000", "En quad空格"],["\u2001", "Em quad空格"],["\u2060", "字连接符"],
    ["\uFEFF", "零宽无断空格"]
  ],
  other: [
    ["①","圆圈1"],["②","圆圈2"],["③","圆圈3"],["④","圆圈4"],
    ["⑤","圆圈5"],["⑥","圆圈6"],["⑦","圆圈7"],["⑧","圆圈8"],
    ["⑨","圆圈9"],["⑩","圆圈10"],["⑪","圆圈11"],["⑫","圆圈12"],
    ["⑬","圆圈13"],["⑭","圆圈14"],["⑮","圆圈15"],["⑯","圆圈16"],
    ["⑰","圆圈17"],["⑱","圆圈18"],["⑲","圆圈19"],["⑳","圆圈20"],
    ["㉑","圆圈21"],["㉒","圆圈22"],["㉓","圆圈23"],["㉔","圆圈24"],
    ["㉕","圆圈25"],["㉖","圆圈26"],["㉗","圆圈27"],["㉘","圆圈28"],
    ["㉙","圆圈29"],["㉚","圆圈30"],
    ["❶","黑圈1"],["❷","黑圈2"],["❸","黑圈3"],["❹","黑圈4"],
    ["❺","黑圈5"],["❻","黑圈6"],["❼","黑圈7"],["❽","黑圈8"],
    ["❾","黑圈9"],["❿","黑圈10"],
    ["⒈","括号1"],["⒉","括号2"],["⒊","括号3"],["⒋","括号4"],
    ["⒌","括号5"],["⒍","括号6"],["⒎","括号7"],["⒏","括号8"],
    ["⒐","括号9"],["⒑","括号10"],["⒒","括号11"],["⒓","括号12"],
    ["⒔","括号13"],["⒕","括号14"],["⒖","括号15"],["⒗","括号16"],
    ["⒘","括号17"],["⒙","括号18"],["⒚","括号19"],["⒛","括号20"],
    ["㊀","中文圈1"],["㊁","中文圈2"],["㊂","中文圈3"],["㊃","中文圈4"],
    ["㊄","中文圈5"],["㊅","中文圈6"],["㊆","中文圈7"],["㊇","中文圈8"],
    ["㊈","中文圈9"],["㊉","中文圈10"],
    ["（","全角括号"],["）","全角括号"],["《","书名号"],["》","书名号"],
    ["【","方头括号"],["】","方头括号"],["「","日式括号"],["」","日式括号"],
    ["『","日式括号"],["』","日式括号"],["〔","菱形括号"],["〕","菱形括号"],
    ["〖","空心括号"],["〗","空心括号"],["§","节号"],["¶","段落号"],
    ["†","剑号"],["‡","双剑号"],["※","参考标记"],["〃","重音号"],
    ["—","破折号"],["–","连接号"],["—","破折号"],["…","省略号"],
    ["—","破折号"],["――","长破折"],["‥","双点省略"],["—","破折号"],
    ["★","实心星"],["☆","空心星"],["✩","星"],["✪","圈星"],
    ["✦","四角星"],["✧","四角星"],["◆","实心菱"],["◇","空心菱"],
    ["●","实心圆"],["○","空心圆"],["◐","半圆"],["◑","半圆"],
    ["◕","半圆"],["◍","半圆"],["◎","双环"],["◉","靶心"],
    ["□","空心方块"],["■","实心方块"],["▢","方块"],["▣","方块"],
    ["▤","方块"],["▥","方块"],["▦","方块"],["▧","方块"],
    ["▨","方块"],["▩","方块"],["▪","小方块"],["▫","小方块"],
    ["▲","实心三角"],["△","空心三角"],["▶","右三角"],["◀","左三角"],
    ["▼","下三角"],["▽","上三角"],["◄","左三角"],["►","右三角"],
    ["◈","菱形点"],["◉","靶心"],["◯","大圆"],["◍","半圆"],
    ["✓","对勾"],["✔","粗对勾"],["✗","叉"],["✘","粗叉"],
    ["✕","叉"],["✖","乘"],["✚","加"],["✤","星"],
    ["✽","星"],["❋","花星"],["❀","花"],["❁","花"],
    ["❃","花"],["❄","雪花"],["❅","雪花"],["❆","雪花"],
    ["✎","铅笔"],["✏","铅笔"],["✐","铅笔"],["✑","笔"],
    ["✒","笔"],["🖊","笔"],["🖋","笔"],["🖌","画笔"],
    ["✔","对"],["☑","选中"],["☐","未选"],["☒","勾选"],
    ["☺","笑脸"],["☻","黑脸"],["☹","苦脸"],["☀","太阳"],
    ["☁","云"],["☂","伞"],["☃","雪人"],["☄","彗星"],
    ["☎","电话"],["☏","电话"],["☚","手指"],["☛","手指"],
    ["☜","手指"],["☝","手指"],["☞","手指"],["☟","手指"],
    ["☠","骷髅"],["☡","警示"],["☢","辐射"],["☣","生物危害"],
    ["☤","蛇杖"],["☥","安卡"],["☦","十字"],["☨","十字"],
    ["☩","十字"],["☪","星月"],["☫","星月"],["☬","星月"],
    ["☭","锤镰"],["☮","和平"],["☯","太极"],["☰","三线"],
    ["☱","三线"],["☲","三线"],["☳","三线"],["☴","三线"],
    ["☵","三线"],["☶","三线"],["☷","三线"],["☸","法轮"],
    ["☹","苦脸"],["☺","笑脸"],["☻","黑脸"],["☼","太阳"],
    ["☽","月"],["☾","月"],["♠","黑桃"],["♡","红心"],
    ["♢","方块"],["♣","梅花"],["♥","红心"],["♦","方块"],
    ["♧","梅花"],["♨","温泉"],["♩","音符"],["♪","音符"],
    ["♫","音符"],["♬","音符"],["♭","降号"],["♮","还原"],
    ["♯","升号"],["♰","十字"],["♱","十字"],["♲","回收"],
    ["♳","回收"],["♴","回收"],["♵","回收"],["♶","回收"],
    ["♷","回收"],["♸","回收"],["♹","回收"],["♺","回收"],
    ["♻","回收"],["♼","回收"],["♽","回收"],["♾","无穷"],
    ["♿","轮椅"],["⚀","骰子1"],["⚁","骰子2"],["⚂","骰子3"],
    ["⚃","骰子4"],["⚄","骰子5"],["⚅","骰子6"],["⚆","圆点"],
    ["⚈","圆点"],["⚉","圆点"],["⚊","短线"],["⚋","短线"],
    ["⚌","短线"],["⚍","短线"],["⚎","短线"],["⚏","短线"],
    ["⚐","旗"],["⚑","旗"],["⚒","锤"],["⚓","锚"],
    ["⚔","剑"],["⚕","医学"],["⚖","天平"],["⚗","蒸馏"],
    ["⚘","花"],["⚙","齿轮"],["⚚","杖"],["⚛","原子"],
    ["⚜","鸢尾"],["⚝","星"],["⚞","圆"],["⚟","圆"],
    ["⚠","警告"],["⚡","闪电"],["⚢","双女"],["⚣","双男"],
    ["⚤","男女"],["⚥","中性"],["⚦","男"],["⚧","跨性"],
    ["⚨","闪电"],["⚩","闪电"],["⚪","空心圆"],["⚫","实心圆"],
    ["⚬","点"],["⚭","婚戒"],["⚮","婚戒"],["⚯","婚戒"],
    ["⚰","棺材"],["⚱","骨灰"],["⚲","未知"],["⚳","行星"],
    ["⚴","行星"],["⚵","行星"],["⚶","行星"],["⚷","行星"],
    ["⚸","行星"],["⚹","行星"],["⚺","行星"],["⚻","行星"],
    ["⚼","行星"],["⚽","足球"],["⚾","棒球"],["⛄","雪人"],
    ["⛅","多云"],["⛆","雨"],["⛇","雪"],["⛈","雷雨"],
    ["⛉","雪"],["⛊","雪"],["⛋","雪"],["⛌","雪"],
    ["⛍","雪"],["⛎","宝瓶"],["⛏","镐"],["⛐","雪"],
    ["⛑","头盔"],["⛒","路"],["⛓","链"],["⛔","禁行"],
    ["⛕","禁行"],["⛖","禁行"],["⛗","禁行"],["⛘","禁行"],
    ["⛙","禁行"],["⛚","禁行"],["⛛","禁行"],["⛜","禁行"],
    ["⛝","禁行"],["⛞","禁行"],["⛟","船"],["⛠","禁行"],
    ["⛡","禁行"],["⛢","天王星"],["⛣","禁行"],["⛤","禁行"],
    ["⛥","禁行"],["⛦","禁行"],["⛧","禁行"],["⛨","禁行"],
    ["⛩","神社"],["⛪","教堂"],["⛫","禁行"],["⛬","禁行"],
    ["⛭","齿轮"],["⛮","禁行"],["⛯","禁行"],["⛰","山"],
    ["⛱","伞"],["⛲","喷泉"],["⛳","高尔夫"],["⛴","渡轮"],
    ["⛵","帆船"],["⛶","方形"],["⛷","滑雪"],["⛸","滑冰"],
    ["⛹","投篮"],["⛺","帐篷"],["⛻","禁行"],["⛼","禁行"],
    ["⛽","加油"],["⛾","禁行"],["⛿","禁行"]
  ]
};

/* ===== 空格数据(单独,因需区分名字) ===== */
var SPACE_DATA = [
  [" ", "半角空格", "Halfwidth Space"],
  ["\u00A0", "不间断空格", "NBSP"],
  ["\u2000", "En Quad", "En Quad"],
  ["\u2001", "Em Quad", "Em Quad"],
  ["\u2002", "En空格", "En Space"],
  ["\u2003", "Em空格", "Em Space"],
  ["\u2004", "三分Em空格", "Three-per-Em"],
  ["\u2005", "四分Em空格", "Four-per-Em"],
  ["\u2006", "六分Em空格", "Six-per-Em"],
  ["\u2007", "数字空格", "Figure Space"],
  ["\u2008", "标点空格", "Punctuation Space"],
  ["\u2009", "细空格", "Thin Space"],
  ["\u200A", "极细空格", "Hair Space"],
  ["\u200B", "零宽空格", "Zero Width Space"],
  ["\u200C", "零宽不连字", "ZWNJ"],
  ["\u200D", "零宽连字", "ZWJ"],
  ["\u202F", "窄不间断空格", "NNBSP"],
  ["\u205F", "数学空格", "MMSP"],
  ["\u3000", "全角空格", "Ideographic Space"],
  ["\u1680", "欧甘空格", "Ogham Space"],
  ["\u180E", "蒙古文分离符", "MVS"],
  ["\u2060", "字连接符", "Word Joiner"],
  ["\uFEFF", "零宽无断空格", "ZWNBSP/BOM"]
];

/* ===== 上标下标数据(合并,去重) ===== */
var SUPER_DATA = [
  ["⁰","上标0"],["¹","上标1"],["²","上标2"],["³","上标3"],
  ["⁴","上标4"],["⁵","上标5"],["⁶","上标6"],["⁷","上标7"],
  ["⁸","上标8"],["⁹","上标9"],["⁺","上标+"],["⁻","上标-"],
  ["⁽","上标("],["⁾","上标)"],["ⁿ","上标n"],["ⁱ","上标i"],
  ["ª","上标a"],["º","上标o"],
  ["₁","下标1"],["₂","下标2"],["₃","下标3"],["₄","下标4"],
  ["₅","下标5"],["₆","下标6"],["₇","下标7"],["₈","下标8"],
  ["₉","下标9"],["₀","下标0"],["₊","下标+"],["₋","下标-"],
  ["₍","下标("],["₎","下标)"],["ₐ","下标a"],["ₑ","下标e"],
  ["ₒ","下标o"],["ₓ","下标x"],["ₕ","下标h"],["ₖ","下标k"],
  ["ₗ","下标l"],["ₘ","下标m"],["ₙ","下标n"],["ₚ","下标p"],
  ["ₛ","下标s"],["ₜ","下标t"],["ᵢ","下标i"],["ⱼ","下标j"],
  ["ᵣ","下标r"],["ᵤ","下标u"],["ᵥ","下标v"],["ᵦ","下标β"],
  ["ᵧ","下标γ"],["ᵨ","下标ρ"],["ᵩ","下标φ"],["ᵪ","下标χ"],
  ["₌","下标="]
];

/* ===== 花体字母与希腊字母 ===== */
var FANCY_STYLES = [
  {name: '数学斜体', str: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧'},
  {name: '数学粗体', str: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'},
  {name: '粗斜体', str: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛'},
  {name: '花体(手写)', str: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'},
  {name: '粗花体', str: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃'},
  {name: '德文尖角体', str: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷'},
  {name: '粗尖角体', str: '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎ⓙ𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟'},
  {name: '空心体(黑板体)', str: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'},
  {name: '无衬线体', str: '𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝟢𝟣𝟤𝟩𝟦𝟧𝟨𝟩𝟪𝟫'},
  {name: '无衬线粗体', str: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'},
  {name: '无衬线斜体', str: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'},
  {name: '无衬线粗斜体', str: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯'},
  {name: '打字机体', str: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'}
];
var GREEK_DATA = [
  ['α','alpha'],['β','beta'],['γ','gamma'],['δ','delta'],
  ['ε','epsilon'],['ζ','zeta'],['η','eta'],['θ','theta'],
  ['ι','iota'],['κ','kappa'],['λ','lambda'],['μ','mu'],
  ['ν','nu'],['ξ','xi'],['ο','omicron'],['π','pi'],
  ['ρ','rho'],['σ','sigma'],['τ','tau'],['υ','upsilon'],
  ['φ','phi'],['χ','chi'],['ψ','psi'],['ω','omega'],
  ['ς','final sigma'],['ϑ','theta变体'],['ϕ','phi变体'],['ϖ','pi变体'],['ϱ','rho变体'],
  ['Γ','Gamma'],['Δ','Delta'],['Θ','Theta'],['Λ','Lambda'],
  ['Ξ','Xi'],['Π','Pi'],['Σ','Sigma'],['Υ','Upsilon'],
  ['Φ','Phi'],['Ψ','Psi'],['Ω','Omega']
];

/* ===== 全站收藏：同一字符在所有分类共用收藏状态 ===== */
var FAVORITES_KEY = 'character-copy-favorites-v1';
var LEGACY_EMOJI_FAVORITES_KEY = 'character-copy-emoji-favorites-v1';
var favoriteItems = loadFavorites();
var favoriteValues = new Set(favoriteItems.map(function(item) { return item.value; }));
var favoritesGrid = document.getElementById('favorites-grid');
var favoritesEmpty = document.getElementById('favorites-empty');
var favoritesCount = document.getElementById('favorites-count');

function loadFavorites() {
  var result = [];
  var seen = new Set();
  try {
    var saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    if (Array.isArray(saved)) saved.forEach(function(item) {
      var value = typeof item === 'string' ? item : item && item.value;
      if (typeof value !== 'string' || !value.length || seen.has(value)) return;
      seen.add(value);
      result.push({value: value, label: typeof item.label === 'string' ? item.label : '', category: typeof item.category === 'string' ? item.category : '符号'});
    });
    var legacy = JSON.parse(localStorage.getItem(LEGACY_EMOJI_FAVORITES_KEY) || '[]');
    if (Array.isArray(legacy)) legacy.forEach(function(value) {
      if (typeof value !== 'string' || !value.length || seen.has(value)) return;
      seen.add(value);
      var match = EMOJI_DATA.find(function(item) { return item[0] === value; });
      result.push({value: value, label: match ? (match[3] || match[1]) : '', category: 'Emoji'});
    });
    if (Array.isArray(legacy) && legacy.length) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(result));
      localStorage.removeItem(LEGACY_EMOJI_FAVORITES_KEY);
    }
  } catch (error) { /* 本地文件模式下若浏览器禁止存储，当前会话仍可收藏。 */ }
  return result;
}

function isFavorite(value) { return favoriteValues.has(value); }

function saveFavorites() {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteItems)); }
  catch (error) { showTip('当前浏览器无法持久保存收藏', 'error'); }
}

function updateFavoriteButton(button, value) {
  var selected = isFavorite(value);
  button.textContent = selected ? '★' : '☆';
  button.setAttribute('aria-pressed', selected ? 'true' : 'false');
  button.setAttribute('aria-label', (selected ? '取消收藏：' : '收藏：') + value.slice(0, 80));
  button.title = selected ? '取消收藏' : '加入收藏';
}

function createFavoriteButton(value, label, category) {
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'favorite-button';
  updateFavoriteButton(button, value);
  button.addEventListener('click', function(event) {
    event.stopPropagation();
    toggleFavorite(value, label, category);
  });
  return button;
}

function refreshFavoriteStates(value) {
  document.querySelectorAll('[data-favorite-value]').forEach(function(node) {
    if (node.dataset.favoriteValue !== value) return;
    node.classList.toggle('is-favorite', isFavorite(value));
    var button = node.querySelector('.favorite-button');
    if (button) updateFavoriteButton(button, value);
  });
}

function toggleFavorite(value, label, category) {
  if (isFavorite(value)) {
    favoriteItems = favoriteItems.filter(function(item) { return item.value !== value; });
    favoriteValues.delete(value);
  } else {
    favoriteItems.unshift({value: value, label: label || '', category: category || '符号'});
    favoriteValues.add(value);
  }
  saveFavorites();
  refreshFavoriteStates(value);
  renderFavoritesPanel();
  if (typeof emojiOnlyFavorites !== 'undefined' && emojiOnlyFavorites && emojiOnlyFavorites.checked) renderEmojiGrid();
  else if (typeof emojiCount !== 'undefined' && emojiCount) updateEmojiCount();
}

function enhanceFavoriteCell(cell, value, label, category) {
  cell.dataset.favoriteValue = value;
  cell.classList.add('favorite-ready');
  cell.classList.toggle('is-favorite', isFavorite(value));
  cell.setAttribute('role', 'button');
  cell.tabIndex = 0;
  cell.setAttribute('aria-label', '复制 ' + (label || value) + ' ' + value);
  cell.insertBefore(createFavoriteButton(value, label, category), cell.firstChild);
  cell.addEventListener('keydown', function(event) {
    if (event.target === cell && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      copyText(value);
    }
  });
}

function favoriteDisplayText(value) {
  if (!/^\s+$/u.test(value)) return value;
  return value.replace(/ /g, '␣').replace(/\t/g, '⇥').replace(/[\r\n]/g, '↵');
}

function renderFavoritesPanel() {
  favoritesGrid.replaceChildren();
  var fragment = document.createDocumentFragment();
  favoriteItems.forEach(function(item) {
    var cell = document.createElement('div');
    cell.className = 'char-cell favorite-card' + (item.category === 'Emoji' ? ' emoji-cell' : '') + (Array.from(item.value).length > 4 && item.category !== 'Emoji' ? ' wide' : '');
    cell.title = item.value + (item.label ? ' · ' + item.label : '');
    var main = document.createElement('div');
    main.className = 'char-main';
    main.textContent = favoriteDisplayText(item.value);
    var label = document.createElement('div');
    label.className = 'char-label';
    label.textContent = item.label || item.category || '收藏';
    cell.appendChild(main);
    cell.appendChild(label);
    enhanceFavoriteCell(cell, item.value, item.label, item.category);
    cell.addEventListener('click', function() { copyText(item.value); });
    fragment.appendChild(cell);
  });
  favoritesGrid.appendChild(fragment);
  favoritesCount.textContent = favoriteItems.length + ' 个';
  favoritesEmpty.hidden = favoriteItems.length > 0;
}

document.getElementById('favorites-add-form').addEventListener('submit', function(event) {
  event.preventDefault();
  var input = document.getElementById('favorites-add-input');
  var value = input.value;
  if (!value.length) { showTip('请先输入或粘贴符号', 'error'); return; }
  if (isFavorite(value)) { showTip('这个内容已经在收藏中'); return; }
  toggleFavorite(value, '', '自定义');
  input.value = '';
  showTip('已加入收藏');
});
renderFavoritesPanel();

/* ===== 渲染选中花体样式的字符网格 ===== */
function renderFancyStyle(styleIndex) {
  var grid = document.getElementById('fancy-grid');
  if (!grid) return;
  var style = FANCY_STYLES[styleIndex] || FANCY_STYLES[0];
  grid.innerHTML = '';
  var chars = Array.from(style.str);
  var total = chars.length;
  var hasDigits = total > 52;
  for (var i = 0; i < total; i++) {
    var ch = chars[i];
    if (!ch) continue;
    var cell = document.createElement('div');
    cell.className = 'char-cell fancy-cell';
    var main = document.createElement('div');
    main.className = 'char-main';
    main.textContent = ch;
    var label = document.createElement('div');
    label.className = 'char-label';
    if (i < 26) {
      label.textContent = String.fromCharCode(65 + i);
    } else if (i < 52) {
      label.textContent = String.fromCharCode(97 + i - 26);
    } else {
      label.textContent = '0' + (i - 52);
    }
    cell.appendChild(main);
    cell.appendChild(label);
    enhanceFavoriteCell(cell, ch, label.textContent, '花体字母');
    cell.addEventListener('click', (function(c) { return function() { copyText(c); }; })(ch));
    cell.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    cell.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    });
    cell.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    });
    grid.appendChild(cell);
  }
}

/* ===== 渲染函数 ===== */
function renderGrid(containerId, data, isEmoji, isWide) {
  var grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';
  data.forEach(function(item) {
    var cell = document.createElement('div');
    cell.className = 'char-cell' + (isEmoji ? ' emoji-cell' : '') + (isWide ? ' wide' : '');
    var main = document.createElement('div');
    main.className = 'char-main';
    main.textContent = item[0];
    var label = document.createElement('div');
    label.className = 'char-label';
    label.textContent = item[1] || '';
    cell.appendChild(main);
    cell.appendChild(label);
    var category = containerId === 'greek-grid' ? '希腊字母' : (grid.closest('.gnN').querySelector('.section-title') || {}).textContent || '符号';
    enhanceFavoriteCell(cell, item[0], item[1] || '', category);
    cell.addEventListener('click', function() {
      copyText(item[0]);
    });
    cell.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    cell.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    });
    cell.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    });
    grid.appendChild(cell);
  });
}

function renderSpaceGrid() {
  var grid = document.getElementById('space-grid');
  if (!grid) return;
  grid.innerHTML = '';
  SPACE_DATA.forEach(function(item) {
    var cell = document.createElement('div');
    cell.className = 'char-cell wide';
    var main = document.createElement('div');
    main.className = 'char-main';
    main.textContent = item[0];
    main.setAttribute('title', '空格字符');
    var label = document.createElement('div');
    label.className = 'char-label';
    label.textContent = item[1] + (item[2] ? ' · ' + item[2] : '');
    cell.appendChild(main);
    cell.appendChild(label);
    enhanceFavoriteCell(cell, item[0], item[1], '各种空格');
    cell.addEventListener('click', function() {
      copyText(item[0]);
    });
    cell.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    cell.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    });
    cell.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    });
    grid.appendChild(cell);
  });
}

/* ===== 最近复制记录 ===== */
var HISTORY_KEY = 'character-copy-history-v1';
var HISTORY_LIMIT = 100;
var HISTORY_PREVIEW_LIMIT = 10;
var historyExpanded = false;
var copyHistory = loadCopyHistory();
var historyPanel = document.getElementById('history-panel');
var historyList = document.getElementById('history-list');
var historyEmpty = document.getElementById('history-empty');
var historyCount = document.getElementById('history-count');
var historyToggle = document.getElementById('history-toggle');
var historyClear = document.getElementById('history-clear');

function loadCopyHistory() {
  try {
    var saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(function(item) {
      return typeof item === 'string' && item.length > 0;
    }).slice(0, HISTORY_LIMIT);
  } catch (e) {
    return [];
  }
}

function saveCopyHistory() {
  var snapshot = copyHistory.slice(0, HISTORY_LIMIT);
  while (snapshot.length) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(snapshot));
      copyHistory = snapshot;
      return true;
    } catch (e) {
      snapshot.pop();
    }
  }
  try {
    localStorage.setItem(HISTORY_KEY, '[]');
  } catch (e) {}
  return false;
}

function historyDisplayText(text) {
  if (/^\s+$/.test(text)) {
    var codePoints = Array.from(text).map(function(ch) {
      return 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    });
    return '〈空白字符 ' + codePoints.join(' ') + '〉';
  }
  return text;
}

function renderCopyHistory() {
  var visibleItems = historyExpanded
    ? copyHistory.slice(0, HISTORY_LIMIT)
    : copyHistory.slice(0, HISTORY_PREVIEW_LIMIT);

  historyList.innerHTML = '';
  visibleItems.forEach(function(text, index) {
    var item = document.createElement('div');
    item.className = 'history-item' + (isFavorite(text) ? ' is-favorite' : '');
    item.dataset.favoriteValue = text;

    var copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'history-copy';
    var label = historyDisplayText(text);
    copyButton.title = '再次复制：' + label.slice(0, 120);
    copyButton.setAttribute('aria-label', '再次复制第 ' + (index + 1) + ' 条记录：' + label.slice(0, 80));
    copyButton.addEventListener('click', function() {
      copyText(text);
    });

    var textNode = document.createElement('span');
    textNode.className = 'history-text';
    textNode.textContent = label;
    copyButton.appendChild(textNode);

    var deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'history-delete';
    deleteButton.textContent = '×';
    deleteButton.title = '删除这条记录';
    deleteButton.setAttribute('aria-label', '删除记录：' + label.slice(0, 80));
    deleteButton.addEventListener('click', function(event) {
      event.stopPropagation();
      copyHistory.splice(index, 1);
      saveCopyHistory();
      if (copyHistory.length <= HISTORY_PREVIEW_LIMIT) historyExpanded = false;
      renderCopyHistory();
    });

    item.appendChild(copyButton);
    item.appendChild(createFavoriteButton(text, label, '最近复制'));
    item.appendChild(deleteButton);
    historyList.appendChild(item);
  });

  historyPanel.classList.toggle('expanded', historyExpanded);
  historyCount.textContent = '已保存 ' + copyHistory.length + ' / ' + HISTORY_LIMIT;
  historyEmpty.hidden = copyHistory.length > 0;
  historyClear.hidden = copyHistory.length === 0;
  historyToggle.disabled = copyHistory.length <= HISTORY_PREVIEW_LIMIT;
  historyToggle.textContent = historyExpanded ? '收起' : '展开全部';
  historyToggle.setAttribute('aria-expanded', historyExpanded ? 'true' : 'false');
}

function recordCopiedText(text) {
  var duplicateIndex = copyHistory.indexOf(text);
  if (duplicateIndex !== -1) copyHistory.splice(duplicateIndex, 1);
  copyHistory.unshift(text);
  copyHistory = copyHistory.slice(0, HISTORY_LIMIT);
  saveCopyHistory();
  renderCopyHistory();
}

historyToggle.addEventListener('click', function() {
  if (copyHistory.length <= HISTORY_PREVIEW_LIMIT) return;
  historyExpanded = !historyExpanded;
  renderCopyHistory();
});

historyClear.addEventListener('click', function() {
  if (!copyHistory.length) return;
  if (!window.confirm('确定清空全部复制记录吗？')) return;
  copyHistory = [];
  historyExpanded = false;
  saveCopyHistory();
  renderCopyHistory();
  showTip('复制记录已清空');
});

renderCopyHistory();

/* ===== 复制功能 ===== */
function copyText(text) {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function() {
      recordCopiedText(text);
      showTip(copiedTipMessage(text));
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  var ok = false;
  try {
    ok = document.execCommand('copy');
  } catch(e) {}
  document.body.removeChild(textarea);
  if (ok) {
    recordCopiedText(text);
    showTip(copiedTipMessage(text));
  } else {
    showTip('复制失败,请手动复制');
  }
}

function copiedTipMessage(text) {
  var label = historyDisplayText(text).replace(/\s+/g, ' ');
  if (label.length > 48) label = label.slice(0, 48) + '…';
  return '已复制：' + label;
}

function showTip(msg, type) {
  var tip = document.getElementById('tipbar');
  tip.textContent = msg;
  tip.classList.remove('success', 'error');
  if (type === 'success') tip.classList.add('success');
  else if (type === 'error') tip.classList.add('error');
  tip.classList.add('show');
  clearTimeout(tip._timer);
  tip._timer = setTimeout(function() {
    tip.classList.remove('show');
  }, 2000);
}

/* ===== 标签页切换 ===== */
var tabs = document.querySelectorAll('.tab-item');
var panels = document.querySelectorAll('.gnN');

// Keyboard navigation for tabs
var currentTabIndex = 0;
tabs.forEach(function(tab, index) {
  tab.tabIndex = 0;
  tab.setAttribute('role', 'button');
  tab.setAttribute('aria-label', '切换 ' + tab.dataset.tab + ' 标签页');
  tab.addEventListener('click', function() {
    selectTab(index);
  });
});

// Initialize first tab as active
selectTab(0);

function selectTab(index) {
  // Wrap around for keyboard navigation
  currentTabIndex = index;
  if (currentTabIndex >= tabs.length) currentTabIndex = 0;
  if (currentTabIndex < 0) currentTabIndex = tabs.length - 1;

  tabs.forEach(function(t, i) {
    t.classList.toggle('active', i === currentTabIndex);
    t.setAttribute('aria-selected', i === currentTabIndex);
    panels[i].classList.toggle('show', i === currentTabIndex);
  });
}

// 判断是否正在输入控件中(此时不应触发标签页快捷键)
function isTypingIn(e) {
  var t = e.target;
  if (!t) return false;
  var n = t.tagName;
  return n === 'INPUT' || n === 'TEXTAREA' || n === 'SELECT' || t.isContentEditable;
}

// Arrow key navigation
document.addEventListener('keydown', function(e) {
  if (isTypingIn(e)) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    selectTab((currentTabIndex + 1) % tabs.length);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    selectTab((currentTabIndex - 1 + tabs.length) % tabs.length);
  }
});

// Number key shortcuts (1-9 for tabs)
document.addEventListener('keydown', function(e) {
  if (isTypingIn(e)) return;
  if (e.key >= '1' && e.key <= '9') {
    var idx = parseInt(e.key) - 1;
    if (idx < tabs.length) {
      e.preventDefault();
      selectTab(idx);
    }
  }
});

/* ===== 公式转换:Unicode 上标/下标映射 ===== */
var SUPER_SCRIPT_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
  'p': 'ᵖ', 'q': 'ᑫ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ',
  'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ',
  'z': 'ᶻ',
  'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴰ', 'E': 'ᴱ',
  'F': 'ᶠ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ',
  'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ',
  'P': 'ᴾ', 'Q': 'ᑫ', 'R': 'ᴿ', 'S': 'ˢ', 'T': 'ᵀ',
  'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ', 'X': 'ˣ', 'Y': 'ʸ',
  'Z': 'ᶻ', '0': '⁰', '1': '¹', '2': '²', '3': '³',
  '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸',
  '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽',
  ')': '⁾', '.': '⁻ⁱ', ',': 'ⁱ', ';': 'ⁱ', ':': 'ⁱ'
};
var SUB_SCRIPT_MAP = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'b': 'ᵦ', 'c': '꜀', 'd': 'ₑ', 'e': 'ₑ',
  'f': '𝒻', 'g': '₉', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ʲ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'q': '𝓺', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ',
  'u': 'ᵤ', 'v': 'ᵥ', 'w': 'ω', 'x': 'ₓ', 'y': 'y',
  'z': '𝓏',
  'α': 'ₐ', 'β': 'β', 'γ': 'γ', 'δ': 'δ', 'ε': 'ε',
  'ζ': 'ζ', 'η': 'η', 'θ': 'θ', 'ι': 'ι', 'κ': 'κ',
  'λ': 'λ', 'μ': 'μ', 'ν': 'ν', 'ξ': 'ξ', 'ο': 'ο',
  'π': 'π', 'ρ': 'ρ', 'σ': 'σ', 'τ': 'τ', 'υ': 'υ',
  'φ': 'φ', 'χ': 'χ', 'ψ': 'ψ', 'ω': 'ω',
  'Α': 'ₐ', 'Β': 'β', 'Γ': 'γ', 'Δ': 'δ', 'Ε': 'ε',
  'Ζ': 'ζ', 'Η': 'η', 'Θ': 'θ', 'Ι': 'ι', 'Κ': 'κ',
  'Λ': 'λ', 'Μ': 'μ', 'Ν': 'ν', 'Ξ': 'ξ', 'Ο': 'ο',
  'Π': 'π', 'Ρ': 'ρ', 'Σ': 'σ', 'Τ': 'τ', 'Υ': 'υ',
  'Φ': 'φ', 'Χ': 'χ', 'Ψ': 'ψ', 'Ω': 'ω'
};

function convertToSuperScript(content) {
  // 先转换 LaTeX 命令
  var s = content
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, function(_, a, b) {
      return (isSimpleAtom(a) ? a : '(' + a + ')') + '/' + (isSimpleAtom(b) ? b : '(' + b + ')');
    })
    .replace(/\\sqrt\[([^\[\]]*)\]\{([^{}]*)\}/g, function(_, n, x) { return '√[' + n + '](' + x + ')'; })
    .replace(/\\sqrt\{([^{}]*)\}/g, function(_, x) { return '√(' + x + ')'; })
    .replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g, function(_, a, b) { return 'C(' + a + ',' + b + ')'; })
    .replace(/\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|coth|ln|log|exp|arg|lim|min|max|sup|inf|det|gcd|deg|bmod|pmod|operatorname|displaystyle|textstyle|scriptstyle|scriptscriptstyle|limits|nolimits)/g, function(_, x) { return x; })
    .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ').replace(/\\epsilon/g, 'ε').replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ').replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ').replace(/\\phi/g, 'φ').replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞').replace(/\\partial/g, '∂').replace(/\\nabla/g, '∇')
    .replace(/\\pm/g, '±').replace(/\\times/g, '×').replace(/\\div/g, '÷')
    .replace(/\\sum/g, '∑').replace(/\\prod/g, '∏').replace(/\\coprod/g, '∐')
    .replace(/\\int/g, '∫').replace(/\\iint/g, '∬').replace(/\\iiint/g, '∭').replace(/\\oint/g, '∮')
    .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥').replace(/\\neq/g, '≠')
    .replace(/\\sim/g, '∼').replace(/\\approx/g, '≈').replace(/\\equiv/g, '≡')
    .replace(/\\in/g, '∈').replace(/\\notin/g, '∉').replace(/\\ni/g, '∋')
    .replace(/\\subset/g, '⊂').replace(/\\supset/g, '⊃')
    .replace(/\\emptyset/g, '∅').replace(/\\cup/g, '∪').replace(/\\cap/g, '∩')
    .replace(/\\forall/g, '∀').replace(/\\exists/g, '∃')
    .replace(/\\rightarrow/g, '→').replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒').replace(/\\Leftarrow/g, '⇐')
    .replace(/\\leftrightarrow/g, '↔').replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\uparrow/g, '↑').replace(/\\downarrow/g, '↓')
    .replace(/\\cdot/g, '·').replace(/\\circ/g, '○')
    .replace(/\\pm/g, '±').replace(/\\mp/g, '∓')
    .replace(/\\ast/g, '∗').replace(/\\star/g, '⋆')
    .replace(/\\prime/g, '′').replace(/\\angle/g, '∠')
    .replace(/\\perp/g, '⊥').replace(/\\parallel/g, '∥')
    .replace(/\\therefore/g, '∴').replace(/\\because/g, '∵')
    .replace(/\\ell/g, 'ℓ').replace(/\\wp/g, '℘')
    .replace(/\\Re/g, 'ℜ').replace(/\\Im/g, 'ℑ')
    .replace(/\\aleph/g, 'ℵ').replace(/\\beth/g, 'ℶ')
    .replace(/\\ldots/g, '…').replace(/\\cdots/g, '⋯')
    .replace(/\\vdots/g, '⋮').replace(/\\ddots/g, '⋱');
  // 然后尝试转换每个字符到上标
  var out = '';
  var hasBad = false;
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (SUPER_SCRIPT_MAP[ch]) out += SUPER_SCRIPT_MAP[ch];
    else if (ch === '\u207D' || ch === '\u207E' || /\s/.test(ch)) out += ch; // 已是上标括号/空白,直接透传
    else { out += ch; hasBad = true; } // 无上标形式(如 /),保留原样并标记
  }
  if (hasBad) out = '\u207D' + out + '\u207E'; // 内容含普通字符时用上标括号 ⁽ ⁾ 包裹
  return out;
}
function convertToSubScript(content) {
  // 先转换 LaTeX 命令
  var s = content
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, function(_, a, b) {
      return (isSimpleAtom(a) ? a : '(' + a + ')') + '/' + (isSimpleAtom(b) ? b : '(' + b + ')');
    })
    .replace(/\\sqrt\{([^{}]*)\}/g, function(_, x) { return '√(' + x + ')'; })
    .replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g, function(_, a, b) { return 'C(' + a + ',' + b + ')'; })
    .replace(/\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|ln|log|exp|lim|min|max|sup|inf|det|gcd|deg)/g, function(_, x) { return x; })
    .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ').replace(/\\epsilon/g, 'ε').replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ').replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ').replace(/\\phi/g, 'φ').replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞').replace(/\\partial/g, '∂').replace(/\\nabla/g, '∇')
    .replace(/\\sum/g, '∑').replace(/\\prod/g, '∏').replace(/\\int/g, '∫')
    .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥').replace(/\\neq/g, '≠')
    .replace(/\\in/g, '∈').replace(/\\notin/g, '∉')
    .replace(/\\rightarrow/g, '→').replace(/\\leftarrow/g, '←')
    .replace(/\\cdot/g, '·').replace(/\\prime/g, '′')
    .replace(/\\angle/g, '∠').replace(/\\ell/g, 'ℓ')
    .replace(/\\ldots/g, '…').replace(/\\cdots/g, '⋯');
  // 然后尝试转换每个字符到下标
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (SUB_SCRIPT_MAP[ch]) out += SUB_SCRIPT_MAP[ch];
    else out += ch; // 没有下标形式的字符保留原样
  }
  return out;
}
function isSimpleAtom(x) {
  return /^[\w\u00A1-\uFFFF]+$/.test(x);
}
function frac(a, b) {
  return (isSimpleAtom(a) ? a : '(' + a + ')') + '/' + (isSimpleAtom(b) ? b : '(' + b + ')');
}

/* ===== LaTeX → 纯文本 转换规则(长命令/变体在前) ===== */
var LATEX_RULES = [
  {re: /\^\{([^{}]*)\}/g, fn: function(_, c) { return convertToSuperScript(c); }},
  {re: /\^\(([^()]*)\)/g, fn: function(_, c) { return convertToSuperScript(c); }},
  {re: /_\(([^()]*)\)/g, fn: function(_, c) { return convertToSubScript(c); }},
  {re: /\_\{([^{}]*)\}/g, fn: function(_, c) { return convertToSubScript(c); }},
  {re: /\^(\w)/g, fn: function(_, c) { return convertToSuperScript(c); }},
  {re: /\_(\w)/g, fn: function(_, c) { return convertToSubScript(c); }},
  {re: /\\binom\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, a, b) { return 'C(' + a + ',' + b + ')'; }},
  {re: /\\sqrt\[([^\[\]]*)\]\{([^{}]*)\}/g, fn: function(_, n, x) { return '∛[' + n + '](' + x + ')'; }},
  {re: /\\sqrt\{([^{}]*)\}/g, fn: function(_, x) { return '√(' + x + ')'; }},
  {re: /\\displaystyle/g, fn: function() { return ''; }},
  {re: /\\textstyle/g, fn: function() { return ''; }},
  {re: /\\scriptstyle/g, fn: function() { return ''; }},
  {re: /\\limits/g, fn: function() { return ''; }},
  {re: /\\nolimits/g, fn: function() { return ''; }},
  {re: /\\arcsinh/g, fn: function() { return 'arcsinh'; }},
  {re: /\\arccosh/g, fn: function() { return 'arccosh'; }},
  {re: /\\arctanh/g, fn: function() { return 'arctanh'; }},
  {re: /\\arcsin/g, fn: function() { return 'arcsin'; }},
  {re: /\\arccos/g, fn: function() { return 'arccos'; }},
  {re: /\\arctan/g, fn: function() { return 'arctan'; }},
  {re: /\\sinh/g, fn: function() { return 'sinh'; }},
  {re: /\\cosh/g, fn: function() { return 'cosh'; }},
  {re: /\\tanh/g, fn: function() { return 'tanh'; }},
  {re: /\\coth/g, fn: function() { return 'coth'; }},
  {re: /\\limsup/g, fn: function() { return 'limsup'; }},
  {re: /\\liminf/g, fn: function() { return 'liminf'; }},
  {re: /\\operatorname\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\max/g, fn: function() { return 'max'; }},
  {re: /\\min/g, fn: function() { return 'min'; }},
  {re: /\\gcd/g, fn: function() { return 'gcd'; }},
  {re: /\\det/g, fn: function() { return 'det'; }},
  {re: /\\sin/g, fn: function() { return 'sin'; }},
  {re: /\\cos/g, fn: function() { return 'cos'; }},
  {re: /\\tan/g, fn: function() { return 'tan'; }},
  {re: /\\cot/g, fn: function() { return 'cot'; }},
  {re: /\\sec/g, fn: function() { return 'sec'; }},
  {re: /\\csc/g, fn: function() { return 'csc'; }},
  {re: /\\lim/g, fn: function() { return 'lim'; }},
  {re: /\\ln/g, fn: function() { return 'ln'; }},
  {re: /\\log/g, fn: function() { return 'log'; }},
  {re: /\\exp/g, fn: function() { return 'exp'; }},
  {re: /\\arg/g, fn: function() { return 'arg'; }},
  {re: /\\deg/g, fn: function() { return '°'; }},
  {re: /\\bmod/g, fn: function() { return ' mod '; }},
  {re: /\\pmod\{([^{}]*)\}/g, fn: function(_, m) { return ' (mod ' + m + ') '; }},
  {re: /\\iint/g, fn: function() { return '∬'; }},
  {re: /\\iiint/g, fn: function() { return '∭'; }},
  {re: /\\oint/g, fn: function() { return '∮'; }},
  {re: /\\int/g, fn: function() { return '∫'; }},
  {re: /\\sum/g, fn: function() { return '∑'; }},
  {re: /\\prod/g, fn: function() { return '∏'; }},
  {re: /\\coprod/g, fn: function() { return '∐'; }},
  {re: /\\infty/g, fn: function() { return '∞'; }},
  {re: /\\pm/g, fn: function() { return '±'; }},
  {re: /\\mp/g, fn: function() { return '∓'; }},
  {re: /\\times/g, fn: function() { return '×'; }},
  {re: /\\div/g, fn: function() { return '÷'; }},
  {re: /\\ast/g, fn: function() { return '*'; }},
  {re: /\\star/g, fn: function() { return '⋆'; }},
  {re: /\\circ/g, fn: function() { return '°'; }},
  {re: /\\prime/g, fn: function() { return '′'; }},
  {re: /\\partial/g, fn: function() { return '∂'; }},
  {re: /\\nabla/g, fn: function() { return '∇'; }},
  {re: /\\angle/g, fn: function() { return '∠'; }},
  {re: /\\perp/g, fn: function() { return '⊥'; }},
  {re: /\\parallel/g, fn: function() { return '∥'; }},
  {re: /\\therefore/g, fn: function() { return '∴'; }},
  {re: /\\because/g, fn: function() { return '∵'; }},
  {re: /\\propto/g, fn: function() { return '∝'; }},
  {re: /\\simeq/g, fn: function() { return '≃'; }},
  {re: /\\sim/g, fn: function() { return '∼'; }},
  {re: /\\approx/g, fn: function() { return '≈'; }},
  {re: /\\equiv/g, fn: function() { return '≡'; }},
  {re: /\\neq/g, fn: function() { return '≠'; }},
  {re: /\\neg/g, fn: function() { return '¬'; }},
  {re: /\\ne/g, fn: function() { return '≠'; }},
  {re: /\\leq/g, fn: function() { return '≤'; }},
  {re: /\\le/g, fn: function() { return '≤'; }},
  {re: /\\geq/g, fn: function() { return '≥'; }},
  {re: /\\ge/g, fn: function() { return '≥'; }},
  {re: /\\ll/g, fn: function() { return '≪'; }},
  {re: /\\gg/g, fn: function() { return '≫'; }},
  {re: /\\mid/g, fn: function() { return '|'; }},
  {re: /\\vert/g, fn: function() { return '|'; }},
  {re: /\\Vert/g, fn: function() { return '‖'; }},
  {re: /\\Leftrightarrow/g, fn: function() { return '⇔'; }},
  {re: /\\leftrightarrow/g, fn: function() { return '↔'; }},
  {re: /\\Rightarrow/g, fn: function() { return '⇒'; }},
  {re: /\\Leftarrow/g, fn: function() { return '⇐'; }},
  {re: /\\rightarrow/g, fn: function() { return '→'; }},
  {re: /\\leftarrow/g, fn: function() { return '←'; }},
  {re: /\\uparrow/g, fn: function() { return '↑'; }},
  {re: /\\downarrow/g, fn: function() { return '↓'; }},
  {re: /\\updownarrow/g, fn: function() { return '↕'; }},
  {re: /\\mapsto/g, fn: function() { return '↦'; }},
  {re: /\\to/g, fn: function() { return '→'; }},
  {re: /\\gets/g, fn: function() { return '←'; }},
  {re: /\\nexists/g, fn: function() { return '∄'; }},
  {re: /\\notin/g, fn: function() { return '∉'; }},
  {re: /\\forall/g, fn: function() { return '∀'; }},
  {re: /\\exists/g, fn: function() { return '∃'; }},
  {re: /\\in/g, fn: function() { return '∈'; }},
  {re: /\\ni/g, fn: function() { return '∋'; }},
  {re: /\\supseteq/g, fn: function() { return '⊇'; }},
  {re: /\\supset/g, fn: function() { return '⊃'; }},
  {re: /\\subseteq/g, fn: function() { return '⊆'; }},
  {re: /\\subset/g, fn: function() { return '⊂'; }},
  {re: /\\sup/g, fn: function() { return 'sup'; }},
  {re: /\\cup/g, fn: function() { return '∪'; }},
  {re: /\\cap/g, fn: function() { return '∩'; }},
  {re: /\\inf/g, fn: function() { return 'inf'; }},
  {re: /\\land/g, fn: function() { return '∧'; }},
  {re: /\\wedge/g, fn: function() { return '∧'; }},
  {re: /\\lor/g, fn: function() { return '∨'; }},
  {re: /\\vee/g, fn: function() { return '∨'; }},
  {re: /\\emptyset/g, fn: function() { return '∅'; }},
  {re: /\\varnothing/g, fn: function() { return '∅'; }},
  {re: /\\varepsilon/g, fn: function() { return 'ε'; }},
  {re: /\\epsilon/g, fn: function() { return 'ε'; }},
  {re: /\\vartheta/g, fn: function() { return 'ϑ'; }},
  {re: /\\theta/g, fn: function() { return 'θ'; }},
  {re: /\\varphi/g, fn: function() { return 'φ'; }},
  {re: /\\phi/g, fn: function() { return 'φ'; }},
  {re: /\\varrho/g, fn: function() { return 'ϱ'; }},
  {re: /\\rho/g, fn: function() { return 'ρ'; }},
  {re: /\\varpi/g, fn: function() { return 'ϖ'; }},
  {re: /\\pi/g, fn: function() { return 'π'; }},
  {re: /\\varsigma/g, fn: function() { return 'ς'; }},
  {re: /\\sigma/g, fn: function() { return 'σ'; }},
  {re: /\\alpha/g, fn: function() { return 'α'; }},
  {re: /\\beta/g, fn: function() { return 'β'; }},
  {re: /\\gamma/g, fn: function() { return 'γ'; }},
  {re: /\\delta/g, fn: function() { return 'δ'; }},
  {re: /\\zeta/g, fn: function() { return 'ζ'; }},
  {re: /\\eta/g, fn: function() { return 'η'; }},
  {re: /\\iota/g, fn: function() { return 'ι'; }},
  {re: /\\kappa/g, fn: function() { return 'κ'; }},
  {re: /\\lambda/g, fn: function() { return 'λ'; }},
  {re: /\\mu/g, fn: function() { return 'μ'; }},
  {re: /\\nu/g, fn: function() { return 'ν'; }},
  {re: /\\xi/g, fn: function() { return 'ξ'; }},
  {re: /\\omicron/g, fn: function() { return 'ο'; }},
  {re: /\\tau/g, fn: function() { return 'τ'; }},
  {re: /\\upsilon/g, fn: function() { return 'υ'; }},
  {re: /\\chi/g, fn: function() { return 'χ'; }},
  {re: /\\psi/g, fn: function() { return 'ψ'; }},
  {re: /\\omega/g, fn: function() { return 'ω'; }},
  {re: /\\Gamma/g, fn: function() { return 'Γ'; }},
  {re: /\\Delta/g, fn: function() { return 'Δ'; }},
  {re: /\\Theta/g, fn: function() { return 'Θ'; }},
  {re: /\\Lambda/g, fn: function() { return 'Λ'; }},
  {re: /\\Xi/g, fn: function() { return 'Ξ'; }},
  {re: /\\Pi/g, fn: function() { return 'Π'; }},
  {re: /\\Sigma/g, fn: function() { return 'Σ'; }},
  {re: /\\Upsilon/g, fn: function() { return 'Υ'; }},
  {re: /\\Phi/g, fn: function() { return 'Φ'; }},
  {re: /\\Psi/g, fn: function() { return 'Ψ'; }},
  {re: /\\Omega/g, fn: function() { return 'Ω'; }},
  {re: /\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, a, b) { return frac(a, b); }},
  {re: /\\tfrac\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, a, b) { return frac(a, b); }},
  {re: /\\frac\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, a, b) { return frac(a, b); }},
  {re: /\\left\./g, fn: function() { return ''; }},
  {re: /\\right\./g, fn: function() { return ''; }},
  {re: /\\left\(/g, fn: function() { return '('; }},
  {re: /\\right\)/g, fn: function() { return ')'; }},
  {re: /\\left\[/g, fn: function() { return '['; }},
  {re: /\\right\]/g, fn: function() { return ']'; }},
  {re: /\\left\{/g, fn: function() { return '{'; }},
  {re: /\\right\}/g, fn: function() { return '}'; }},
  {re: /\\left\|/g, fn: function() { return '|'; }},
  {re: /\\right\|/g, fn: function() { return '|'; }},
  {re: /\\langle/g, fn: function() { return '⟨'; }},
  {re: /\\rangle/g, fn: function() { return '⟩'; }},
  {re: /\\lfloor/g, fn: function() { return '⌊'; }},
  {re: /\\rfloor/g, fn: function() { return '⌋'; }},
  {re: /\\lceil/g, fn: function() { return '⌈'; }},
  {re: /\\rceil/g, fn: function() { return '⌉'; }},
  {re: /\\left/g, fn: function() { return ''; }},
  {re: /\\right/g, fn: function() { return ''; }},
  {re: /\\Biggl/g, fn: function() { return ''; }},
  {re: /\\Biggr/g, fn: function() { return ''; }},
  {re: /\\biggl/g, fn: function() { return ''; }},
  {re: /\\biggr/g, fn: function() { return ''; }},
  {re: /\\Bigl/g, fn: function() { return ''; }},
  {re: /\\Bigr/g, fn: function() { return ''; }},
  {re: /\\bigl/g, fn: function() { return ''; }},
  {re: /\\bigr/g, fn: function() { return ''; }},
  {re: /\\Bigg/g, fn: function() { return ''; }},
  {re: /\\bigg/g, fn: function() { return ''; }},
  {re: /\\Big/g, fn: function() { return ''; }},
  {re: /\\big/g, fn: function() { return ''; }},
  {re: /\\text\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathrm\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathbf\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathit\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathsf\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathtt\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathbb\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathcal\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathscr\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathfrak\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\boldsymbol\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\bm\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\text\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathrm\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathbf\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathit\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathsf\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mathtt\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\mbox\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\textbf\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\textit\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\texttt\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\emph\{([^{}]*)\}/g, fn: function(_, x) { return x; }},
  {re: /\\boxed\{([^{}]*)\}/g, fn: function(_, x) { return '[' + x + ']'; }},
  {re: /\\tag\{([^{}]*)\}/g, fn: function(_, x) { return ' (' + x + ')'; }},
  {re: /\\label\{([^{}]*)\}/g, fn: function() { return ''; }},
  {re: /\\ref\{([^{}]*)\}/g, fn: function(_, x) { return '<' + x + '>'; }},
  {re: /\\eqref\{([^{}]*)\}/g, fn: function(_, x) { return '(' + x + ')'; }},
  {re: /\\cancel\{([^{}]*)\}/g, fn: function(_, x) { return '̸' + x; }},
  {re: /\\cancelto\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, v, x) { return v + '̸' + x; }},
  {re: /\\dbinom\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, a, b) { return 'C(' + a + ',' + b + ')'; }},
  {re: /\\tbinom\{([^{}]*)\}\{([^{}]*)\}/g, fn: function(_, a, b) { return 'C(' + a + ',' + b + ')'; }},
  {re: /\\lvert/g, fn: function() { return '|'; }},
  {re: /\\rvert/g, fn: function() { return '|'; }},
  {re: /\\lVert/g, fn: function() { return '‖'; }},
  {re: /\\rVert/g, fn: function() { return '‖'; }},
  {re: /\\lvert/g, fn: function() { return '|'; }},
  {re: /\\rvert/g, fn: function() { return '|'; }},
  {re: /\\lVert/g, fn: function() { return '‖'; }},
  {re: /\\rVert/g, fn: function() { return '‖'; }},
  {re: /\\implies/g, fn: function() { return '⇒'; }},
  {re: /\\impliedby/g, fn: function() { return '⇐'; }},
  {re: /\\iff/g, fn: function() { return '⇔'; }},
  {re: /\\not\\subset/g, fn: function() { return '⊄'; }},
  {re: /\\not\\supset/g, fn: function() { return '⊅'; }},
  {re: /\\not\\subseteq/g, fn: function() { return '⊈'; }},
  {re: /\\not\\supseteq/g, fn: function() { return '⊉'; }},
  {re: /\\not\\in/g, fn: function() { return '∉'; }},
  {re: /\\not\\mid/g, fn: function() { return '∤'; }},
  {re: /\\complement/g, fn: function() { return '∁'; }},
  {re: /\\ell/g, fn: function() { return 'ℓ'; }},
  {re: /\\wp/g, fn: function() { return '℘'; }},
  {re: /\\Re/g, fn: function() { return 'ℜ'; }},
  {re: /\\Im/g, fn: function() { return 'ℑ'; }},
  {re: /\\aleph/g, fn: function() { return 'ℵ'; }},
  {re: /\\beth/g, fn: function() { return 'ℶ'; }},
  {re: /\\gimel/g, fn: function() { return 'ℷ'; }},
  {re: /\\daleth/g, fn: function() { return 'ℸ'; }},
  {re: /\\diagup/g, fn: function() { return '╱'; }},
  {re: /\\diagdown/g, fn: function() { return '╲'; }},
  {re: /\\measuredangle/g, fn: function() { return '∡'; }},
  {re: /\\sphericalangle/g, fn: function() { return '∢'; }},
  {re: /\\circledcirc/g, fn: function() { return '⊚'; }},
  {re: /\\circledast/g, fn: function() { return '⊛'; }},
  {re: /\\circleddash/g, fn: function() { return '⊝'; }},
  {re: /\\boxminus/g, fn: function() { return '⊟'; }},
  {re: /\\boxplus/g, fn: function() { return '⊞'; }},
  {re: /\\boxtimes/g, fn: function() { return '⊠'; }},
  {re: /\\boxdot/g, fn: function() { return '⊡'; }},
  {re: /\\vdash/g, fn: function() { return '⊢'; }},
  {re: /\\dashv/g, fn: function() { return '⊣'; }},
  {re: /\\vDash/g, fn: function() { return '⊨'; }},
  {re: /\\Vdash/g, fn: function() { return '⊩'; }},
  {re: /\\Vvdash/g, fn: function() { return '⊪'; }},
  {re: /\\nvDash/g, fn: function() { return '⊭'; }},
  {re: /\\nvdash/g, fn: function() { return '⊬'; }},
  {re: /\\preccurlyeq/g, fn: function() { return '≼'; }},
  {re: /\\succcurlyeq/g, fn: function() { return '≽'; }},
  {re: /\\precnsim/g, fn: function() { return '⋨'; }},
  {re: /\\succnsim/g, fn: function() { return '⋩'; }},
  {re: /\\trianglelefteq/g, fn: function() { return '⊴'; }},
  {re: /\\trianglerighteq/g, fn: function() { return '⊵'; }},
  {re: /\\vartriangle/g, fn: function() { return '△'; }},
  {re: /\\blacktriangle/g, fn: function() { return '▲'; }},
  {re: /\\triangledown/g, fn: function() { return '▽'; }},
  {re: /\\blacktriangledown/g, fn: function() { return '▼'; }},
  {re: /\\triangleleft/g, fn: function() { return '◀'; }},
  {re: /\\blacktriangleleft/g, fn: function() { return '◀'; }},
  {re: /\\triangleright/g, fn: function() { return '▶'; }},
  {re: /\\blacktriangleright/g, fn: function() { return '▶'; }},
  {re: /\\bigcirc/g, fn: function() { return '◯'; }},
  {re: /\\bigstar/g, fn: function() { return '★'; }},
  {re: /\\star/g, fn: function() { return '⋆'; }},
  {re: /\\diamond/g, fn: function() { return '◇'; }},
  {re: /\\diamondsuit/g, fn: function() { return '♢'; }},
  {re: /\\heartsuit/g, fn: function() { return '♡'; }},
  {re: /\\clubsuit/g, fn: function() { return '♣'; }},
  {re: /\\spadesuit/g, fn: function() { return '♠'; }},
  {re: /\\wr/g, fn: function() { return '≀'; }},
  {re: /\\amalg/g, fn: function() { return '⨿'; }},
  {re: /\\oplus/g, fn: function() { return '⊕'; }},
  {re: /\\ominus/g, fn: function() { return '⊖'; }},
  {re: /\\otimes/g, fn: function() { return '⊗'; }},
  {re: /\\oslash/g, fn: function() { return '⊘'; }},
  {re: /\\odot/g, fn: function() { return '⊙'; }},
  {re: /\\circlearrowleft/g, fn: function() { return '↺'; }},
  {re: /\\circlearrowright/g, fn: function() { return '↻'; }},
  {re: /\\curvearrowleft/g, fn: function() { return '↶'; }},
  {re: /\\curvearrowright/g, fn: function() { return '↷'; }},
  {re: /\\Lsh/g, fn: function() { return '↰'; }},
  {re: /\\Rsh/g, fn: function() { return '↱'; }},
  {re: /\\looparrowleft/g, fn: function() { return '↫'; }},
  {re: /\\looparrowright/g, fn: function() { return '↬'; }},
  {re: /\\nearrow/g, fn: function() { return '↗'; }},
  {re: /\\searrow/g, fn: function() { return '↘'; }},
  {re: /\\swarrow/g, fn: function() { return '↙'; }},
  {re: /\\nwarrow/g, fn: function() { return '↖'; }},
  {re: /\\hookrightarrow/g, fn: function() { return '↪'; }},
  {re: /\\hookleftarrow/g, fn: function() { return '↩'; }},
  {re: /\\leadsto/g, fn: function() { return '⇝'; }},
  {re: /\\longrightarrow/g, fn: function() { return '→'; }},
  {re: /\\longleftarrow/g, fn: function() { return '←'; }},
  {re: /\\Longleftrightarrow/g, fn: function() { return '⇔'; }},
  {re: /\\Longleftarrow/g, fn: function() { return '⇐'; }},
  {re: /\\Longrightarrow/g, fn: function() { return '⇒'; }},
  {re: /\\overline\{([^{}]*)\}/g, fn: function(_, x) { return x + '\u0304'; }},
  {re: /\\bar\{([^{}]*)\}/g, fn: function(_, x) { return x + '\u0304'; }},
  {re: /\\hat\{([^{}]*)\}/g, fn: function(_, x) { return x + '\u0302'; }},
  {re: /\\vec\{([^{}]*)\}/g, fn: function(_, x) { return x + '\u20D7'; }},
  {re: /\\ddot\{([^{}]*)\}/g, fn: function(_, x) { return x + '\u0308'; }},
  {re: /\\dot\{([^{}]*)\}/g, fn: function(_, x) { return x + '\u0307'; }},
  {re: /\\cdots/g, fn: function() { return '⋯'; }},
  {re: /\\ldots/g, fn: function() { return '…'; }},
  {re: /\\dots/g, fn: function() { return '…'; }},
  {re: /\\vdots/g, fn: function() { return '⋮'; }},
  {re: /\\ddots/g, fn: function() { return '⋱'; }},
  {re: /\\cdot/g, fn: function() { return '·'; }},
  {re: /\\qquad/g, fn: function() { return '\u2003\u2003'; }},
  {re: /\\quad/g, fn: function() { return '\u2003'; }},
  {re: /\\enspace/g, fn: function() { return '\u2002'; }},
  {re: /\\hspace\*?\{[^{}]*\}/g, fn: function() { return ' '; }},
  {re: /\\,/, fn: function() { return '\u2009'; }},
  {re: /\\;/, fn: function() { return '\u2005'; }},
  {re: /\\:/, fn: function() { return '\u2004'; }},
  {re: /\\!/, fn: function() { return '\u200A'; }},
  {re: /\\ /, fn: function() { return ' '; }},
  {re: /\\space/g, fn: function() { return ' '; }},
  {re: /\\\\/g, fn: function() { return '\n'; }},
  {re: /\\\{/g, fn: function() { return '{'; }},
  {re: /\\\}/g, fn: function() { return '}'; }},
  {re: /\\_/g, fn: function() { return '_'; }},
  {re: /\\%/g, fn: function() { return '%'; }},
  {re: /\\\$/g, fn: function() { return '$'; }},
  {re: /\\#/g, fn: function() { return '#'; }},
  {re: /\\&/g, fn: function() { return '&'; }},
  {re: /\\backslash/g, fn: function() { return '\\'; }}
];

function latexToPlain(latex) {
  var result = String(latex)
    .replace(/\\_/g, '\uE000')
    .replace(/\\\^/g, '\uE001');
  var errors = [];
  for (var iter = 0; iter < 5; iter++) {
    var changed = false;
    for (var i = 0; i < LATEX_RULES.length; i++) {
      var rule = LATEX_RULES[i];
      result = result.replace(rule.re, function() {
        changed = true;
        try {
          return rule.fn.apply(null, arguments);
        } catch (e) {
          errors.push('转换失败: ' + arguments[0]);
          return arguments[0];
        }
      });
    }
    if (!changed) break;
  }
  result = result.replace(/\uE000/g, '_').replace(/\uE001/g, '^');
  var leftovers = result.match(/\\[a-zA-Z]+/g);
  if (leftovers) {
    for (var j = 0; j < leftovers.length; j++) {
      var name = leftovers[j].slice(1);
      result = result.replace(leftovers[j], '\u27E8' + name + '\u27E9');
    }
  }
  result = result.replace(/\{([^{}]*)\}/g, function(_, content) {
    if (!/[\\{}]/.test(content)) return content;
    return '{' + content + '}';
  });
  return result;
}

function isLatexDelimiterEscaped(value, index) {
  var backslashes = 0;
  while (index > 0 && value.charAt(--index) === '\\') backslashes++;
  return backslashes % 2 === 1;
}

function splitLatexInput(value) {
  var source = String(value).trim()
    .replace(/^\\\[([\s\S]*)\\\]$/, '$1')
    .replace(/^\\\(([\s\S]*)\\\)$/, '$1');
  var parts = [];
  var start = 0;
  var i = 0;
  while (i < source.length) {
    if (source.charAt(i) !== '$' || isLatexDelimiterEscaped(source, i)) { i++; continue; }
    var delimiter = source.charAt(i + 1) === '$' ? '$$' : '$';
    var end = i + delimiter.length;
    while (end < source.length) {
      if (source.slice(end, end + delimiter.length) === delimiter && !isLatexDelimiterEscaped(source, end)) break;
      end++;
    }
    // 未闭合的定界符保留到末尾，避免把其中的 $ 误当成另一条公式。
    if (end >= source.length) break;
    if (i > start) parts.push({text: source.slice(start, i), math: false});
    parts.push({text: source.slice(i + delimiter.length, end), math: true});
    start = end + delimiter.length;
    i = start;
  }
  if (start < source.length || !parts.length) parts.push({text: source.slice(start), math: false});
  return parts;
}

function stripLatexDelimiters(value) {
  return splitLatexInput(value).map(function(part) { return part.text; }).join('').trim();
}

function convertLatex(input) {
  var parts = splitLatexInput(input);
  var hasMath = parts.some(function(part) { return part.math; });
  // 有 $ 定界的公式时，只转换公式内容，保留周围的正文。
  var s = parts.map(function(part) {
    return part.math || !hasMath ? latexToPlain(part.text) : part.text;
  }).join('');
  var errors = [];
  var m = s.match(/\u27E8[^\u27E9]+\u27E9/g);
  if (m) {
    m.forEach(function(e) {
      var name = e.slice(1, -1).replace(/^\\/, '');
      if (errors.indexOf(name) === -1) errors.push(name);
    });
  }
  s = s.replace(/\u27E8[^\u27E9]+\u27E9/g, '');
  s = s.replace(/[ \t\r]+/g, ' ').replace(/^[ \t\r]+|[ \t\r]+$/g, '');
  return {ok: errors.length === 0, text: s, errors: errors};
}

/* ===== 公式UI ===== */
var latexInput = document.getElementById('latex-input');
var resultText = document.getElementById('result-text');
var resultError = document.getElementById('result-error');

var EXAMPLES = [
  '\\frac{a}{b} + \\frac{c}{d}',
  'x^2 + y^2 = z^2',
  'x^{10} + a_3',
  'H_2O',
  '\\sqrt{x^2 + y^2}',
  '\\sum_{i=1}^{n} i^2',
  '\\int_0^1 x^2 \\, dx',
  '\\lim_{x \\to \\infty} \\frac{1}{x}',
  '\\alpha^2 + \\beta^2',
  '\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}'
];

var exampleRow = document.getElementById('example-row');
EXAMPLES.forEach(function(ex) {
  var chip = document.createElement('button');
  chip.className = 'example-chip';
  chip.textContent = ex;
  chip.addEventListener('click', function() {
    latexInput.value = ex;
    convertBtn();
  });
  exampleRow.appendChild(chip);
});

function convertBtn() {
  var raw = latexInput.value.trim();
  if (!raw) {
    resultText.classList.add('hidden');
    resultError.classList.remove('hidden');
    resultError.textContent = '请输入公式';
    return;
  }
  // Show loading state
  resultText.classList.add('hidden');
  resultError.classList.add('hidden');
  resultText.textContent = '转换中...';
  resultText.classList.remove('small');
  resultError.textContent = '';
  // Simulate async then do actual conversion
  setTimeout(function() {
    var r = convertLatex(raw);
    if (r.ok) {
      resultText.classList.remove('hidden');
      resultError.classList.add('hidden');
      resultText.textContent = r.text;
      resultText.classList.remove('small');
    } else {
      resultText.classList.remove('hidden');
      resultText.classList.add('small');
      resultError.classList.remove('hidden');
      resultError.textContent = '⚠ 无法完全转换,以下命令不支持:' + r.errors.join(', ');
      resultText.textContent = r.text;
    }
    // Remove loading state after a brief delay
    resultText.textContent = r.text || '转换完成';
  }, 300);
}

function copyResult() {
  var txt = resultText.textContent;
  if (!txt) return;
  copyText(txt);
}

document.getElementById('btn-convert').addEventListener('click', convertBtn);
document.getElementById('btn-clear').addEventListener('click', function() {
  latexInput.value = '';
  resultText.classList.add('hidden');
  resultError.classList.add('hidden');
  latexInput.focus();
});

/* ===== 纯文本 → LaTeX ===== */
var REV_SUPER = {};
for (var rs in SUPER_SCRIPT_MAP) REV_SUPER[SUPER_SCRIPT_MAP[rs]] = rs;
var REV_SUB = {};
for (var rb in SUB_SCRIPT_MAP) REV_SUB[SUB_SCRIPT_MAP[rb]] = rb;

function convertScriptRuns(s) {
  var out = '';
  var i = 0;
  while (i < s.length) {
    var ch = s.charAt(i);
    if (REV_SUPER[ch]) {
      var run = '';
      while (i < s.length && REV_SUPER[s.charAt(i)]) { run += REV_SUPER[s.charAt(i)]; i++; }
      out += '^{' + run + '}';
    } else if (REV_SUB[ch]) {
      var run2 = '';
      while (i < s.length && REV_SUB[s.charAt(i)]) { run2 += REV_SUB[s.charAt(i)]; i++; }
      out += '_{' + run2 + '}';
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

var TEX_SYMBOL_MAP = {
  'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
  'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
  'ϑ': '\\vartheta', 'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda',
  'μ': '\\mu', 'ν': '\\nu', 'ξ': '\\xi', 'ο': '\\omicron',
  'π': '\\pi', 'ϖ': '\\varpi', 'ρ': '\\rho', 'ϱ': '\\varrho',
  'σ': '\\sigma', 'ς': '\\varsigma', 'τ': '\\tau', 'υ': '\\upsilon',
  'φ': '\\phi', 'ϕ': '\\varphi', 'χ': '\\chi', 'ψ': '\\psi',
  'ω': '\\omega', 'Γ': '\\Gamma', 'Δ': '\\Delta', 'Θ': '\\Theta',
  'Λ': '\\Lambda', 'Ξ': '\\Xi', 'Π': '\\Pi', 'Σ': '\\Sigma',
  'Υ': '\\Upsilon', 'Φ': '\\Phi', 'Ψ': '\\Psi', 'Ω': '\\Omega',
  '∑': '\\sum', '∏': '\\prod', '∐': '\\coprod', '∫': '\\int',
  '∬': '\\iint', '∭': '\\iiint', '∮': '\\oint', '∞': '\\infty',
  '±': '\\pm', '∓': '\\mp', '×': '\\times', '÷': '\\div',
  '·': '\\cdot', '∂': '\\partial', '∇': '\\nabla', '∠': '\\angle',
  '⊥': '\\perp', '∥': '\\parallel', '∴': '\\therefore', '∵': '\\because',
  '∝': '\\propto', '∼': '\\sim', '≃': '\\simeq', '≈': '\\approx',
  '≡': '\\equiv', '≠': '\\neq', '≤': '\\leq', '≥': '\\geq',
  '≪': '\\ll', '≫': '\\gg', '∈': '\\in', '∉': '\\notin',
  '∋': '\\ni', '∅': '\\emptyset', '⊂': '\\subset', '⊃': '\\supset',
  '⊆': '\\subseteq', '⊇': '\\supseteq', '∪': '\\cup', '∩': '\\cap',
  '∧': '\\wedge', '∨': '\\vee', '¬': '\\neg', '∀': '\\forall',
  '∃': '\\exists', '∄': '\\nexists', '→': '\\to', '←': '\\leftarrow',
  '⇒': '\\Rightarrow', '⇐': '\\Leftarrow', '⇔': '\\Leftrightarrow',
  '↔': '\\leftrightarrow', '↑': '\\uparrow', '↓': '\\downarrow',
  '↕': '\\updownarrow', '↦': '\\mapsto', '⋯': '\\cdots', '…': '\\ldots',
  '⋮': '\\vdots', '⋱': '\\ddots', 'ℓ': '\\ell', '⟨': '\\langle',
  '⟩': '\\rangle', '°': '^{\\circ}', '′': '\\prime'
};

function convertSymbols(s) {
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (TEX_SYMBOL_MAP[ch]) {
      out += TEX_SYMBOL_MAP[ch];
      var nx = s.charAt(i + 1);
      if (nx && /[A-Za-z0-9]/.test(nx)) out += ' ';
    } else {
      out += ch;
    }
  }
  return out;
}

var TEX_RULES_A = [
  {re: /√\(([^()]*)\)/g, out: '\\sqrt{$1}'},
  {re: /∛\[([^\[\]]*)\]\(([^()]*)\)/g, out: '\\sqrt[$1]{$2}'},
  {re: /½/g, out: '\\frac{1}{2}'},
  {re: /⅓/g, out: '\\frac{1}{3}'},
  {re: /⅔/g, out: '\\frac{2}{3}'},
  {re: /¼/g, out: '\\frac{1}{4}'},
  {re: /¾/g, out: '\\frac{3}{4}'},
  {re: /⅕/g, out: '\\frac{1}{5}'},
  {re: /⅖/g, out: '\\frac{2}{5}'},
  {re: /⅗/g, out: '\\frac{3}{5}'},
  {re: /⅘/g, out: '\\frac{4}{5}'},
  {re: /⅙/g, out: '\\frac{1}{6}'},
  {re: /⅚/g, out: '\\frac{5}{6}'},
  {re: /⅐/g, out: '\\frac{1}{7}'},
  {re: /⅛/g, out: '\\frac{1}{8}'},
  {re: /⅜/g, out: '\\frac{3}{8}'},
  {re: /⅝/g, out: '\\frac{5}{8}'},
  {re: /⅞/g, out: '\\frac{7}{8}'},
  {re: /⅑/g, out: '\\frac{1}{9}'},
  {re: /⅒/g, out: '\\frac{1}{10}'},
  {re: /\(([^()]*)\)\s*\/\s*\(([^()]*)\)/g, out: '\\frac{$1}{$2}'},
  {re: /\(([^()]*)\)\s*\/\s*([\w\u00A1-\uFFFF]+)/g, out: '\\frac{$1}{$2}'},
  {re: /([\w\u00A1-\uFFFF]+)\s*\/\s*\(([^()]*)\)/g, out: '\\frac{$1}{$2}'},
  {re: /([\w\u00A1-\uFFFF]+)\s*\/\s*([\w\u00A1-\uFFFF]+)/g, out: '\\frac{$1}{$2}'},
  {re: /([\w\u00A1-\uFFFF])\u0304/g, out: '\\bar{$1}'},
  {re: /([\w\u00A1-\uFFFF])\u0302/g, out: '\\hat{$1}'},
  {re: /([\w\u00A1-\uFFFF])\u20D7/g, out: '\\vec{$1}'},
  {re: /([\w\u00A1-\uFFFF])\u0307/g, out: '\\dot{$1}'},
  {re: /([\w\u00A1-\uFFFF])\u0308/g, out: '\\ddot{$1}'}
];

var TEX_RULES_B = [
  {re: /(^|[^A-Za-z0-9\\])lim(?![A-Za-z0-9])/g, out: '$1\\lim'},
  {re: /(^|[^A-Za-z0-9\\])ln(?![A-Za-z0-9])/g, out: '$1\\ln'},
  {re: /(^|[^A-Za-z0-9\\])log(?![A-Za-z0-9])/g, out: '$1\\log'},
  {re: /(^|[^A-Za-z0-9\\])exp(?![A-Za-z0-9])/g, out: '$1\\exp'},
  {re: /(^|[^A-Za-z0-9\\])sin(?![A-Za-z0-9])/g, out: '$1\\sin'},
  {re: /(^|[^A-Za-z0-9\\])cos(?![A-Za-z0-9])/g, out: '$1\\cos'},
  {re: /(^|[^A-Za-z0-9\\])tan(?![A-Za-z0-9])/g, out: '$1\\tan'},
  {re: /(^|[^A-Za-z0-9\\])cot(?![A-Za-z0-9])/g, out: '$1\\cot'},
  {re: /(^|[^A-Za-z0-9\\])sec(?![A-Za-z0-9])/g, out: '$1\\sec'},
  {re: /(^|[^A-Za-z0-9\\])csc(?![A-Za-z0-9])/g, out: '$1\\csc'},
  {re: /(^|[^A-Za-z0-9\\])max(?![A-Za-z0-9])/g, out: '$1\\max'},
  {re: /(^|[^A-Za-z0-9\\])min(?![A-Za-z0-9])/g, out: '$1\\min'},
  {re: /(^|[^A-Za-z0-9\\])sup(?![A-Za-z0-9])/g, out: '$1\\sup'},
  {re: /(^|[^A-Za-z0-9\\])inf(?![A-Za-z0-9])/g, out: '$1\\inf'},
  {re: /(^|[^A-Za-z0-9\\])det(?![A-Za-z0-9])/g, out: '$1\\det'},
  {re: /(^|[^A-Za-z0-9\\])gcd(?![A-Za-z0-9])/g, out: '$1\\gcd'},
  {re: /(^|[^A-Za-z0-9\\])deg(?![A-Za-z0-9])/g, out: '$1\\deg'},
  {re: /(^|[^A-Za-z0-9\\])mod(?![A-Za-z0-9])/g, out: '$1\\bmod'},
  {re: /_\(([^()]*)\)/g, out: '_{$1}'},
  {re: /\^\(([^()]*)\)/g, out: '^{$1}'},
  {re: /_(\w)/g, out: '_{$1}'},
  {re: /\^(\w)/g, out: '^{$1}'},
  {re: /\u2003\u2003/g, out: '\\qquad'},
  {re: /\u2003/g, out: '\\quad'},
  {re: /\u2002/g, out: '\\enspace'},
  {re: /\u2009/g, out: '\\,'},
  {re: /\u200A/g, out: '\\!'},
  {re: /\u2005/g, out: '\\;'},
  {re: /\u2004/g, out: '\\:'},
  {re: /\u3000/g, out: '\\quad'},
  {re: /\u00A0/g, out: '~'},
  {re: /\u200B/g, out: ''},
  {re: /(^|[^\\])%/g, out: '$1\\%'},
  {re: /(^|[^\\])&/g, out: '$1\\&'},
  {re: /(^|[^\\])\$/g, out: '$1\\$'},
  {re: /(^|[^\\])#/g, out: '$1\\#'},
  {re: /(^|[^\\])_(?!\{)/g, out: '$1\\_'},
  {re: /(^|[^\\])\^(?!\{)/g, out: '$1\\^{}'}
];

function textToLatex(input) {
  var s = String(input);
  s = convertScriptRuns(s);
  for (var i = 0; i < TEX_RULES_A.length; i++) {
    s = s.replace(TEX_RULES_A[i].re, TEX_RULES_A[i].out);
  }
  s = convertSymbols(s);
  for (var j = 0; j < TEX_RULES_B.length; j++) {
    s = s.replace(TEX_RULES_B[j].re, TEX_RULES_B[j].out);
  }
  return s;
}

/* ===== 花体字母双向转换 ===== */
function buildFancyMaps(styleIndex) {
  var style = FANCY_STYLES[styleIndex] || FANCY_STYLES[0];
  var chars = Array.from(style.str);
  var toFancy = {};
  var toPlain = {};
  for (var i = 0; i < 26 && i < chars.length; i++) {
    toFancy[String.fromCharCode(65 + i)] = chars[i];
    toPlain[chars[i]] = String.fromCharCode(65 + i);
  }
  for (var i = 0; i < 26 && (i + 26) < chars.length; i++) {
    toFancy[String.fromCharCode(97 + i)] = chars[i + 26];
    toPlain[chars[i + 26]] = String.fromCharCode(97 + i);
  }
  for (var i = 0; i < 10 && (i + 52) < chars.length; i++) {
    toFancy[String.fromCharCode(48 + i)] = chars[i + 52];
    toPlain[chars[i + 52]] = String.fromCharCode(48 + i);
  }
  return { toFancy: toFancy, toPlain: toPlain };
}

function textToFancy(input, styleIndex) {
  var m = buildFancyMaps(styleIndex);
  var result = '';
  for (var i = 0; i < input.length; i++) {
    var ch = input.charAt(i);
    result += m.toFancy[ch] || ch;
  }
  return result;
}

function fancyToText(input, styleIndex) {
  var m = buildFancyMaps(styleIndex);
  var result = '';
  for (var i = 0; i < input.length; i++) {
    var ch = input.charAt(i);
    result += m.toPlain[ch] || ch;
  }
  return result;
}

var fancyInput = document.getElementById('fancy-input');
var fancyOutput = document.getElementById('fancy-output');
var fancyExampleRow = document.getElementById('fancy-example-row');
var fancyStyleSel = document.getElementById('fancy-style-sel');
var fancyDirection = document.getElementById('fancy-direction');

var FANCY_EXAMPLES = [
  'Hello World',
  'Good Morning',
  'ABCDabcd',
  'Love',
  'Test123',
  'ABCxyz'
];

FANCY_EXAMPLES.forEach(function(ex) {
  var chip = document.createElement('button');
  chip.className = 'example-chip';
  chip.textContent = ex;
  chip.addEventListener('click', function() {
    fancyInput.value = ex;
    convertFancy();
  });
  fancyExampleRow.appendChild(chip);
});

function convertFancy() {
  var raw = fancyInput.value;
  if (!raw) { fancyOutput.textContent = ''; return; }
  var styleIdx = parseInt(fancyStyleSel.value) || 0;
  var dir = fancyDirection.value;
  // Show loading state
  fancyOutput.textContent = '转换中...';
  setTimeout(function() {
    var output;
    if (dir === 'toFancy') {
      output = textToFancy(raw, styleIdx);
    } else {
      output = fancyToText(raw, styleIdx);
    }
    fancyOutput.textContent = output;
  }, 200);
}

function copyFancyResult() {
  var txt = fancyOutput.textContent;
  if (!txt) return;
  copyText(txt);
}

if (fancyStyleSel) fancyStyleSel.addEventListener('change', convertFancy);
if (fancyDirection) fancyDirection.addEventListener('change', convertFancy);
if (fancyInput) fancyInput.addEventListener('input', convertFancy);

var plainInput = document.getElementById('plain-input');
var resultLatex = document.getElementById('result-latex');

var PLAIN_EXAMPLES = [
  '1/2 + 1/3 = 5/6',
  'x² + y² = z²',
  'H₂O',
  'x¹⁰ + a₃',
  '∑ᵢ₌₁ⁿ i²',
  '∫₀¹ x² dx',
  '√(x² + y²)',
  'lim_(x → ∞) 1/x',
  'πr²'
];

var exampleRowPlain = document.getElementById('example-row-plain');
PLAIN_EXAMPLES.forEach(function(ex) {
  var chip = document.createElement('button');
  chip.className = 'example-chip';
  chip.textContent = ex;
  chip.addEventListener('click', function() {
    plainInput.value = ex;
    convertPlain();
  });
  exampleRowPlain.appendChild(chip);
});

function convertPlain() {
  var raw = plainInput.value.trim();
  if (!raw) return;
  resultLatex.classList.remove('hidden');
  resultLatex.textContent = textToLatex(raw);
}

function copyResultLatex() {
  var txt = resultLatex.textContent;
  if (!txt) return;
  copyText(txt);
}

document.getElementById('btn-tolatex').addEventListener('click', convertPlain);
document.getElementById('btn-clear-plain').addEventListener('click', function() {
  plainInput.value = '';
  resultLatex.classList.add('hidden');
  plainInput.focus();
});

/* ===== 初始化 ===== */
var emojiGrid = document.getElementById('emoji-grid');
var emojiSearch = document.getElementById('emoji-search');
var emojiCategory = document.getElementById('emoji-category');
var emojiOnlyFavorites = document.getElementById('emoji-only-favorites');
var emojiCount = document.getElementById('emoji-count');
var emojiMore = document.getElementById('emoji-more');
var emojiFiltered = [];
var emojiShown = 0;
var EMOJI_BATCH_SIZE = 120;

function emojiCodepoints(glyph) {
  return Array.from(glyph).map(function(ch) {
    return 'U+' + ch.codePointAt(0).toString(16).toUpperCase();
  }).join(' ');
}

function appendEmojiBatch() {
  var end = Math.min(emojiShown + EMOJI_BATCH_SIZE, emojiFiltered.length);
  var fragment = document.createDocumentFragment();
  for (var i = emojiShown; i < end; i++) {
    var item = emojiFiltered[i];
    var glyph = item[0];
    var cell = document.createElement('div');
    cell.className = 'char-cell emoji-cell';
    cell.dataset.emoji = glyph;
    cell.title = [item[3], item[1], emojiCodepoints(glyph)].filter(Boolean).join(' · ');
    var main = document.createElement('div');
    main.className = 'char-main';
    main.textContent = glyph;
    var label = document.createElement('div');
    label.className = 'char-label';
    label.textContent = item[3] || item[1] || EMOJI_CATEGORY_NAMES[item[2]];
    cell.appendChild(main);
    cell.appendChild(label);
    enhanceFavoriteCell(cell, glyph, label.textContent, 'Emoji');
    fragment.appendChild(cell);
  }
  emojiGrid.appendChild(fragment);
  emojiShown = end;
  emojiMore.hidden = emojiShown >= emojiFiltered.length;
}

function renderEmojiGrid() {
  var query = emojiSearch.value.trim().toLocaleLowerCase();
  var group = emojiCategory.value;
  var onlyFavorites = emojiOnlyFavorites.checked;
  emojiFiltered = EMOJI_DATA.filter(function(item) {
    if (group && item[2] !== group) return false;
    if (onlyFavorites && !isFavorite(item[0])) return false;
    if (!query) return true;
    var haystack = [item[0], item[1], item[3], item[4], item[2], EMOJI_CATEGORY_NAMES[item[2]], emojiCodepoints(item[0])].join(' ').toLocaleLowerCase();
    return haystack.indexOf(query) !== -1;
  });
  emojiGrid.replaceChildren();
  emojiShown = 0;
  appendEmojiBatch();
  updateEmojiCount();
  if (!emojiFiltered.length) {
    var empty = document.createElement('div');
    empty.className = 'emoji-empty';
    empty.textContent = onlyFavorites ? '没有收藏的 Emoji。可在任意分类点击 ☆ 收藏。' : '没有找到匹配的 Emoji。';
    emojiGrid.appendChild(empty);
  }
}

function updateEmojiCount() {
  emojiCount.textContent = '找到 ' + emojiFiltered.length + ' 个 / 共 ' + EMOJI_DATA.length + ' 个 · 全站收藏 ' + favoriteItems.length + ' 个';
}

Object.keys(EMOJI_CATEGORY_NAMES).forEach(function(group) {
  var option = document.createElement('option');
  option.value = group;
  option.textContent = EMOJI_CATEGORY_NAMES[group];
  emojiCategory.appendChild(option);
});
emojiCategory.insertAdjacentHTML('afterbegin', '<option value="">全部分类</option>');
emojiCategory.value = '';
var emojiSearchTimer;
emojiSearch.addEventListener('input', function() {
  clearTimeout(emojiSearchTimer);
  emojiSearchTimer = setTimeout(renderEmojiGrid, 120);
});
emojiCategory.addEventListener('change', renderEmojiGrid);
emojiOnlyFavorites.addEventListener('change', renderEmojiGrid);
emojiMore.addEventListener('click', appendEmojiBatch);
emojiGrid.addEventListener('click', function(event) {
  var cell = event.target.closest('.emoji-cell');
  if (!cell) return;
  if (!event.target.closest('.favorite-button')) copyText(cell.dataset.emoji);
});
renderEmojiGrid();

/* ===== 键盘可输入的中英文符号 ===== */
var keyboardGrid = document.getElementById('keyboard-grid');
var keyboardSearch = document.getElementById('keyboard-search');
var keyboardCategory = document.getElementById('keyboard-category');
var keyboardCount = document.getElementById('keyboard-count');

Object.keys(KEYBOARD_CATEGORY_NAMES).forEach(function(key) {
  var option = document.createElement('option');
  option.value = key;
  option.textContent = KEYBOARD_CATEGORY_NAMES[key];
  keyboardCategory.appendChild(option);
});
keyboardCategory.insertAdjacentHTML('afterbegin', '<option value="">全部分类</option>');
keyboardCategory.value = '';

function renderKeyboardGrid() {
  var query = keyboardSearch.value.trim().toLocaleLowerCase();
  var category = keyboardCategory.value;
  var matches = KEYBOARD_DATA.filter(function(item) {
    if (category && item[3] !== category) return false;
    return !query || [item[0], item[1], item[2], KEYBOARD_CATEGORY_NAMES[item[3]]].join(' ').toLocaleLowerCase().indexOf(query) !== -1;
  });
  var fragment = document.createDocumentFragment();
  matches.forEach(function(item) {
    var cell = document.createElement('div');
    cell.className = 'char-cell keyboard-cell';
    cell.title = item[1] + ' · ' + item[2];
    var main = document.createElement('div');
    main.className = 'char-main';
    main.textContent = item[0] === ' ' ? '␣' : item[0];
    var label = document.createElement('div');
    label.className = 'char-label';
    label.textContent = item[1];
    cell.appendChild(main);
    cell.appendChild(label);
    enhanceFavoriteCell(cell, item[0], item[1], KEYBOARD_CATEGORY_NAMES[item[3]]);
    cell.addEventListener('click', function() { copyText(item[0]); });
    fragment.appendChild(cell);
  });
  keyboardGrid.replaceChildren(fragment);
  keyboardCount.textContent = '找到 ' + matches.length + ' 个 / 共 ' + KEYBOARD_DATA.length + ' 个';
  if (!matches.length) {
    var empty = document.createElement('div');
    empty.className = 'emoji-empty';
    empty.textContent = '没有找到匹配的键盘符号。';
    keyboardGrid.appendChild(empty);
  }
}

var keyboardSearchTimer;
keyboardSearch.addEventListener('input', function() {
  clearTimeout(keyboardSearchTimer);
  keyboardSearchTimer = setTimeout(renderKeyboardGrid, 120);
});
keyboardCategory.addEventListener('change', renderKeyboardGrid);
renderKeyboardGrid();

renderGrid('roman-grid', DATA.roman, false, false);
renderGrid('math-grid', DATA.math, false, false);
renderGrid('mathops-grid', DATA.mathops, false, false);
renderGrid('super-grid', SUPER_DATA, false, false);
renderSpaceGrid();
renderGrid('other-grid', DATA.other, false, false);
renderGrid('greek-grid', GREEK_DATA, false, false);

// Set focus to first interactive element after rendering
setTimeout(function() {
  var firstFocusable = document.querySelector('.tab-item, input, select');
  if (firstFocusable) firstFocusable.focus();
}, 100);

/* ===== 花体字母平铺选项卡初始化 ===== */
var fancyOpts = document.querySelectorAll('#fancy-style-bar .font-option');
fancyOpts.forEach(function(opt) {
  opt.addEventListener('click', function() {
    var styleIdx = parseInt(this.getAttribute('data-style'));
    fancyOpts.forEach(function(o) { o.classList.remove('active'); });
    this.classList.add('active');
    renderFancyStyle(styleIdx);
  });
});
if (fancyOpts.length > 0) {
  fancyOpts[0].classList.add('active');
  renderFancyStyle(0);
}

/* ===== 花体文字转换初始化 ===== */
var fancySel2 = document.getElementById('fancy-style-sel');
if (fancySel2) {
  FANCY_STYLES.forEach(function(st, i) {
    var op = document.createElement('option');
    op.value = i;
    op.textContent = st.name;
    fancySel2.appendChild(op);
  });
}

/* ===== 图片生成:文字 → 透明 PNG ===== */
var imgText = document.getElementById('img-text');
var imgFont = document.getElementById('img-font');
var imgScale = document.getElementById('img-scale');
var imgSize = document.getElementById('img-size');
var imgColor = document.getElementById('img-color');
var imgCanvas = document.getElementById('img-canvas');

function drawPngCanvas() {
  if (!imgCanvas) return;
  var text = imgText.value;
  var fontSize = parseInt(imgSize.value, 10);
  if (!fontSize || fontSize < 8) fontSize = 8;
  if (fontSize > 400) fontSize = 400;
  var scale = parseInt(imgScale.value, 10) || 1;
  var fontStr = fontSize + 'px ' + imgFont.value;
  var lines = text === '' ? [''] : text.split('\n');
  var lineHeight = Math.round(fontSize * 1.4);
  var pad = Math.round(fontSize * 0.35);

  var ctx = imgCanvas.getContext('2d');
  ctx.font = fontStr;
  var maxW = 0;
  for (var i = 0; i < lines.length; i++) {
    var w = ctx.measureText(lines[i]).width;
    if (w > maxW) maxW = w;
  }
  var cssW = Math.ceil(maxW + pad * 2);
  var cssH = Math.ceil(lineHeight * lines.length + pad * 2);

  imgCanvas.width = Math.max(1, Math.round(cssW * scale));
  imgCanvas.height = Math.max(1, Math.round(cssH * scale));

  ctx = imgCanvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.font = fontStr;
  ctx.fillStyle = imgColor.value || '#7c0a21';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (var j = 0; j < lines.length; j++) {
    ctx.fillText(lines[j], pad, pad + lineHeight * (j + 0.5));
  }
}

function downloadPng() {
  if (!imgText.value) {
    showTip('请先输入文字', 'error');
    return;
  }
  drawPngCanvas();
  imgCanvas.toBlob(function(blob) {
    if (!blob) {
      showTip('图片生成失败', 'error');
      return;
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '透明文字.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    showTip('已下载透明 PNG 图片', 'success');
  }, 'image/png');
}

if (imgText) {
  imgText.addEventListener('input', drawPngCanvas);
  imgFont.addEventListener('change', drawPngCanvas);
  imgScale.addEventListener('change', drawPngCanvas);
  imgSize.addEventListener('input', drawPngCanvas);
  imgColor.addEventListener('input', drawPngCanvas);
  document.getElementById('btn-download-png').addEventListener('click', downloadPng);
  drawPngCanvas();
}

/* ===== 纯透明占位图 ===== */
var blankW = document.getElementById('blank-w');
var blankH = document.getElementById('blank-h');

function downloadBlankPng() {
  var w = Math.round(Number(blankW.value));
  var h = Math.round(Number(blankH.value));
  if (!w || !h || w < 1 || h < 1) {
    showTip('请输入有效的长宽', 'error');
    return;
  }
  if (w > 8192 || h > 8192) {
    showTip('长宽不能超过 8192', 'error');
    return;
  }
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.toBlob(function(blob) {
    if (!blob) {
      showTip('图片生成失败', 'error');
      return;
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '透明图_' + w + 'x' + h + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    showTip('已下载 ' + w + '×' + h + ' 透明 PNG', 'success');
  }, 'image/png');
}

if (blankW) {
  document.getElementById('btn-download-blank').addEventListener('click', downloadBlankPng);
}

/* ===== LaTeX 数学排版与指定尺寸 PNG ===== */
var latexPreview = document.getElementById('latex-image-preview');
var latexImageError = document.getElementById('latex-image-error');
var latexWidth = document.getElementById('latex-width');
var latexHeight = document.getElementById('latex-height');
var latexColor = document.getElementById('latex-color');
var renderLatexButton = document.getElementById('btn-render-latex');
var downloadLatexButton = document.getElementById('btn-download-latex');

function setLatexImageError(message) {
  latexImageError.textContent = message || '';
  latexImageError.classList.toggle('hidden', !message);
}

var mathJaxLoadPromise;
function loadMathJax() {
  if (window.MathJax && MathJax.tex2svgPromise) return Promise.resolve();
  if (!mathJaxLoadPromise) {
    mathJaxLoadPromise = new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = 'vendor/mathjax-tex-svg-3.2.2.js';
      script.onload = function() {
        if (!window.MathJax || !MathJax.tex2svgPromise) { reject(new Error('公式渲染器初始化失败')); return; }
        MathJax.startup.promise.then(resolve, reject);
      };
      script.onerror = function() { reject(new Error('公式渲染器未能加载，请刷新页面重试')); };
      document.head.appendChild(script);
    }).catch(function(error) { mathJaxLoadPromise = null; throw error; });
  }
  return mathJaxLoadPromise;
}

async function renderLatexImagePreview() {
  var tex = stripLatexDelimiters(latexInput.value);
  if (!tex) throw new Error('请先输入 LaTeX 公式');
  latexPreview.replaceChildren();
  await loadMathJax();
  var wrapper = await MathJax.tex2svgPromise(tex, {display: true});
  var svg = wrapper.querySelector('svg');
  if (!svg) throw new Error('公式未能生成 SVG');
  if (wrapper.querySelector('[data-mjx-error], mjx-merror')) throw new Error('LaTeX 语法有误，请检查公式');
  svg.style.color = latexColor.value;
  svg.style.fill = latexColor.value;
  latexPreview.replaceChildren(svg);
  setLatexImageError('');
  return svg;
}

function latexImageDimensions() {
  var width = Number(latexWidth.value);
  var height = Number(latexHeight.value);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 8192 || height > 8192) {
    throw new Error('宽和高请输入 1–8192 之间的整数像素');
  }
  if (width * height > 32000000) throw new Error('图片像素总数不能超过 3200 万，请缩小宽或高');
  return {width: width, height: height};
}

async function exportLatexPng() {
  var dimensions = latexImageDimensions();
  var source = await renderLatexImagePreview();
  var box = source.viewBox.baseVal;
  if (!box || !box.width || !box.height) throw new Error('无法读取公式尺寸');
  var padding = Math.min(dimensions.width, dimensions.height) * 0.05;
  var availableWidth = Math.max(1, dimensions.width - padding * 2);
  var availableHeight = Math.max(1, dimensions.height - padding * 2);
  var ratio = Math.min(availableWidth / box.width, availableHeight / box.height);
  var drawWidth = box.width * ratio;
  var drawHeight = box.height * ratio;
  var clone = source.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(drawWidth));
  clone.setAttribute('height', String(drawHeight));
  clone.style.color = latexColor.value;
  clone.style.fill = latexColor.value;
  var blob = new Blob([new XMLSerializer().serializeToString(clone)], {type: 'image/svg+xml;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var image = new Image();
  try {
    await new Promise(function(resolve, reject) {
      image.onload = resolve;
      image.onerror = function() { reject(new Error('SVG 图片载入失败')); };
      image.src = url;
    });
    var canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    var context = canvas.getContext('2d');
    if (!context) throw new Error('浏览器无法创建指定尺寸的画布');
    context.drawImage(image, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
    var png = await new Promise(function(resolve, reject) {
      canvas.toBlob(function(result) { result ? resolve(result) : reject(new Error('PNG 导出失败')); }, 'image/png');
    });
    var downloadUrl = URL.createObjectURL(png);
    var anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'LaTeX公式_' + canvas.width + 'x' + canvas.height + '.png';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function() { URL.revokeObjectURL(downloadUrl); }, 1000);
    showTip('已下载 ' + canvas.width + '×' + canvas.height + ' 透明 PNG', 'success');
  } finally {
    URL.revokeObjectURL(url);
  }
}

renderLatexButton.addEventListener('click', async function() {
  renderLatexButton.disabled = true;
  try { await renderLatexImagePreview(); }
  catch (error) { setLatexImageError(error.message || '公式渲染失败'); }
  finally { renderLatexButton.disabled = false; }
});
downloadLatexButton.addEventListener('click', async function() {
  downloadLatexButton.disabled = true;
  try { await exportLatexPng(); }
  catch (error) { setLatexImageError(error.message || '图片导出失败'); }
  finally { downloadLatexButton.disabled = false; }
});
latexColor.addEventListener('input', function() {
  var svg = latexPreview.querySelector('svg');
  if (svg) { svg.style.color = latexColor.value; svg.style.fill = latexColor.value; }
});

/* ===== 网页部署时缓存拆分后的静态文件 ===== */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').catch(function() { /* Page remains usable without offline cache. */ });
  });
}
