/* =========================================
       ELEMENT
    ========================================= */

    const pasteArea =
      document.getElementById(
        'pasteArea'
      );

    const mobileImageInput =
      document.getElementById(
        'mobileImageInput'
      );

    const loading =
      document.getElementById(
        'loading'
      );

    const result =
      document.getElementById(
        'result'
      );

    const statusBox =
      document.getElementById(
        'status'
      );


    const popupOverlay =
      document.getElementById(
        'popupOverlay'
      );

    const popup =
      document.getElementById(
        'popup'
      );

    const popupIcon =
      document.getElementById(
        'popupIcon'
      );

    const popupTitle =
      document.getElementById(
        'popupTitle'
      );

    const popupText =
      document.getElementById(
        'popupText'
      );

    const popupButton =
      document.getElementById(
        'popupButton'
      );


    /* =========================================
       POPUP
    ========================================= */

    function showPopup(
      type,
      title,
      text,
      button
    ) {

      popup.className =
        'popup ' +
        (
          type ||
          'processing'
        );


      if (type === 'success') {

        popupIcon.textContent =
          '✓';

      } else if (type === 'error') {

        popupIcon.textContent =
          '!';

      } else {

        popupIcon.textContent =
          '◇';

      }


      popupTitle.textContent =
        title || '';


      popupText.textContent =
        text || '';


      if (button) {

        popupButton.textContent =
          button;

        popupButton.style.display =
          'block';

      } else {

        popupButton.style.display =
          'none';

      }


      popupOverlay.classList.add(
        'show'
      );

    }


    function closePopup() {

      popupOverlay.classList.remove(
        'show'
      );

    }


    /* =========================================
       시작
    ========================================= */

    window.addEventListener(
      'load',
      function() {

        loadStats();
        loadExpenses();

        pasteArea.focus();

      }
    );


    /* =========================================
       CTRL + V
    ========================================= */

    document.addEventListener(
      'paste',
      function(event) {

        const clipboard =
          event.clipboardData ||
          window.clipboardData;

        if (!clipboard) {
          return;
        }

        const items =
          clipboard.items;

        if (!items) {
          return;
        }

        for (
          let i = 0;
          i < items.length;
          i++
        ) {

          const item =
            items[i];

          if (
            item.type &&
            item.type.indexOf(
              'image'
            ) === 0
          ) {

            event.preventDefault();

            const file =
              item.getAsFile();

            if (file) {

              handleImage(
                file
              );

            }

            return;

          }

        }

      }
    );


    /* =========================================
       MOBILE IMAGE PICKER
    ========================================= */

    // PC에서는 기존 Ctrl + V 방식을 그대로 사용하고,
    // 모바일/터치 기기에서는 인증사진 영역을 눌러 사진을 선택합니다.
    if (
      mobileImageInput &&
      pasteArea &&
      window.matchMedia('(pointer: coarse)').matches
    ) {
      pasteArea.addEventListener(
        'click',
        function(event) {
          // 기존 클릭 안내 동작은 유지하면서 모바일 사진 선택창을 엽니다.
          if (
            event.target.closest('.paste-button') &&
            event.target.closest('.paste-button').onclick
          ) {
            return;
          }

          if (loading.classList.contains('show')) {
            return;
          }

          mobileImageInput.click();
        }
      );

      mobileImageInput.addEventListener(
        'change',
        function(event) {
          const file =
            event.target.files &&
            event.target.files[0];

          if (file) {
            handleImage(file);
          }

          // 같은 사진을 다시 선택해도 change 이벤트가 발생하도록 초기화
          event.target.value = '';
        }
      );
    }


    /* =========================================
       DRAG / FOCUS EFFECT
    ========================================= */

    pasteArea.addEventListener(
      'focus',
      function() {

        pasteArea.classList.add(
          'active'
        );

      }
    );


    pasteArea.addEventListener(
      'blur',
      function() {

        pasteArea.classList.remove(
          'active'
        );

      }
    );


    pasteArea.addEventListener(
      'click',
      function() {

        pasteArea.focus();

        showStatus(
          '인증사진을 복사한 후\nCtrl + V를 눌러주세요.',
          'processing'
        );

        setTimeout(
          function() {

            if (
              !loading.classList.contains(
                'show'
              )
            ) {

              hideStatus();

            }

          },
          2200
        );

      }
    );


    /* =========================================
       IMAGE
    ========================================= */

    function handleImage(file) {

      if (!file) {
        return;
      }


      if (
        !file.type ||
        file.type.indexOf(
          'image/'
        ) !== 0
      ) {

        showPopup(
          'error',
          '사진 등록 실패',
          '이미지 파일만 사용할 수 있습니다.',
          '확인'
        );

        showStatus(
          '이미지 파일만 사용할 수 있습니다.',
          'error'
        );

        return;

      }


      loading.classList.add(
        'show'
      );


      result.classList.remove(
        'show'
      );


      statusBox.classList.remove(
        'show'
      );


      pasteArea.classList.add(
        'active'
      );


      /* 사진을 등록하는 순간 대기 팝업 */

      showPopup(
        'processing',
        '인증사진 확인 중',
        '사진을 정상적으로 등록했습니다.\n\n게임 ID와 납부 금액을 확인하고 있습니다.\n잠시만 기다려주세요.'
      );


      readImage(
        file
      );

    }


    /* =========================================
       IMAGE → BASE64
    ========================================= */

    function readImage(file) {

      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          const resultData =
            event.target.result;


          const comma =
            resultData.indexOf(',');


          if (
            comma === -1
                      ) {

            finishLoading();


            showPopup(
              'error',
              '사진 등록 실패',
              '사진을 읽을 수 없습니다.\n\n사진을 다시 복사해서 붙여넣어 주세요.',
              '확인'
            );


            showStatus(
              '사진을 읽을 수 없습니다.',
              'error'
            );


            return;

          }


          const mimeType =
            resultData
              .substring(
                5,
                resultData.indexOf(';')
              );


          const base64 =
            resultData.substring(
              comma + 1
            );


          analyzeImage(
            {
              mimeType:
                mimeType ||
                'image/png',

              data:
                base64
            }
          );

        };


      reader.onerror =
        function() {

          finishLoading();


          showPopup(
            'error',
            '사진 등록 실패',
            '사진을 읽는 중 오류가 발생했습니다.\n\n사진을 다시 복사해서 붙여넣어 주세요.',
            '확인'
          );


          showStatus(
            '사진을 읽는 중 오류가 발생했습니다.',
            'error'
          );

        };


      reader.readAsDataURL(
        file
      );

    }


    /* =========================================
       OCR
    ========================================= */

    function analyzeImage(imageData) {

      showStatus(
        '인증사진을 확인하고 있습니다.\n잠시만 기다려주세요.',
        'processing'
      );


      google
        .script
        .run
        .withSuccessHandler(
          function(data) {

            if (
              !data ||
              data.success !== true
            ) {

              finishLoading();


              /*
               * 요청한 게임 ID 실패 문구
               */

              const failMessage =
                '게임 ID를 정확하게 확인하지 못했습니다.\n\n' +
                '사진을 조금 더 크게 찍거나 입금 메시지가 선명하게 보이도록 다시 올려주세요.\n\n' +
                '특히 게임 ID의 l / I / 1 / _ 문자가 잘 보이도록 해주세요.';


              showPopup(
                'error',
                '인증 실패',
                failMessage,
                '확인'
              );


              showStatus(
                failMessage,
                'error'
              );


              return;

            }


            showResult(
              data
            );


            registerPayment(
              data,
              imageData
            );

          }
        )
        .withFailureHandler(
          function(error) {

            finishLoading();


            const message =
              getErrorMessage(
                error
              );


            showPopup(
              'error',
              '인증 처리 실패',
              message,
              '확인'
            );


            showStatus(
              message,
              'error'
            );

          }
        )
        .analyzeTaxImage(
          imageData
        );

    }


    /* =========================================
       PAYMENT
    ========================================= */

    function registerPayment(
      data,
      imageData
    ) {

      showStatus(
        '게임 ID와 납부 금액을 확인했습니다.\n납부 등록을 처리하고 있습니다.',
        'processing'
      );


      /*
       * 팝업은 계속 대기 상태
       */

      showPopup(
        'processing',
        '납부 등록 중',
        '게임 ID와 납부 금액을 확인했습니다.\n\n납부 내역을 안전하게 등록하고 있습니다.\n잠시만 기다려주세요.'
      );


      google
        .script
        .run
        .withSuccessHandler(
          function(response) {

            finishLoading();


            if (
              !response ||
              response.success !== true
            ) {

              const message =
                response &&
                response.message
                  ? response.message
                  : '납부 등록에 실패했습니다.';


              showPopup(
                'error',
                '납부 등록 실패',
                message,
                '확인'
              );


              showStatus(
                message,
                'error'
              );


              return;

            }


            /*
             * 성공 팝업
             */

            showPopup(
              'success',
              '납부 등록 완료',
              response.message ||
              '납부 등록이 완료되었습니다.',
              '확인'
            );


            showStatus(
              response.message ||
              '납부 등록이 완료되었습니다.',
              'success'
            );


            loadStats();
            loadExpenses();

            google.script.run
              .withSuccessHandler(function(balance) {
                const el = document.getElementById('resultBalance');
                if (el && balance) {
                  el.textContent = Number(balance.balance || 0).toLocaleString('ko-KR') + ' 냥';
                }
              })
              .getTaxBalance();

          }
        )
        .withFailureHandler(
          function(error) {

            finishLoading();


            const message =
              getErrorMessage(
                error
              );


            showPopup(
              'error',
              '납부 등록 실패',
              message,
              '확인'
            );


            showStatus(
              message,
              'error'
            );

          }
        )
        .registerPayment(
          data.gameId,
          data.amount,
          imageData
        );

    }


    /* =========================================
       RESULT
    ========================================= */

    function showResult(data) {

      document.getElementById(
        'resultName'
      ).textContent =
        data.nickname ||
        '확인된 마을원';


      document.getElementById(
        'resultId'
      ).textContent =
        data.gameId ||
        '-';


      document.getElementById(
        'resultJob'
      ).textContent =
        data.job ||
        '-';


      document.getElementById(
        'resultAmount'
      ).textContent =
        Number(
          data.amount || 0
        ).toLocaleString(
          'ko-KR'
        ) +
        ' 냥';

      const balanceElement = document.getElementById('resultBalance');
      if (balanceElement) {
        balanceElement.textContent = '계산 중';
      }

      result.classList.add(
        'show'
      );

    }


    /* =========================================
       STATS
    ========================================= */

    function loadStats() {

      google
        .script
        .run
        .withSuccessHandler(
          function(data) {

            if (!data) {
              return;
            }


            document.getElementById(
              'totalCount'
            ).textContent =
              Number(
                data.total || 0
              ).toLocaleString(
                'ko-KR'
              );


            document.getElementById(
              'paidCount'
            ).textContent =
              Number(
                data.paid || 0
              ).toLocaleString(
                'ko-KR'
              );


            document.getElementById(
              'unpaidCount'
            ).textContent =
              Number(
                data.unpaid || 0
              ).toLocaleString(
                'ko-KR'
              );

            const balance = Number(data.balance || 0);
            const balanceEl = document.getElementById('taxBalance');
            if (balanceEl) {
              balanceEl.textContent = balance.toLocaleString('ko-KR') + ' 냥';
            }

            const expenseBalance = document.getElementById('expenseBalance');
            if (expenseBalance) {
              expenseBalance.textContent = balance.toLocaleString('ko-KR') + ' 냥';
            }

          }
        )
        .withFailureHandler(
          function() {

            document.getElementById(
              'totalCount'
            ).textContent =
              '-';


            document.getElementById(
              'paidCount'
            ).textContent =
              '-';


            document.getElementById(
              'unpaidCount'
            ).textContent =
              '-';

            const balanceEl = document.getElementById('taxBalance');
            if (balanceEl) {
              balanceEl.textContent = '-';
            }

            const fineBalance = document.getElementById('fineBalance');
            if (fineBalance) {
              fineBalance.textContent = '-';
            }

          }
        )
        .getTaxDashboardStats();

      google
        .script
        .run
        .withSuccessHandler(function(fineData) {
          const fineBalance = document.getElementById('fineBalance');
          if (fineBalance) {
            fineBalance.textContent = Number(
              fineData && fineData.unpaid || 0
            ).toLocaleString('ko-KR') + ' 냥';
          }
        })
        .withFailureHandler(function() {
          const fineBalance = document.getElementById('fineBalance');
          if (fineBalance) {
            fineBalance.textContent = '-';
          }
        })
        .getFineDashboardStats();

    }


    /* =========================================
       EXPENSES
    ========================================= */

    function loadExpenses() {

      google
        .script
        .run
        .withSuccessHandler(function(items) {

          const list = document.getElementById('expenseList');
          if (!list) return;

          const rows = Array.isArray(items) ? items : [];

          if (!rows.length) {
            list.innerHTML =
              '<div class="expense-empty">아직 등록된 세금 지출이 없습니다.</div>';
            return;
          }

          list.innerHTML = rows.map(function(item) {
            const amount = Number(item.amount || 0).toLocaleString('ko-KR') + ' 냥';
            const memo = item.memo
              ? '<div class="expense-memo">' + escapeHtml(item.memo) + '</div>'
              : '';

            return '' +
              '<div class="expense-item">' +
                '<div class="expense-top">' +
                  '<div class="expense-content">' +
                    '<div class="expense-name">' + escapeHtml(item.content) + '</div>' +
                    '<div class="expense-meta">' +
                      escapeHtml(item.date) +
                    '</div>' +
                  '</div>' +
                  '<div class="expense-amount">−' + amount + '</div>' +
                '</div>' +
                memo +
              '</div>';
          }).join('');

          const more = rows.length >= 8
            ? '<div class="expense-more">최근 8건 표시 · 전체 지출 내역은 세금 지출 시트에서 확인</div>'
            : '';

          list.insertAdjacentHTML('beforeend', more);

        })
        .withFailureHandler(function() {

          const list = document.getElementById('expenseList');
          if (list) {
            list.innerHTML =
              '<div class="expense-empty">세금 지출 내역을 불러오지 못했습니다.</div>';
          }

        })
        .getTaxExpenses(8);

    }


    function escapeHtml(value) {

      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    }


    /* =========================================
       LOADING
    ========================================= */

    function finishLoading() {

      loading.classList.remove(
        'show'
      );

    }


    /* =========================================
       STATUS
    ========================================= */

    function showStatus(
      message,
      type
    ) {

      statusBox.textContent =
        message || '';


      statusBox.className =
        'status show ' +
        (
          type ||
          'processing'
        );

    }


    function hideStatus() {

      statusBox.classList.remove(
        'show'
      );

    }


    /* =========================================
       ERROR
    ========================================= */

    function getErrorMessage(error) {

      if (!error) {

        return '알 수 없는 오류가 발생했습니다.';

      }


      if (
        typeof error === 'string'
      ) {

        return '' + error;

      }


      if (
        error.message
      ) {

        return '' +
          error.message;

      }


      return '처리 중 오류가 발생했습니다.';

    }


    /* =========================================
       ESC로 팝업 닫기
    ========================================= */

    document.addEventListener(
      'keydown',
      function(event) {

        if (
          event.key === 'Escape' &&
          popupOverlay.classList.contains(
            'show'
          )
        ) {

          /*
           * 대기 중에는 ESC로 닫지 않음
           * 성공 / 실패 팝업만 닫을 수 있음
           */

          if (
            !popup.classList.contains(
              'processing'
            )
          ) {

            closePopup();

          }

        }

      }
    );
