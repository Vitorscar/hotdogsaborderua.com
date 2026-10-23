// ==========================================
// CONFIGURAÇÃO DO WHATSAPP
// Formato: 55 + DDD + Número (sem espaços ou traços)
// ==========================================
const WHATS = '5573981904834';

// ==========================================
// ADICIONAIS (valem para dogs e batatas)
// ==========================================
const EXTRAS = [
  {id:'sal', nome:'Salsicha', p:2},
  {id:'mil', nome:'Milho e ervilha', p:1},
  {id:'bat', nome:'Batata palha', p:2},
  {id:'aze', nome:'Azeitona', p:2},
  {id:'ovo', nome:'Ovos de codorna (3 un.)', p:2},
  {id:'ched', nome:'Cheddar', p:1}
];

// ==========================================
// SEÇÕES DO CARDÁPIO
// ==========================================
const CATEGORIAS = [
  {id:'dog',    nome:'Hot Dogs'},
  {id:'batata', nome:'Batata Recheada'},
  {id:'bebida', nome:'Bebidas'}
];

// Opção de borda usada nas batatas recheadas
const BORDA = {id:'borda', nome:'Borda', opts:['Cheddar', 'Requeijão cremoso']};

// ==========================================
// ITENS DO CARDÁPIO
// ==========================================
const ITEMS = [
  // ---------- HOT DOGS ----------
  {id:'trad', cat:'dog', nome:'Tradicional', p:12, ing:['Salsicha','Purê de batata','Milho','Ervilha','Cenoura','Beterraba','Uvas passas','Queijo ralado','Batata palha']},
  {id:'simp', cat:'dog', nome:'Simples', p:10, ing:['Salsicha','Milho','Ervilha','Purê de batata','Batata palha']},
  {id:'cari', cat:'dog', nome:'Estilo carioca', p:18, ing:['Salsicha','Ovos de codorna','Queijo mussarela','Presunto','Purê de batata','Vinagrete','Uvas passas','Batata palha']},
  {id:'dogao', cat:'dog', nome:'Dogão no prato', p:22, ing:['2 salsichas','Bacon','Calabresa em rodelas','Milho','Ervilha','Uvas passas','Repolho','Purê de batata','Queijo parmesão','Batata palha','Cheddar']},
  {id:'kafta', cat:'dog', nome:'Dogkafta', p:18, ing:['Kafta c/ queijo','Purê de batata','Milho','Ervilha','Vinagrete','Queijo parmesão','Batata palha']},

  // ---------- BATATAS RECHEADAS (500g) ----------
  {
    id:'bat-hot', cat:'batata', nome:'Hot Dog', p:15,
    desc:'Batata temperada com margarina e sal, salsinhas em rodelas ao creme de leite, milho, finalizada com queijo mussarela e cheddar. Acompanha batata palha. (500g)',
    ing:['Salsinha','Creme de leite','Milho','Queijo mussarela','Cheddar','Batata palha']
  },
  {
    id:'bat-calabresa', cat:'batata', nome:'Calabresa Turbinada', p:19,
    desc:'Batata temperada com margarina e sal, calabresa em cubos ao molho de queijo mussarela, finalizada com mais queijo mussarela e borda da sua escolha. Acompanha batata palha. (500g)',
    ing:['Calabresa','Molho de queijo','Queijo mussarela','Batata palha'],
    choices:[BORDA]
  },
  {
    id:'bat-strog', cat:'batata', nome:'Strogonoff Supremo', p:24,
    desc:'Batata temperada com manteiga e sal, strogonoff de frango cremoso, finalizada com queijo mussarela e borda da sua escolha. Acompanha batata palha. (500g)',
    ing:['Strogonoff de frango','Queijo mussarela','Batata palha'],
    choices:[BORDA]
  },
  {
    id:'bat-rustica', cat:'batata', nome:'Rústica de Carne', p:26,
    desc:'Batata temperada com margarina e sal, recheada com nossa deliciosa carne desfiada suculenta, finalizada com mussarela e borda da sua escolha. Acompanha batata palha. (500g)',
    ing:['Carne desfiada','Queijo mussarela','Batata palha'],
    choices:[BORDA]
  },

  // ---------- BEBIDAS ----------
  {id:'coca', cat:'bebida', nome:'Coca-Cola Lata', p:6.5, desc:'Lata 350 ml, bem gelada.', ing:[]},
  {id:'coca0', cat:'bebida', nome:'Coca-Cola Lata sem Açúcar', p:6, desc:'Lata 350 ml, bem gelada.', ing:[]}
];

const $ = id => document.getElementById(id);
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let cart = [], cur = null, mode = 'Retirada';

