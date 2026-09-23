'use strict';
(() => {
  const button = document.getElementById('voice');
  const input = document.getElementById('input');
  const status = document.getElementById('voice-status');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const locked = [...document.querySelectorAll('#form button[type="submit"], [data-example]')];
  let session = null;
  function reset() {
    button.textContent = '语音输入';
    button.setAttribute('aria-pressed', 'false');
    button.disabled = false;
    input.readOnly = false;
    locked.forEach(el => { el.disabled = false; });
  }
  if (!Recognition || !window.isSecureContext) {
    button.disabled = true;
    status.textContent = !window.isSecureContext
      ? '语音输入需要 HTTPS 或本机地址，请通过启动程序打开网页。'
      : '当前浏览器不支持语音输入。可在支持语音识别的浏览器中打开，或使用输入法的语音功能。';
    return;
  }
  button.addEventListener('click', () => {
    if (session) {
      button.disabled = true;
      status.textContent = '正在结束识别…';
      session.recognition.stop();
      return;
    }
    let recognition;
    try { recognition = new Recognition(); }
    catch { status.textContent = '无法启动语音识别，请使用输入法语音输入或键盘输入。'; return; }
    const current = { recognition, text: '', error: false, timer: null };
    session = current;
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    input.readOnly = true;
    locked.forEach(el => { el.disabled = true; });
    button.textContent = '停止语音';
    button.setAttribute('aria-pressed', 'true');
    status.textContent = '正在启动麦克风，请允许浏览器使用麦克风…';
    const finish = () => {
      if (session !== current) return;
      clearTimeout(current.timer);
      session = null;
      reset();
      if (current.error) return;
      if (!current.text.trim()) { status.textContent = '没有识别到完整语音，请点击语音输入重试。原有文字已保留。'; return; }
      // Match the input's UTF-16 maxlength without splitting a surrogate pair.
      let text = '';
      for (const char of current.text.trim()) { if ((text + char).length > input.maxLength) break; text += char; }
      input.value = text;
      status.textContent = text.length < current.text.trim().length
        ? '已填入前 120 个字符，请检查文字后点击“查看”。'
        : '语音已填入，请检查文字后点击“查看”。';
      input.focus();
    };
    recognition.onstart = () => { if (session === current) status.textContent = '正在聆听，请说普通话。说完稍作停顿，或点击“停止语音”。'; };
    recognition.onresult = event => {
      if (session !== current) return;
      let finalText = '', interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      current.text = finalText;
      status.textContent = `正在识别：${(finalText + interim).slice(0,120)}`;
    };
    recognition.onerror = event => {
      if (session !== current) return;
      current.error = true;
      const errors = {
        'not-allowed': '麦克风权限被拒绝，请在浏览器的网站设置中允许麦克风后重试。',
        'service-not-allowed': '浏览器的语音识别服务不可用，请换用其他支持语音识别的浏览器或输入法。',
        'audio-capture': '未找到可用的麦克风，请检查连接及系统麦克风权限。',
        'no-speech': '没有听到声音，请靠近麦克风，用普通话再试一次。',
        network: '无法连接语音识别服务，请检查网络，或使用输入法的语音输入。',
        'language-not-supported': '当前语音服务不支持普通话，请换用输入法的语音输入。',
        aborted: '语音输入已取消，原有文字已保留。'
      };
      status.textContent = errors[event.error] || '语音识别失败，请重试或直接输入中文。';
      finish();
    };
    recognition.onend = finish;
    try {
      recognition.start();
      current.timer = setTimeout(() => {
        if (session !== current) return;
        current.error = true;
        status.textContent = '语音识别等待超时，请重试。原有文字已保留。';
        finish();
        recognition.abort();
      }, 60000);
    } catch {
      current.error = true;
      status.textContent = '无法启动麦克风，请检查浏览器权限后重试。';
      finish();
    }
  });
  window.addEventListener('pagehide', () => {
    if (session) {
      const current = session;
      session = null;
      clearTimeout(current.timer);
      current.recognition.abort();
      reset();
    }
  });
})();
