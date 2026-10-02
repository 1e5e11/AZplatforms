# 啊这LLM技术细节
>这篇内容是2026.10.1发布的版本AZ I的技术细节。（啊这一号）
>这里只讲模型的架构，不讲是怎么训练的。
## Overview
这个模型总参数量为258,635,264(258.635264 M)

模型权重使用FP32（32位浮点数）保存。主要矩阵运算使用BF16，参数及其梯度保留FP32，Loss累加和分块损失反向中的softmax也使用FP32。推理使用的是INT8。



各部分参数数量如下。
| 部分 | 数量 |
| --- | --- |
| embedding/lm_head (tied) | 50,331,648  (19.46%) |
| attention | 76,095,488  (29.42%) |
| ffn | 132,120,576  (51.08%) |
| norm | 87,552  (0.03%) |

模型一共有28个Transformer Block，每个Block的输入和输出都是768维。

注意力头数量为32，每个头的维度为32，所以注意力内部的维度是$32\times32=1024$。

FFN的中间维度为2048，注意力输出投影的中间维度为200。

下面先按省略batch维度来写。训练或并发推理中，如果一次输入$B$条序列，$(S,d)$就对应$(B,S,d)$。不同序列之间不会互相做注意力。

文中的$AB$表示矩阵乘法，$A\odot B$表示对应位置的元素相乘。



## Embedding
词表大小为65536，$d=768$是embedding嵌入维度

设embedding矩阵为$E$，它的形状是$(65536,768)$

这个矩阵有$65536\times 768=50331648$个参数。

输入的tokens经过embedding后变成形状$(S,d)$

其中$S$为上下文长度，$S\le 4000$

设输入的token ID为

$$
T=(t_0,t_1,\dots,t_{S-1}),\qquad \operatorname{shape}(T)=(S,)
$$

每个$t_p$都是$0\le t_p<65536$的整数。

那么

$$
X_{p,j}=E_{t_p,j},j=1,2,\dots,768
$$

也就是第$p$个token取出$E$的第$t_p$行，一行有768个数。把这$S$行放在一起就得到$(S,768)$的$X$。

这里只是查表。

位置信息在每层注意力里通过RoPE加入。

## Transformer Block
当上述的形状是$(S,d)$的$X$进入Transformer Block后，先经过LayerNorm

这里$X$有$S$行，设其中一个token对应的行向量是$x=(x_1,x_2,\dots,x_{768})$。

### LayerNorm 1
先算这一行的均值

$$
\mu=\frac{1}{768}\sum_{j=1}^{768}x_j
$$

再算这一行的方差

$$
\sigma^2=\frac{1}{768}\sum_{j=1}^{768}(x_j-\mu)^2
$$

这里除以的是768。每个token分别计算自己的均值和方差，不沿着上下文长度$S$求平均。

$$
LN_1(x)=\gamma_1\odot\frac{x-\mu}{\sqrt{\sigma^2+\epsilon}}+\beta_1
$$

其中$\epsilon=10^{-5}=0.00001$，$\gamma_1$和$\beta_1$的形状都是$(768,)$，广播运算时相当于$(1,768)$。

$\gamma_1$和$\beta_1$在$S$行上重复使用。

设归一化后的矩阵为$U$

$$
U=LN_1(X),\qquad \operatorname{shape}(U)=(S,768)
$$

实际带batch时，均值和方差的形状是$(B,S,1)$，输出是$(B,S,768)$。

这个LayerNorm有$768+768=1536$个参数，初始时$\gamma_1=1$，$\beta_1=0$。

### Q、K、V
$U$接下来进入多头注意力。

注意，实际运算的时候把32个头合并。每个头有32维，一共1024维。

$$
Q=UW_Q,\qquad K=UW_K,\qquad V=UW_V
$$

其中

$$
\operatorname{shape}(W_Q)=\operatorname{shape}(W_K)=\operatorname{shape}(W_V)=(768,1024)
$$


