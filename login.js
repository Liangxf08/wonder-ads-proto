(function () {
  'use strict';

  var HOME = 'home.html';
  var view = 'chooser';
  var backView = 'chooser';

  var chooser = document.querySelector('[data-panel="chooser"]');
  var password = document.querySelector('[data-panel="password"]');
  var feishu = document.querySelector('[data-panel="feishu"]');
  var form = password;

  function show(next) {
    view = next;
    var auth = next === 'feishu';
    chooser.hidden = next !== 'chooser';
    password.hidden = next !== 'password';
    feishu.hidden = !auth;
    if (next === 'password') {
      var account = form.querySelector('[name="account"]');
      if (account) account.focus();
    }
  }

  function openFeishu() {
    backView = view === 'password' ? 'password' : 'chooser';
    show('feishu');
  }

  function fieldOf(input) {
    return input && input.closest('.form-item');
  }

  function setError(input, on) {
    var item = fieldOf(input);
    if (item) item.classList.toggle('is-error', !!on);
  }

  function validate() {
    var account = form.querySelector('[name="account"]');
    var secret = form.querySelector('[name="password"]');
    var accountEmpty = !account.value.trim();
    var secretEmpty = !secret.value.trim();
    setError(account, accountEmpty);
    setError(secret, secretEmpty);
    if (accountEmpty) account.focus();
    else if (secretEmpty) secret.focus();
    return !accountEmpty && !secretEmpty;
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-open-feishu]')) {
      openFeishu();
      return;
    }
    if (event.target.closest('[data-open-password]')) {
      show('password');
      return;
    }
    var eye = event.target.closest('.login-field__eye');
    if (eye) {
      var input = eye.parentElement.querySelector('input');
      var visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      eye.classList.toggle('is-visible', visible);
      eye.setAttribute('aria-pressed', visible ? 'true' : 'false');
      eye.setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
      return;
    }
    var auth = event.target.closest('[data-auth]');
    if (!auth) return;
    if (auth.getAttribute('data-auth') === 'allow') {
      window.location.href = HOME;
      return;
    }
    show(backView);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validate()) return;
    window.location.href = HOME;
  });

  form.addEventListener('input', function (event) {
    var input = event.target;
    if (input && input.value.trim()) setError(input, false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && view === 'feishu') show(backView);
  });
})();
