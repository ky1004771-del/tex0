/* =========================================
   TAX STATUS
========================================= */


function openTaxStatus(){


  document
  .getElementById("taxStatusModal")
  .classList
  .add("show");


  setTimeout(function(){

    document
    .getElementById("taxNickname")
    .focus();

  },200);


}




function closeTaxStatus(){


  document
  .getElementById("taxStatusModal")
  .classList
  .remove("show");


  document
  .getElementById("taxResult")
  .innerHTML="";


  document
  .getElementById("taxNickname")
  .value="";


}





function renderPersonalFine(data){

  const unpaid = Number(data.fineUnpaid || 0);
  const total = Number(data.fineTotal || 0);
  const paid = Number(data.finePaid || 0);
  const details = Array.isArray(data.fineDetails) ? data.fineDetails : [];

  let html = `
    <div class="result-row">
      <span class="result-key">
      개인 벌금
      </span>
      <span class="result-value ${unpaid > 0 ? 'gold' : ''}">
      ${unpaid.toLocaleString('ko-KR')} 냥
      </span>
    </div>`;

  if (details.length) {
    html += `
      <div class="fine-detail">
        <div class="fine-detail-title">벌금 내역</div>`;

    details.forEach(function(fine){
      const status = fine.status || '';
      html += `
        <div class="result-row sub">
          <span class="result-key">${escapeHtml(fine.reason || '벌금')}</span>
          <span class="result-value">${escapeHtml(fine.unpaidAmount || '0 냥')} <i class="dot ${status.includes('납부 완료') ? 'ok' : 'bad'}"></i></span>
        </div>`;
    });

    html += `</div>`;
  }

  return html;
}


function searchTaxStatus(){


  const nickname =
  document
  .getElementById("taxNickname")
  .value
  .trim();



  if(!nickname){

    return;

  }



  const box =
  document
  .getElementById("taxResult");



  box.innerHTML =
  `
  <div class="result-box result-msg">
  조회 중입니다...
  </div>
  `;



  google
  .script
  .run
  .withSuccessHandler(function(r){



    if(
      !r ||
      !r.success
    ){


      box.innerHTML =
      `
      <div class="result-box result-msg">
      조회 정보를 찾을 수 없습니다.
      </div>
      `;


      return;

    }



    const data =
    r.data || {};



    if(r.paid){



      box.innerHTML =

      `
      <div class="result-box">


        <div class="result-row">

          <span class="result-key">
          마을원
          </span>

          <span class="result-value">
          ${data.nickname || nickname}
          </span>

        </div>



        <div class="result-row">

          <span class="result-key">
          상태
          </span>

          <span class="result-value">
          <span class="badge ok">납부 완료</span>
          </span>

        </div>



        <div class="result-row">

          <span class="result-key">
          납부 금액
          </span>

          <span class="result-value gold">
          ${data.amount || "-"}
          </span>

        </div>



        <div class="result-row">

          <span class="result-key">
          납부 기간
          </span>

          <span class="result-value">
          ${data.period || "-"}
          </span>

        </div>

        ${renderPersonalFine(data)}



        <div class="result-row">

          <span class="result-key">
          납부일
          </span>

          <span class="result-value">
          ${data.date || "-"}
          </span>

        </div>


      </div>
      `;



    }else{



      box.innerHTML =


      `
      <div class="result-box">


        <div class="result-row">

          <span class="result-key">
          마을원
          </span>

          <span class="result-value">
          ${nickname}
          </span>

        </div>



        <div class="result-row">

          <span class="result-key">
          상태
          </span>

          <span class="result-value">
          <span class="badge bad">미납</span>
          </span>

        </div>

<div class="result-row">

  <span class="result-key">
  미납 일수
  </span>

  <span class="result-value">
  ${data.lateDays || "0"}
  </span>

</div>



<div class="result-row">

  <span class="result-key">
  연체금
  </span>

  <span class="result-value gold">
  ${data.lateFee || "0"}
  </span>

</div>

        <div class="result-row">

          <span class="result-key">
          납부 필요 금액
          </span>

          <span class="result-value gold">
          ${data.finalAmount || data.remaining || "-"}
          </span>

        </div>

        ${renderPersonalFine(data)}


        <div class="notice">아직 세금 납부가 필요합니다.</div>


      </div>
      `;



    }



  })
  .withFailureHandler(function(){


    box.innerHTML =

    `
    <div class="result-box result-msg">
    조회 중 오류가 발생했습니다.
    </div>
    `;


  })
  .getMyTaxStatus(
    nickname
  );



}