代码把这三个投影合成一次矩阵乘法

$$
W_{QKV}=[W_Q\mid W_K\mid W_V],\qquad \operatorname{shape}(W_{QKV})=(768,3072)
$$

$$
Z_{QKV}=UW_{QKV},\qquad (S,768)(768,3072)\longrightarrow(S,3072)
$$

前1024列是$Q$，中间1024列是$K$，最后1024列是$V$。

这一步有$768\times3072=2359296$个参数。

### 拆成32个头
1024维会被拆成32个头，每个头32维。

对第$i$个头，$0\le i<32$，从$W_Q$取出第$32i$到$32i+31$列，就得到$W_{Q,i}$。这里的列索引从0开始。

$$
\operatorname{shape}(W_{Q,i})=\operatorname{shape}(W_{K,i})=\operatorname{shape}(W_{V,i})=(768,32)
$$

用此算出来

$$
Q_i=UW_{Q,i},K_i=UW_{K,i},V_i=UW_{V,i}
$$

它们的形状都是$(S,32)$

每个头都接收完整的768维输入，再投影出自己的32维。这里拆的是投影后的1024维。

把32个头放在一起，$Q$、$K$、$V$的形状就都变成$(32,S,32)$。


### RoPE
接下来对$Q$和$K$做旋转位置编码，$V$保持原样。

每个头有32个数，把相邻的两个数放在一起

$$
(q_0,q_1),(q_2,q_3),\dots,(q_{30},q_{31})
$$

这样一共是16对。

对于位置$p$和第$j$对，$0\le p<S$，$0\le j<16$，旋转角度为

$$
\theta_{p,j}=p\times10000^{-2j/32}
$$

第一对的频率是1，第二对是$10000^{-2/32}$，后面的对依次降低频率。

将第$j$对的两个数记为$q_{2j}$和$q_{2j+1}$，旋转后


$$
\begin{pmatrix}\widetilde q_{2j}\\\widetilde q_{2j+1}\end{pmatrix}
=
\begin{pmatrix}\cos\theta_{p,j}&-\sin\theta_{p,j}\\\sin\theta_{p,j}&\cos\theta_{p,j}\end{pmatrix}
\begin{pmatrix}q_{2j}\\q_{2j+1}\end{pmatrix}
$$

$K$也用同样的角度、同样的相邻配对方式旋转，得到$\widetilde K$。

代码预先准备位置向量和频率向量。


RoPE前后$Q$和$K$的形状不变。cos和sin是根据位置计算的缓存，不是可训练参数。

### Attention Score
对于第$i$个头，

旋转后的$\widetilde Q_i$和$\widetilde K_i$都是$(S,32)$，将$\widetilde K_i$转置后得到$(32,S)$。

于是

$$
R_i=\frac{\widetilde Q_i\widetilde K_i^{\mathsf T}}{\sqrt{32}},\qquad (S,32)(32,S)\longrightarrow(S,S)
$$

$R_i$的第$t$行表示：第$t$个token对上下文里每个位置分别打了多少分。

所有头一起计算时，形状是

$$
(B,32,S,32)(B,32,32,S)\longrightarrow(B,32,S,S)
$$

batch维度和头维度分别对应，同一个头的$Q$只与这个头的$K$计算。

### Causal Mask和Softmax
这个模型是自回归模型，第$t$个位置只能看位置$0$到$t$。

因此定义一个$(S,S)$的mask

$$
M_{t,u}=\begin{cases}0,&u\le t\\-\infty,&u>t\end{cases}
$$

将它加到分数上

$$
\widehat R_i=R_i+M
$$
也就是将严格上三角内的数设为$-\infty$，不包含对角线，当前位置仍然可以关注自己。



接下来对每一行做softmax

$$
(P_i)_{t,u}=\frac{\exp(\widehat R_{i,t,u})}{\sum_{v=0}^{S-1}\exp(\widehat R_{i,t,v})}
$$

