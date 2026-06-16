'use strict';

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var OVERTIME_RATE = 1.25;

    var el = {
      hourlyWage: document.getElementById('hourly-wage'),
      normalHours: document.getElementById('normal-hours'),
      normalMinutes: document.getElementById('normal-minutes'),
      overtimeHours: document.getElementById('overtime-hours'),
      overtimeMinutes: document.getElementById('overtime-minutes'),
      workDays: document.getElementById('work-days'),
      errors: document.getElementById('errors'),
      outDaily: document.getElementById('out-daily'),
      outOvertime: document.getElementById('out-overtime'),
      outMonthly: document.getElementById('out-monthly'),
      outAnnual: document.getElementById('out-annual'),
    };

    var inputs = [
      el.hourlyWage,
      el.normalHours,
      el.normalMinutes,
      el.overtimeHours,
      el.overtimeMinutes,
      el.workDays,
    ];

    var touched = new Set();

    function parseNonNegativeInt(raw, fieldLabel) {
      if (raw === null || raw === undefined) {
        return { ok: false, message: fieldLabel + 'を入力してください。' };
      }
      var s = String(raw).trim();
      if (s === '') {
        return { ok: false, message: fieldLabel + 'を入力してください。' };
      }
      if (!/^\d+$/.test(s)) {
        return { ok: false, message: fieldLabel + 'は0以上の整数で入力してください。' };
      }
      var n = parseInt(s, 10);
      if (n < 0 || !Number.isFinite(n)) {
        return { ok: false, message: fieldLabel + 'は0以上の整数で入力してください。' };
      }
      return { ok: true, value: n };
    }

    function parseMinutes(raw, fieldLabel) {
      var r = parseNonNegativeInt(raw, fieldLabel);
      if (!r.ok) {
        return r;
      }
      if (r.value > 59) {
        return { ok: false, message: fieldLabel + 'は0〜59の範囲で入力してください。' };
      }
      return r;
    }

    function hoursToDecimal(hours, minutes) {
      return hours + minutes / 60;
    }

    function formatYen(amount) {
      return amount.toLocaleString('ja-JP') + ' 円';
    }

    function setPlaceholder() {
      var dash = '—';
      el.outDaily.textContent = dash;
      el.outOvertime.textContent = dash;
      el.outMonthly.textContent = dash;
      el.outAnnual.textContent = dash;
    }

    function showErrors(messages) {
      if (messages.length === 0) {
        el.errors.hidden = true;
        el.errors.innerHTML = '';
        return;
      }
      var ul = document.createElement('ul');
      ul.className = 'errors__list';
      for (var i = 0; i < messages.length; i++) {
        var li = document.createElement('li');
        li.className = 'errors__item';
        li.textContent = messages[i];
        ul.appendChild(li);
      }
      el.errors.innerHTML = '';
      el.errors.appendChild(ul);
      el.errors.hidden = false;
    }

    function computeAndRender() {
      var allErrors = [];
      var touchedErrors = [];

      function validate(result, fieldId) {
        if (!result.ok) {
          allErrors.push(result.message);
          if (touched.has(fieldId)) {
            touchedErrors.push(result.message);
          }
        }
        return result;
      }

      var wage = validate(parseNonNegativeInt(el.hourlyWage.value, '時給'), 'hourly-wage');
      var nh = validate(parseNonNegativeInt(el.normalHours.value, '通常労働時間（時間）'), 'normal-hours');
      var nm = validate(parseMinutes(el.normalMinutes.value, '通常労働時間（分）'), 'normal-minutes');
      var oh = validate(parseNonNegativeInt(el.overtimeHours.value, '残業時間（時間）'), 'overtime-hours');
      var om = validate(parseMinutes(el.overtimeMinutes.value, '残業時間（分）'), 'overtime-minutes');
      var wd = validate(parseNonNegativeInt(el.workDays.value, '月の労働日数'), 'work-days');

      showErrors(touchedErrors);

      if (allErrors.length > 0) {
        setPlaceholder();
        return;
      }

      var hourly = wage.value;
      var normalH = nh.value;
      var normalM = nm.value;
      var otH = oh.value;
      var otM = om.value;
      var days = wd.value;

      var normalHoursDay = hoursToDecimal(normalH, normalM);
      var otHoursDay = hoursToDecimal(otH, otM);

      var dailyNormal = hourly * normalHoursDay;
      var dailyOvertime = hourly * OVERTIME_RATE * otHoursDay;
      var dailyTotal = dailyNormal + dailyOvertime;

      var monthlyNormal = dailyNormal * days;
      var monthlyOvertime = dailyOvertime * days;
      var monthlyTotal = monthlyNormal + monthlyOvertime;

      var annual = monthlyTotal * 12;

      el.outDaily.textContent = formatYen(Math.round(dailyTotal));
      el.outOvertime.textContent = formatYen(Math.round(dailyOvertime));
      el.outMonthly.textContent = formatYen(Math.round(monthlyTotal));
      el.outAnnual.textContent = formatYen(Math.round(annual));
    }

    for (var j = 0; j < inputs.length; j++) {
      inputs[j].addEventListener('input', function (e) {
        touched.add(e.target.id);
        computeAndRender();
      });
      inputs[j].addEventListener('change', function (e) {
        touched.add(e.target.id);
        computeAndRender();
      });
    }
  });
})();