const unit = l => l.item.p + EXTRAS.reduce((s, e) => s + e.p * (l.extras[e.id] || 0), 0);
const total = () => cart.reduce((s, l) => s + unit(l) * l.qty, 0);
const count = () => cart.reduce((s, l) => s + l.qty, 0);

// ==========================================
// RENDERIZA O CARDÁPIO (com as seções)
// ==========================================
function renderMenu() {
  $('menu').innerHTML = CATEGORIAS.map(cat => {
    const list = ITEMS.filter(i => i.cat === cat.id);
    if (!list.length) return '';

    return `
      <div class="title brush" style="font-size:26px;margin:20px 0 10px">${cat.nome}</div>
      ${list.map(i => {
        const descricao = i.desc ? i.desc : `Pão, ${i.ing.join(', ').toLowerCase()}.`;
        return `
        <div class="item">
          <div class="info">
            <h2 class="brush">${esc(i.nome)}</h2>
            <p>${esc(descricao)}</p>
          </div>
          <div class="right">
            <div class="price"><small>R$</small> ${i.p.toFixed(2).replace('.', ',')}</div>
            <button class="btn" data-add="${i.id}">Pedir</button>
          </div>
        </div>`;
      }).join('')}
    `;
  }).join('');
}
renderMenu();

// Evento de clique nos botões "Pedir"
$('menu').onclick = e => {
  const id = e.target.dataset.add;
  if (!id) return;

  const item = ITEMS.find(i => i.id === id);
  cur = {item, removed: [], extras: {}, choices: {}, obs: '', qty: 1};

  // já deixa a primeira opção de escolha marcada (ex.: borda Cheddar)
  (item.choices || []).forEach(ch => { cur.choices[ch.id] = ch.opts[0]; });

  renderItem();
  $('ovItem').classList.add('on');
};