因为$\exp(-\infty)=0$，未来位置的权重就是0。

每一行的权重之和为1，$P_i$的形状仍然是$(S,S)$。全部头对应$(B,32,S,S)$。

实际计算softmax时可以先减去这一行的最大值，再取指数，结果不变，可以避免指数过大。

### 用权重对V求和
有了$P_i$之后，再乘$V_i$

$$
O_i=P_iV_i,\qquad (S,S)(S,32)\longrightarrow(S,32)
$$


也就是用第$t$行的注意力权重，对能看到的各个位置的$V$做加权求和。

第一行只能看位置0，所以它的输出就是$V_i$的第0行。后面的行可以混合更多位置的信息。



这里attention dropout为0，直接使用$P_i$。

### 合并头和输出投影
把32个头的输出放回每个token对应的位置

$$
O=\operatorname{Concat}(O_0,O_1,\dots,O_{31}),\qquad \operatorname{shape}(O)=(S,1024)
$$

每一行先放头0的32个数，再放头1的32个数，一直放到头31。

如果直接用一个$(1024,768)$的矩阵，需要$786432$个参数。这里用两个矩阵的乘积表示输出投影，形状分别为$(1024,200)$和$(200,768)$，乘积的形状为$(1024,768)$，秩最多为200。
这样一共有$1024\times200+200\times768=358400$个参数。


先投影到200维

$$
Z_O=OW_A,\qquad \operatorname{shape}(W_A)=(1024,200)
$$

$$
(S,1024)(1024,200)\longrightarrow(S,200)
$$

再投影回768维

$$
A=Z_OW_B,\qquad \operatorname{shape}(W_B)=(200,768)
$$

$$
(S,200)(200,768)\longrightarrow(S,768)
$$



这两个投影之间没有激活函数，也都没有bias，所以合起来可以写成

$$
A=O(W_AW_B),\qquad \operatorname{shape}(W_AW_B)=(1024,768)
$$

$W_AW_B$的秩最多为200。代码直接训练这两个矩阵，前向时按两次乘法计算。



加上前面的QKV，每层attention的参数量为

$$
2359296+358400=2717696
$$

### 第一次残差相加
注意力的输出$A$现在已经回到$(S,768)$，可以与进入这个Block时的$X$直接相加

$$
Y=X+A
$$



注意这里加回来的是原来的$X$，而注意力使用的输入是$LN_1(X)$。

### LayerNorm 2
$Y$接下来经过第二个LayerNorm

$$
U_2=LN_2(Y)=\gamma_2\odot\frac{Y-\mu_Y}{\sqrt{\sigma_Y^2+10^{-5}}}+\beta_2
$$

这里的$\epsilon=10^{-5}=0.00001$。均值和方差仍然分别在每个token的768个数上计算，形状都是$(S,1)$。

$\gamma_2$和$\beta_2$都是$(768,)$，与$LN_1$的参数各自独立。

$U_2$的形状是$(S,768)$，这个LayerNorm同样有1536个参数。

### FFN
这里的FFN使用SwiGLU，有gate和up两路投影。

中间维度先取$768\times4=3072$，乘$2/3$得到2048，再向上对齐到256的倍数，结果仍然是2048。

两路分别计算

$$
G=U_2W_g,\qquad U_{up}=U_2W_u
$$

其中$W_g$和$W_u$的形状都是$(768,2048)$。

所以$G$和$U_{up}$的形状都是$(S,2048)$。

代码把两路合并为一次乘法

$$
Z_F=U_2[W_g\mid W_u],\qquad (S,768)(768,4096)\longrightarrow(S,4096)
$$

再沿最后一维分开，前2048列作为$G$，后2048列作为$U_{up}$。



然后对$G$的每个数计算SiLU

$$
\operatorname{SiLU}(g)=g\operatorname{sigmoid}(g)=\frac{g}{1+e^{-g}}
$$

再与$U_{up}$逐元素相乘

