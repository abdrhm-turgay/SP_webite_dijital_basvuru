(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const form = get('short-form');
  const products = [...form.querySelectorAll('input[name="products"]')];
  const fields = ['firstName','lastName','phone','email','identity','businessType','company','website','volume'];
  const names = {virtual:'Sanal POS',physical:'Fiziki POS',softpos:'CebimPOS',link:'Link ile ödeme',corporate:'Kurumsal tahsilat',undecided:'Karar veremedim'};
  let attempted = false;
  let submitting = false;
  const selected = () => products.filter(input => input.checked).map(input => input.value);
  const setError = (id, message) => {
    get(id+'-error').textContent = message;
    if (message) get(id).setAttribute('aria-invalid','true');
    else get(id).removeAttribute('aria-invalid');
  };
  const productError = message => {
    get('products-error').textContent = message;
    get('products-group').classList.toggle('invalid',Boolean(message));
    products.forEach(input => message ? input.setAttribute('aria-invalid','true') : input.removeAttribute('aria-invalid'));
  };
  const validate = id => {
    const input = get(id);
    const value = input.value.trim();
    const missing = {firstName:'Adınızı yazın.',lastName:'Soyadınızı yazın.',phone:'Telefon numaranızı yazın.',email:'E-posta adresinizi yazın.',identity:'TCKN veya VKN’nizi yazın.',businessType:'İşletme türünüzü seçin.',volume:'Aylık ciro tahmininizi seçin.'};
    let message = '';
    if (input.required && !value) message = missing[id];
    else if (['firstName','lastName'].includes(id) && value && (value.length < 2 || !/^[\p{L}\p{M} .’'\-]+$/u.test(value) || !/\p{L}/u.test(value))) message = id === 'firstName' ? 'Adınızı kontrol edin.' : 'Soyadınızı kontrol edin.';
    else if (id === 'phone' && value && !/^5\d{9}$/.test(value.replace(/\D/g,''))) message = '5 ile başlayan 10 haneli cep telefonu numaranızı girin.';
    else if (id === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Geçerli bir e-posta adresi girin.';
    else if (id === 'identity' && value && !/^(?:\d{10}|\d{11})$/.test(value)) message = '10 haneli VKN veya 11 haneli TCKN girin.';
    else if (id === 'website' && value) {
      try {
        const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : 'https://'+value);
        if (!['http:','https:'].includes(url.protocol) || !url.hostname.includes('.') || /\s/.test(value) || url.username || url.password) message = 'Geçerli bir web adresi girin veya alanı boş bırakın.';
      } catch { message = 'Geçerli bir web adresi girin veya alanı boş bırakın.'; }
    }
    setError(id,message);
    return message;
  };
  get('phone').addEventListener('input',event => {
    let digits = event.target.value.replace(/\D/g,'');
    if (digits.startsWith('90') && digits.length > 10) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0,10);
    event.target.value = [digits.slice(0,3),digits.slice(3,6),digits.slice(6,8),digits.slice(8,10)].filter(Boolean).join(' ');
  });
  get('identity').addEventListener('input',event => { event.target.value = event.target.value.replace(/\D/g,'').slice(0,11); });
  fields.forEach(id => {
    const input = get(id);
    input.addEventListener('blur',() => { if (input.value || attempted) validate(id); });
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input',() => {
      if (input.hasAttribute('aria-invalid')) setError(id,'');
      get('error-summary').hidden = true;
    });
  });
  products.forEach(input => input.addEventListener('change',() => {
    if (input.checked) {
      if (input.value === 'undecided') products.forEach(other => { if(other !== input) other.checked=false; });
      else products.find(other => other.value === 'undecided').checked=false;
    }
    productError('');get('error-summary').hidden=true;
  }));
  form.addEventListener('submit',event => {
    event.preventDefault();if(submitting)return;attempted=true;
    const invalid = fields.filter(id => validate(id));
    const noProducts = selected().length === 0;
    productError(noProducts ? 'En az bir ürün seçin veya “Karar veremedim” ile ilerleyin.' : '');
    if (invalid.length || noProducts) {
      get('error-summary').textContent = 'Ön başvuruyu tamamlamak için işaretli alanları kontrol et.';
      get('error-summary').hidden=false;
      const first = invalid.length && invalid[0] !== 'volume' ? get(invalid[0]) : noProducts ? products[0] : get('volume');
      first.focus({preventScroll:true});first.closest('.field,.product').scrollIntoView({block:'center',behavior:'smooth'});
      return;
    }
    submitting=true;
    get('submit-button').disabled=true;
    get('submit-button').setAttribute('aria-busy','true');
    get('submit-button').querySelector('span').textContent='Tamamlanıyor…';
    // Front-end demonstration only. No API, SMS, identity lookup or persistent storage.
    setTimeout(() => {
      get('summary-name').textContent=get('firstName').value.trim()+' '+get('lastName').value.trim();
      get('summary-products').textContent=selected().map(value => names[value]).join(', ');
      get('summary-volume').textContent=get('volume').selectedOptions[0].textContent;
      form.hidden=true;get('success-panel').hidden=false;get('form-title').closest('.form-heading').hidden=true;
      get('basvuru').scrollIntoView({block:'start',behavior:'smooth'});get('success-title').focus({preventScroll:true});
      submitting=false;get('submit-button').disabled=false;get('submit-button').removeAttribute('aria-busy');get('submit-button').querySelector('span').textContent='Ön başvuruyu tamamla';
    },350);
  });
  const showForm = () => {
    get('success-panel').hidden=true;form.hidden=false;get('form-title').closest('.form-heading').hidden=false;
    get('basvuru').scrollIntoView({block:'start',behavior:'smooth'});get('form-title').focus({preventScroll:true});
  };
  get('edit-form').addEventListener('click',showForm);
  get('reset-form').addEventListener('click',() => {
    form.reset();attempted=false;fields.forEach(id => setError(id,''));productError('');get('error-summary').hidden=true;
    ['summary-name','summary-products','summary-volume'].forEach(id => { get(id).textContent=''; });showForm();
  });
  const menus = [...document.querySelectorAll('.nav-dropdown')];
  const closeMenus = () => menus.forEach(menu => { menu.open=false; });
  menus.forEach(menu => {
    menu.addEventListener('toggle',() => { if(menu.open)menus.forEach(other => { if(other !== menu)other.open=false; }); });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenus));
  });
  document.addEventListener('click',event => { if(!event.target.closest('.nav-dropdown'))closeMenus(); });
  document.addEventListener('keydown',event => { if(event.key==='Escape')closeMenus(); });
  get('individual-application').addEventListener('click',() => { closeMenus();showForm();get('businessType').value='individual';setError('businessType','');get('firstName').focus(); });
  document.querySelectorAll('[data-dialog]').forEach(trigger => trigger.addEventListener('click',event => { event.preventDefault();closeMenus();get(trigger.dataset.dialog).showModal(); }));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click',() => dialog.close()));
    dialog.addEventListener('click',event => { const rect=dialog.getBoundingClientRect();if(event.target===dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom))dialog.close(); });
  });
  // Enable submitting only after the demo handler is attached.
  get('submit-button').disabled=false;
})();