// ==========================================
// JANELA DE DETALHES DO ITEM
// ==========================================
function renderItem() {
  const c = cur;
  const temIngredientes = c.item.ing && c.item.ing.length > 0;
  const ehBebida = c.item.cat === 'bebida';
  const escolhas = c.item.choices || [];

  $('sheetItem').innerHTML = `
    <button class="close" data-x="item">×</button>
    <h3 class="brush">${esc(c.item.nome)}</h3>
    ${c.item.desc ? `<p class="hint" style="margin:0 0 8px">${esc(c.item.desc)}</p>` : ''}

    ${temIngredientes ? `
      <h4>Retirar ingredientes</h4>
      <div class="chips">
        ${c.item.ing.map((g, k) => `<button class="chip ${c.removed.includes(g) ? 'off' : ''}" data-rm="${k}">${esc(g)}</button>`).join('')}
      </div>
      <p class="hint" style="margin-top:6px">Toque para retirar (sem custo).</p>
    ` : ''}

    ${escolhas.map(ch => `
      <h4>${esc(ch.nome)}</h4>
      <div class="chips">
        ${ch.opts.map(o => `<button class="chip ${c.choices[ch.id] === o ? '' : 'off'}" data-ch="${ch.id}" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}
      </div>`).join('')}

    ${ehBebida ? '' : `
      <h4>Adicionais</h4>
      ${EXTRAS.map(x => `
        <div class="row">
          <div>${esc(x.nome)}<br><small>+ ${brl(x.p)}</small></div>
          <div class="step">
            <button data-ex="${x.id}" data-d="-1">−</button>
            <span>${c.extras[x.id] || 0}</span>
            <button data-ex="${x.id}" data-d="1">+</button>
          </div>
        </div>`).join('')}
    `}
        ${ehBebida ? '' : `
      <h4>Observações</h4>
      <textarea id="obs" rows="2" placeholder="Ex.: sem cebola, bem passado...">${esc(c.obs)}</textarea>
    `}

    <div class="row" style="border:0;margin-top:10px">
      <b>Quantidade</b>
      <div class="step">
        <button data-q="-1">−</button>
        <span>${c.qty}</span>
        <button data-q="1">+</button>
      </div>
    </div>

    <button class="btn y" style="width:100%;margin-top:8px;padding:14px;font-size:16px" data-save>
      Adicionar • ${brl(unit(c) * c.qty)}
    </button>`;
}

// Eventos da janela de detalhes do item
$('sheetItem').onclick = e => {
  const t = e.target, d = t.dataset;

  if (d.x) return $('ovItem').classList.remove('on');

  cur.obs = $('obs') ? $('obs').value : cur.obs;

  if (d.rm !== undefined) {
    const g = cur.item.ing[d.rm], k = cur.removed.indexOf(g);
    k < 0 ? cur.removed.push(g) : cur.removed.splice(k, 1);
  } else if (d.ex) {
    cur.extras[d.ex] = Math.max(0, (cur.extras[d.ex] || 0) + +d.d);
  } else if (d.ch) {
    cur.choices[d.ch] = d.opt;
  } else if (d.q) {
    cur.qty = Math.max(1, cur.qty + +d.q);
  } else if (d.save !== undefined) {
    cart.push(cur);
    cur = null;
    $('ovItem').classList.remove('on');
    upd();
    return;
  } else return;

  renderItem();
};

$('ovItem').onclick = e => {
  if (e.target.id === 'ovItem') e.target.classList.remove('on');
};

function upd() {
  $('fab').classList.toggle('on', cart.length > 0);
  $('fabN').textContent = count() + (count() > 1 ? ' itens' : ' item');
  $('fabT').textContent = brl(total());
}

function lineDesc(l) {
  const p = [];

  (l.item.choices || []).forEach(ch => {
    if (l.choices && l.choices[ch.id]) p.push(`${ch.nome}: ${l.choices[ch.id]}`);
  });

  if (l.removed.length) p.push('Sem: ' + l.removed.join(', '));

  const ex = EXTRAS.filter(x => l.extras[x.id]).map(x => `${l.extras[x.id]}x ${x.nome}`);
  if (ex.length) p.push('Extra: ' + ex.join(', '));

  if (l.obs.trim()) p.push('Obs: ' + l.obs.trim());

  return p;
}

// ==========================================
// CEP: máscara + busca automática (ViaCEP)
// ==========================================
function mascaraCEP(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 5) {
    value = value.substring(0, 5) + '-' + value.substring(5, 8);
  }
  input.value = value;
}

async function buscaCEP(cep) {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const d = await res.json();
    if (d.erro) { alert('CEP não encontrado.'); return; }

    if ($('rua'))    $('rua').value    = d.logradouro || '';
    if ($('bairro')) $('bairro').value = d.bairro     || '';
    if ($('cidade')) $('cidade').value = d.localidade ? `${d.localidade}/${d.uf || ''}` : '';

    // guarda no carrinho
    cart.rua    = $('rua')?.value    || '';
    cart.bairro = $('bairro')?.value || '';
    cart.cidade = $('cidade')?.value || '';

    if ($('num')) $('num').focus();
  } catch (err) {
    console.warn('Erro ao buscar CEP:', err);
  }
}

function onCEP(input) {
  mascaraCEP(input);
  cart.cep = input.value;
  const digits = input.value.replace(/\D/g, '');
  if (digits.length === 8) buscaCEP(digits);
}

// ==========================================
// RENDERIZA O CARRINHO
// ==========================================
function renderCart() {
  if (!cart.length) {
    $('ovCart').classList.remove('on');
    return;
  }

  $('sheetCart').innerHTML = `
    <button class="close" data-x>×</button>
    <h3 class="brush">Seu pedido</h3>

   ${cart.map((l, i) => `
  <div class="line" style="position:relative">
    <button class="del" data-del="${i}"
      style="
        position:absolute;
        top:8px;
        right:8px;
        background:#c0392b;
        color:#fff;
        border:0;
        border-radius:6px;
        font-size:12px;
        font-weight:600;
        cursor:pointer;
        padding:4px 10px;
        line-height:1;
        box-shadow:0 1px 3px rgba(0,0,0,.2);
      ">
      Remover
    </button>

    <div class="t" style="padding-right:90px">
      <span>${l.qty}x ${esc(l.item.nome)}</span>
      <span>${brl(unit(l) * l.qty)}</span>
    </div>
    <div class="d">${lineDesc(l).map(esc).join('<br>')}</div>
    <div class="step">
      <button data-cq="${i}" data-d="-1">−</button>
      <span>${l.qty}</span>
      <button data-cq="${i}" data-d="1">+</button>
    </div>
  </div>`).join('')}
    <div class="total">
      <span>Total</span>
      <span>${brl(total())}</span>
    </div>

    <label class="hint">Seu nome</label>
    <input id="nome" placeholder="Nome" value="${esc(cart.nome || '')}">

    <div class="seg">
      <button class="btn ${mode === 'Retirada' ? 'y' : ''}" data-mode="Retirada">Retirada</button>
      <button class="btn ${mode === 'Entrega' ? 'y' : ''}" data-mode="Entrega">Entrega</button>
    </div>

    ${mode === 'Entrega' ? `
      <label class="hint">CEP</label>
      <input id="cep" placeholder="00000-000" maxlength="9" inputmode="numeric"
             value="${esc(cart.cep || '')}" oninput="onCEP(this)">

      <label class="hint">Endereço</label>
      <input id="rua" placeholder="Rua / Avenida" value="${esc(cart.rua || '')}">

      <div style="display:flex;gap:8px">
        <div style="flex:1">
          <label class="hint">Número</label>
          <input id="num" placeholder="Nº" value="${esc(cart.num || '')}">
        </div>
        <div style="flex:2">
          <label class="hint">Bairro</label>
          <input id="bairro" placeholder="Bairro" value="${esc(cart.bairro || '')}">
        </div>
      </div>

      <label class="hint">Cidade / UF</label>
      <input id="cidade" placeholder="Cidade/UF" value="${esc(cart.cidade || '')}" readonly>

      <label class="hint">Complemento</label>
      <input id="comp" placeholder="Apto, bloco, ponto de referência..." value="${esc(cart.comp || '')}">
    ` : ''}

    <label class="hint" style="display:block;margin-top:10px">Pagamento</label>
    <select id="pag">
      <option>Pix</option>
      <option>Dinheiro</option>
      <option>Cartão</option>
    </select>

    <button class="btn wa" style="margin-top:14px" data-send>Enviar pedido no WhatsApp</button>`;

  if (cart.pag) $('pag').value = cart.pag;
}

// Salva os dados digitados no carrinho
function keep() {
  if ($('nome')) {
    cart.nome = $('nome').value;
    cart.pag  = $('pag').value;
  }
  if ($('cep'))    cart.cep    = $('cep').value;
  if ($('rua'))    cart.rua    = $('rua').value;
  if ($('num'))    cart.num    = $('num').value;
  if ($('bairro')) cart.bairro = $('bairro').value;
  if ($('cidade')) cart.cidade = $('cidade').value;
  if ($('comp'))   cart.comp   = $('comp').value;
}

$('fab').onclick = () => {
  renderCart();
  $('ovCart').classList.add('on');
};

$('ovCart').onclick = e => {
  if (e.target.id === 'ovCart') e.target.classList.remove('on');
};

$('sheetCart').onclick = e => {
  const d = e.target.dataset;
  keep();

  if (d.x !== undefined) return $('ovCart').classList.remove('on');
  if (d.cq) {
    const l = cart[d.cq];
    l.qty = Math.max(1, l.qty + +d.d);
  } else if (d.del) {
    cart.splice(d.del, 1);
  } else if (d.mode) {
    mode = d.mode;
  } else if (d.send !== undefined) {
    return send();
  } else return;

  upd();
  renderCart();
};

// ==========================================
// ENVIO PARA O WHATSAPP
// ==========================================
function send() {
  keep();

  const nome = (cart.nome || '').trim();
  if (!nome) {
    $('nome').focus();
    return alert('Por favor, informe seu nome.');
  }

  // Mensagem sem emojis exóticos (evita o caractere � no WhatsApp)
  let msg = '*NOVO PEDIDO - HOT DOG SABOR DE RUA*\n\n';

  cart.forEach(l => {
    msg += `*${l.qty}x ${l.item.nome}* - ${brl(unit(l) * l.qty)}\n`;
    const desc = lineDesc(l);
    desc.forEach(x => { msg += `  - ${x}\n`; });
    msg += '\n';
  });

  msg += `*TOTAL: ${brl(total())}*\n\n`;
  msg += `*Cliente:* ${nome}\n`;
  msg += `*Modalidade:* ${mode}\n`;

  if (mode === 'Entrega') {
    const cep    = (cart.cep    || '').trim();
    const rua    = (cart.rua    || '').trim();
    const num    = (cart.num    || '').trim();
    const bairro = (cart.bairro || '').trim();
    const cidade = (cart.cidade || '').trim();
    const comp   = (cart.comp   || '').trim();

    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(cep)) { $('cep').focus();    return alert('Informe um CEP válido (ex: 00000-000).'); }
    if (!rua)                { $('rua').focus();    return alert('Informe o endereço.'); }
    if (!num)                { $('num').focus();    return alert('Informe o número.'); }
    if (!bairro)             { $('bairro').focus(); return alert('Informe o bairro.'); }

    msg += `*CEP:* ${cep}\n`;
    msg += `*Endereco:* ${rua}, ${num}${comp ? ' - ' + comp : ''}\n`;
    msg += `*Bairro:* ${bairro}\n`;
    if (cidade) msg += `*Cidade:* ${cidade}\n`;
  }

  msg += `*Pagamento:* ${cart.pag || 'Pix'}`;

  window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`, '_blank');
}