$$
H_F=\operatorname{SiLU}(G)\odot U_{up}
$$

它的形状是$(S,2048)$。

最后用down投影回768维

$$
F=H_FW_d,\qquad \operatorname{shape}(W_d)=(2048,768)
$$

$$
(S,2048)(2048,768)\longrightarrow(S,768)
$$

FFN里的线性层都没有bias。

FFN的参数量是

$$
768\times4096+2048\times768=3145728+1572864=4718592
$$

FFN对每个token分别使用同一套权重，不在这一步把不同位置的token混合起来。

### 第二次残差相加
把FFN输出加到第一次残差相加后的$Y$上

$$
X_{out}=Y+F
$$



输出形状还是$(S,768)$，一个Transformer Block到这里结束。

整个Block可以写成

$$
Y=X+\operatorname{Attention}(LN_1(X))
$$

$$
X_{out}=Y+\operatorname{FFN}(LN_2(Y))
$$

也就是说LayerNorm放在两个子层之前，这是Pre-LayerNorm结构。

## 28层Block
设embedding输出为$X^{(0)}$，第$l$层的输出为$X^{(l+1)}$，其中$0\le l<28$。

每层分别计算

$$
Y^{(l)}=X^{(l)}+\operatorname{Attention}_l(LN_{1,l}(X^{(l)}))
$$

$$
X^{(l+1)}=Y^{(l)}+\operatorname{FFN}_l(LN_{2,l}(Y^{(l)}))
$$

28层的结构相同，每层各自拥有自己的参数。

一个Block的参数量为

$$
2717696+4718592+2\times1536=7439360
$$

28层一共有

$$
28\times7439360=208302080
$$

个参数。

## Final LayerNorm
最后一层输出$X^{(28)}$后，还会经过一次LayerNorm

它的计算方式与Block里的两个LayerNorm相同，使用独立的缩放和偏移参数，$\epsilon=10^{-5}=0.00001$。

$$
H=LN_f(X^{(28)})
$$

输出$H$的形状为$(S,768)$，这一层有1536个参数。

## LM Head
LM Head把每个token的768维表示变成整个词表的分数。

这里与输入embedding共享同一个矩阵$E$，因此

$$
L=HE^{\mathsf T},\qquad (S,768)(768,65536)\longrightarrow(S,65536)
$$

$L$就是logits，带batch时形状为$(B,S,65536)$。

一次前向得到$S$个位置各自的下一token分数，做softmax后可以得到各自的概率分布。生成时只取最后一个位置的输出，预测接在整个输入后面的下一个token。

预训练时，每个位置的输出与它的下一个token标签一起算Loss；SFT时只对有效监督位置计算Loss。

对于第$t$个位置和词表里的第$v$个token

$$
L_{t,v}=\sum_{j=1}^{768}H_{t,j}E_{v,j}
$$

也就是拿当前位置的768维表示，与这个候选token的embedding做点积。

每个位置得到65536个分数，分数越大，代表这个token越可能作为下一个token。

embedding与LM Head用的是同一参数，所以输出层不需要再增加$65536\times768$个参数。这里也没有bias。

模型默认返回的是这些logits。

至此总参数量为

$$
50331648+208302080+1536=258635264
$$

也可以按开头的分组来核对

$$
P_{attention}=28\times2717696=76095488
$$

$$
P_{ffn}=28\times4718592=132120576
$$

$$
P_{norm}=(28\times2+1)\times1536=87552
$$

## 生成下一个token
### 取最后一个位置
生成时只取最后一个位置的logits

$$
l=L[S-1,:],\qquad \operatorname{shape}(l)=(65536,)
$$
这里的65536个分数，表示接在当前这段文本后面的下一个token。

### 调整和采样
推理代码可以先对已经出现过的token使用重复惩罚。设惩罚系数$r>1$，对应的logit调整为

$$
l'_v=\begin{cases}r l_v,&l_v<0\\l_v/r,&l_v\ge0\end{cases}
$$

