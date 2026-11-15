/*
 * google.script.run 호환 어댑터
 * ---------------------------------------------------------------
 * 기존 코드의 google.script.run.withSuccessHandler(...)
 *   .withFailureHandler(...).함수이름(인자...) 호출을 그대로 두고,
 * 내부에서 Apps Script 웹앱(doPost)으로 fetch 요청을 보냅니다.
 */
(function () {
  var TIMEOUT_MS = 90000; // 이미지 분석(OCR) 시간 고려

  function call(fn, args) {
    var url = window.SIGNIEL_API_URL || '';
    if (!url || url.indexOf('여기에') !== -1) {
      return Promise.reject(new Error('config.js 에 Apps Script 웹앱 URL이 설정되지 않았습니다.'));
    }

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);

    return fetch(url, {
      method: 'POST',
      // text/plain 이어야 CORS preflight 없이 Apps Script가 받을 수 있음
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args }),
      redirect: 'follow',
      signal: ctrl.signal
    })
      .then(function (res) {
        if (!res.ok) throw new Error('서버 응답 오류 (' + res.status + ')');
        return res.json();
      })
      .then(function (json) {
        if (!json || json.ok !== true) {
          throw new Error((json && json.error) || '서버 처리 중 오류가 발생했습니다.');
        }
        return json.result;
      })
      .catch(function (err) {
        if (err && err.name === 'AbortError') {
          throw new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        }
        throw err;
      })
      .finally(function () { clearTimeout(timer); });
  }

  function makeRunner(onOk, onFail) {
    var base = {
      withSuccessHandler: function (fn) { return makeRunner(fn, onFail); },
      withFailureHandler: function (fn) { return makeRunner(onOk, fn); },
      withUserObject: function () { return makeRunner(onOk, onFail); }
    };
    return new Proxy(base, {
      get: function (target, name) {
        if (name in target) return target[name];
        if (typeof name !== 'string') return undefined;
        return function () {
          var args = Array.prototype.slice.call(arguments);
          call(name, args).then(
            function (r) { if (onOk) onOk(r); },
            function (e) { if (onFail) onFail(e); }
          );
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = { run: makeRunner(null, null) };
})();