未出现过的token保持原分数。聊天模式下需要禁止的特殊token，会将对应分数设为$-\infty$。

如果temperature为0，代码直接选择调整后logit最大的token ID。

temperature为$\tau>0$时，先计算

$$
l^{(\tau)}_v=\frac{l'_v}{\tau}
$$

整个向量的形状仍然是$(65536,)$。

使用top-k时，找到第$k$大的分数作为阈值，将小于阈值的分数设为$-\infty$。如果阈值处有相同分数，保留的候选数量可以多于$k$。

使用top-p时，按分数降序排列，做softmax，再逐项累加概率

$$
c_j=\sum_{i=0}^{j}p_i
$$

保留从最大概率开始的一段，包括第一个使累计概率超过top-p阈值的token；剩余候选的分数设为$-\infty$。

top-p在top-k之后执行。筛选结束后再做一次softmax，让剩余候选的概率之和变成1。

最后从这个$(65536,)$的概率向量里按照概率采样一个token ID。

### 接回输入
如果采样到的token是结束标记，就停止生成。

否则将新token拼接在原来的输入后面。直接计算时，下一步会把整个前缀重新输入模型，经过28层Block，再取最后一个位置的logits。

对于长度为$S$的完整序列，attention打分和对V加权求和的计算量都按$S^2$增长。

但是追加token之后，前面的token都相同。利用Causal Mask带来的性质，可以保存各层过去位置的K和V，后续每步只处理新位置，这就是KV cache。

## KV Cache
### 为什么可以复用
下面看某一层的第$i$个头，为了简洁，省略头索引。$K$已经做过RoPE，$V$保持原样，它们的形状都是$(S,32)$。

追加一个token后，旧位置看不到这个新位置。它们的注意力分数不变，新增加那一列的分数都被遮成$-\infty$，因此softmax后的权重是0，旧行的权重也不变。

设原来的注意力权重为$P$，追加后的最后一行记为$[a\mid b]$。其中$a$是对旧位置的权重，形状为$(1,S)$；$b$是对自己的权重，是一个数。新的V为$v$，形状为$(1,32)$。

于是

$$
P'=\begin{pmatrix}P&0\\a&b\end{pmatrix},\qquad
V'=\begin{pmatrix}V\\v\end{pmatrix}
$$

将它们相乘

$$
O'=P'V'=\begin{pmatrix}PV\\aV+bv\end{pmatrix}
=\begin{pmatrix}O\\aV+bv\end{pmatrix}
$$

这里的0是$(S,1)$的零列。可见旧的$O$不变，只多出最后一行。

embedding、LayerNorm、投影和FFN都是分别作用于每个token的。旧位置的输入不变，经过一层后仍然不变；从第一层递推到第28层，这个结论都成立。

因此每层可以保存旧位置的K和V，下一步直接复用。这里按推理时参数固定、dropout关闭、前缀token和位置编号不变来推导。

### 新token怎么计算
第一次先处理完整的提示词，建立28层各自的K、V缓存，这一步叫prefill。提示词最后一个位置的logits用来采样第一个新token。

下一步把这个新token输入模型。每一层先计算它自己的Q、K、V，再对Q和K做RoPE，记为$q$、$k$、$v$，形状都是$(1,32)$。

已经缓存了$S$个token时，新token的位置就是$S$，RoPE必须使用位置$S$的角度，不能因为本次只输入一个token就从位置0开始。

把新K、V接到缓存后面

$$
K'=\begin{pmatrix}K\\k\end{pmatrix},\qquad
V'=\begin{pmatrix}V\\v\end{pmatrix}
$$

两者的形状都是$(S+1,32)$。这一步也保存了当前token自己的K和V，因为它可以关注自己。

只用新Q计算一行分数

$$
r=\frac{q(K')^{\mathsf T}}{\sqrt{32}},\qquad
(1,32)(32,S+1)\longrightarrow(1,S+1)
$$

然后做softmax，对V加权求和

$$
p=\operatorname{softmax}(r),\qquad o=pV'
$$

$$
(1,S+1)(S+1,32)\longrightarrow(1,32)
$$

这就是新位置在这个头上的输出。缓存只包含历史和当前位置，没有未来位置，所以这一行的所有有效缓存位置都可以看。

合并32个头后得到$(1,1024)$，再经过$1024\to200\to768$的输出投影、第一次残差、第二个LayerNorm、FFN和第二次残差，将结果传给下一层。

每层使用自己的缓存，重复28次，最后经过Final LayerNorm和LM Head，得到$(1,65536)$的logits，用来采样再下一个token。

所以复用的是旧位置的计算，新token仍然需要经过完整的28层。过去的Q不参与这次打分，因此不需要缓存旧Q。

### 计算量和缓存大小
模型维度固定时，完整前缀的attention打分和加权求和需要$O(S^2)$的计算；使用缓存后，每步只计算一行，变成$O(S)$。仍然要读取历史K、V，所以单步计算量会随上下文长度增长。

每层的K、V缓存，省略batch时形状都是$(32,S,32)$，带batch时为$(B,32,S,32)$。28层总共保存

$$
2\times28\times B\times S\times32\times32=57344BS
$$

个元素。$B=1$、$S=4000$时，FP32的K、V数据共占875 MiB；这不包括模型权重和其他临时张量，也不计入可训练参数数量。

推理时的KV Catch精度为INT8

追加后总长度仍需满足$S+1\le4000$。如果修改已经缓存的前缀、位置编号或模型权重，需要重新计算受影响的缓存。

## 张量形状汇总

| 运算 | 输入形状 | 输出形状 |
| --- | --- | --- |
| embedding查表 | $(S,)$ | $(S,768)$ |
| LayerNorm 1 | $(S,768)$ | $(S,768)$ |
| 合并QKV投影 | $(S,768)$ | $(S,3072)$ |
| 拆出Q、K、V并拆头 | $(S,3072)$ | 各$(32,S,32)$ |
| Q、K分别做RoPE | 各$(32,S,32)$ | 各$(32,S,32)$ |
| $\widetilde Q\widetilde K^{\mathsf T}/\sqrt{32}$ | $(32,S,32)$和$(32,32,S)$ | $(32,S,S)$ |
| causal mask和softmax | $(32,S,S)$ | $(32,S,S)$ |
| $PV$ | $(32,S,S)$和$(32,S,32)$ | $(32,S,32)$ |
| 合并32个头 | $(32,S,32)$ | $(S,1024)$ |
| 输出投影A | $(S,1024)$ | $(S,200)$ |
| 输出投影B | $(S,200)$ | $(S,768)$ |
| 第一次残差相加 | 两个$(S,768)$ | $(S,768)$ |
| LayerNorm 2 | $(S,768)$ | $(S,768)$ |
| 合并gate、up投影 | $(S,768)$ | $(S,4096)$ |
| 拆成gate和up | $(S,4096)$ | 各$(S,2048)$ |
| SiLU后逐元素相乘 | 两个$(S,2048)$ | $(S,2048)$ |
| down投影 | $(S,2048)$ | $(S,768)$ |
| 第二次残差相加 | 两个$(S,768)$ | $(S,768)$ |
| 重复以上Block共28层 | $(S,768)$ | $(S,768)$ |
| Final LayerNorm | $(S,768)$ | $(S,768)$ |
| 共享LM Head | $(S,768)$ | $(S,65536)$ |
| 取最后位置的logits | $(S,65536)$ | $(65536,)$ |
| softmax后采样 | $(65536,)$ | 一个token ID |

模型前向计算带batch时，在表中对应的形状前面加上$B$；embedding之前的输入就是$(B,S)$。生成部分按上面$B=1$的情况取出最后位置，再采样一个ID。
