// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
// 15단계 renderEvents 필터 상태. 다시 불러와도 고른 필터는 유지하고, 새 자료에 없는 값이면 all 로 되돌립니다.
const eventFilterState = { kind: 'all', appId: 'all', access: 'all' };

export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('section');
      root.setAttribute('aria-label', '로그인 사용자·기기·세션');

      const text = (parent, tag, value) => {
        const node = document.createElement(tag);
        node.textContent = String(value);
        parent.appendChild(node);
        return node;
      };
      const valueText = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const modeText = (mode) => ({
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      })[mode] || '확인 불가 (unknown)';
      const deviceStatusText = (status) => ({
        compliant: '보안 기준 충족 (compliant)',
        noncompliant: '보안 기준 미충족 (noncompliant)',
        unknown: '확인 불가 (unknown)',
      })[status] || `확인 불가 (${valueText(status)})`;
      const sessionStatusText = (status) => ({
        active: '활성 (active)',
        expired: '만료 (expired)',
        revoked: '철회됨 (revoked)',
        unknown: '확인 불가 (unknown)',
      })[status] || `확인 불가 (${valueText(status)})`;

      const resourceSection = (title, resource, renderOk) => {
        const section = document.createElement('section');
        text(section, 'h3', title);
        text(section, 'p', `자료 모드: ${modeText(resource?.mode)}`);

        if (resource?.status === 'loading') {
          text(section, 'p', '불러오는 중');
        } else if (resource?.status === 'error') {
          const code = resource.error?.code;
          const message = valueText(resource.error?.message);
          const prefix = code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED'
            ? '확인 불가'
            : '연결 실패';
          text(section, 'p', `${prefix}: ${message}`);
        } else if (resource?.status === 'ok') {
          renderOk(section, resource.data);
        } else {
          text(section, 'p', '확인 불가: 자료 상태를 확인할 수 없습니다.');
        }

        root.appendChild(section);
      };

      resourceSection('로그인 사용자와 현재 기기·세션', me, (section, data) => {
        if (!data?.user || !data?.device || !data?.session) {
          text(section, 'p', '확인 불가: 사용자·기기·세션 자료 형식을 확인할 수 없습니다.');
          return;
        }
        text(section, 'p', `사용자: ${valueText(data.user.label)} (ID: ${valueText(data.user.id)})`);
        text(section, 'p', `현재 기기: ${valueText(data.device.label)} (ID: ${valueText(data.device.id)}) · ${deviceStatusText(data.device.status)}`);
        text(section, 'p', `현재 세션: ID ${valueText(data.session.id)} · ${sessionStatusText(data.session.status)}`);
      });

      resourceSection('기기 목록', devices, (section, data) => {
        if (!Array.isArray(data)) {
          text(section, 'p', '확인 불가: 기기 목록 형식을 확인할 수 없습니다.');
          return;
        }
        if (data.length === 0) {
          text(section, 'p', '표시할 기기 정보가 없습니다.');
          return;
        }
        for (const device of data) {
          if (!device || typeof device !== 'object') {
            text(section, 'p', '확인 불가: 기기 자료 형식을 확인할 수 없습니다.');
            continue;
          }
          text(section, 'p', `기기: ${valueText(device.label)} (ID: ${valueText(device.id)}) · ${deviceStatusText(device.status)}`);
        }
      });

      resourceSection('세션 목록', sessions, (section, data) => {
        if (!Array.isArray(data)) {
          text(section, 'p', '확인 불가: 세션 목록 형식을 확인할 수 없습니다.');
          return;
        }
        if (data.length === 0) {
          text(section, 'p', '표시할 세션 정보가 없습니다.');
          return;
        }
        for (const session of data) {
          if (!session || typeof session !== 'object') {
            text(section, 'p', '확인 불가: 세션 자료 형식을 확인할 수 없습니다.');
            continue;
          }
          text(section, 'p', `세션: ID ${valueText(session.id)} · ${sessionStatusText(session.status)}`);
        }
      });

      return root;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const root = document.createElement('section');
      root.setAttribute('aria-label', '업무 앱 접근 판정');

      const text = (tag, value) => {
        const node = document.createElement(tag);
        node.textContent = String(value);
        root.appendChild(node);
        return node;
      };
      const valueText = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const modeText = ({
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      })[mode] || '확인 불가 (unknown)';
      const DECISION_TEXT = {
        allow: { label: '허용 (allow)', note: '정책상 접근이 허용되었습니다. 실제 앱 접속 성공을 보장하지는 않습니다.' },
        deny: { label: '거부 (deny)', note: '정책상 접근이 거부되었습니다.' },
        challenge: { label: '추가 확인 필요 (challenge)', note: '추가 인증 또는 확인이 필요합니다. 이 화면은 확인 절차를 대신 수행하지 않습니다.' },
        unknown: { label: '확인 불가 (unknown)', note: '판정을 확인할 수 없습니다. 접근이 허용되지 않은 것으로 다룹니다.' },
      };

      text('h3', '업무 앱 접근 판정');
      if (typeof mode === 'string' && mode.length > 0) text('p', `자료 모드: ${modeText}`);

      if (status === 'idle') {
        text('p', '앱을 골라 접속을 요청하세요.');
        return root;
      }
      if (status === 'loading') {
        text('p', `대상 앱: ${valueText(appId)}`);
        text('p', '판정 확인 중');
        return root;
      }
      if (status === 'error') {
        text('p', `대상 앱: ${valueText(appId)}`);
        text('p', `요청 실패: ${valueText(error?.message)}`);
        text('p', '서버의 판정을 받지 못했습니다. 접근 거부 판정이 아니며, 접근이 허용된 것도 아닙니다.');
        return root;
      }
      if (status === 'ok' && data && typeof data === 'object') {
        const known = Object.hasOwn(DECISION_TEXT, data.decision);
        const shown = known
          ? DECISION_TEXT[data.decision]
          : { label: `확인 불가 (unknown, 받은 값: ${valueText(data.decision)})`, note: DECISION_TEXT.unknown.note };
        text('p', `대상 앱: ${valueText(data.appId ?? appId)}`);
        text('p', `판정: ${shown.label}`);
        text('p', shown.note);
        text('p', `판정 이유: ${valueText(data.reason)}`);
        text('p', `판정 시각: ${valueText(data.checkedAt)}`);
        return root;
      }

      text('p', `대상 앱: ${valueText(appId)}`);
      text('p', '판정: 확인 불가 (unknown) — 판정 자료를 확인할 수 없습니다. 접근이 허용되지 않은 것으로 다룹니다.');
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('section');
      root.setAttribute('aria-label', '접속 기록·XDR 경보');

      const add = (parent, tag, value) => {
        const node = document.createElement(tag);
        if (value !== undefined) node.textContent = String(value);
        parent.appendChild(node);
        return node;
      };
      const valueText = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const MODE_TEXT = {
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      };
      const KIND_TEXT = { access: '접속 기록 (access)', xdr: 'XDR 경보 (xdr)' };
      const ACCESS_TEXT = { allowed: '허용됨 (allowed)', denied: '거부됨 (denied)', unknown: '확인 불가 (unknown)' };
      const SESSION_TEXT = { active: '활성 (active)', expired: '만료 (expired)', revoked: '철회됨 (revoked)', unknown: '확인 불가 (unknown)' };
      const DEVICE_TEXT = { compliant: '보안 기준 충족 (compliant)', noncompliant: '보안 기준 미충족 (noncompliant)', unknown: '확인 불가 (unknown)' };
      const labelOf = (table, value) => table[value] || `확인 불가 (${valueText(value)})`;
      const appText = (appId) => typeof appId === 'string' && appId.length > 0 ? appId : '앱 확인 불가 (appId 없음)';
      const timeText = (at) => {
        const ms = Date.parse(at);
        if (!Number.isFinite(ms)) return `확인 불가 (${valueText(at)})`;
        const local = new Date(ms).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false });
        return `${local} KST (원래 값: ${at})`;
      };

      add(root, 'h3', '접속 기록·XDR 경보');
      if (typeof mode === 'string' && mode.length > 0) add(root, 'p', `자료 모드: ${MODE_TEXT[mode] || '확인 불가 (unknown)'}`);

      if (status === 'loading') {
        add(root, 'p', '기록을 불러오는 중');
        return root;
      }
      if (status === 'error') {
        const code = error?.code;
        if (code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED') {
          add(root, 'p', `확인 불가: 기록 응답 형식을 확인할 수 없습니다 (${code}). ${valueText(error?.message)}`);
          add(root, 'p', '이전 목록은 현재 결과가 아니므로 표시하지 않습니다.');
        } else {
          add(root, 'p', `기록을 불러오지 못했습니다: ${valueText(error?.message)}`);
          add(root, 'p', '조회에 실패했습니다. 기록이 없다는 뜻이 아닙니다.');
        }
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        add(root, 'p', '확인 불가: 기록 자료 상태를 확인할 수 없습니다.');
        return root;
      }
      if (data.length === 0) {
        add(root, 'p', '표시할 기록이 없습니다.');
        add(root, 'p', '조회는 성공했으며, 본인의 최근 기록 범위에 해당하는 기록이 0건입니다.');
        return root;
      }

      // 받은 배열은 고치지 않고 복사해서 at 기준 최신순으로 정렬합니다.
      const events = [...data].sort((a, b) => (Date.parse(b?.at) || 0) - (Date.parse(a?.at) || 0));

      // 필터: 전체는 all, 나머지는 받은 원래 값. 앱 ID 가 없는 기록은 빈 값('')으로 고릅니다.
      const FILTERS = [
        { key: 'kind', label: '기록 종류', read: (e) => e?.kind, text: (v) => labelOf(KIND_TEXT, v) },
        { key: 'appId', label: '업무 앱', read: (e) => (typeof e?.appId === 'string' ? e.appId : ''), text: (v) => appText(v) },
        { key: 'access', label: '접속 상태', read: (e) => e?.state?.access, text: (v) => labelOf(ACCESS_TEXT, v) },
      ];
      let selectedId = null; // 새 자료가 오면 이전 상세 선택은 지웁니다.

      const filterBox = add(root, 'div');
      const countLine = add(root, 'p');
      const list = add(root, 'ul');
      const detail = add(root, 'section');
      detail.setAttribute('aria-live', 'polite');

      for (const filter of FILTERS) {
        const values = [...new Set(events.map(filter.read).filter((v) => typeof v === 'string'))];
        if (eventFilterState[filter.key] !== 'all' && !values.includes(eventFilterState[filter.key])) {
          eventFilterState[filter.key] = 'all';
        }
        const id = `student-event-filter-${filter.key}`;
        const label = add(filterBox, 'label', `${filter.label} `);
        label.htmlFor = id;
        const select = add(label, 'select');
        select.id = id;
        select.setAttribute('aria-label', filter.label);
        const all = add(select, 'option', '전체 (all)');
        all.value = 'all';
        for (const value of values) {
          const option = add(select, 'option', filter.text(value));
          option.value = value;
        }
        select.value = eventFilterState[filter.key];
        select.addEventListener('change', () => {
          eventFilterState[filter.key] = select.value;
          drawList();
        });
      }

      const drawDetail = () => {
        detail.replaceChildren();
        detail.removeAttribute('data-student-event-detail');
        const event = events.find((e) => e?.id === selectedId);
        if (!event) return;
        detail.setAttribute('data-student-event-detail', String(event.id));
        add(detail, 'h4', `${valueText(event.id)} 상세`);
        add(detail, 'p', `사건 ID: ${valueText(event.id)}`);
        add(detail, 'p', `앱: ${appText(event.appId)}`);

        add(detail, 'h5', '근거 (evidence)');
        const evidence = Array.isArray(event.evidence) ? event.evidence : [];
        if (evidence.length === 0) add(detail, 'p', '근거 없음');
        const evidenceList = add(detail, 'ul');
        for (const row of evidence) add(evidenceList, 'li', `${valueText(row?.id)}: ${valueText(row?.text)}`);

        add(detail, 'h5', '규칙 (rules)');
        const rules = Array.isArray(event.rules) ? event.rules : [];
        if (rules.length === 0) add(detail, 'p', '규칙 없음');
        const ruleList = add(detail, 'ul');
        for (const row of rules) add(ruleList, 'li', `${valueText(row?.id)}: ${valueText(row?.text)}`);

        add(detail, 'h5', '상태 (state)');
        const stateList = add(detail, 'ul');
        add(stateList, 'li', `접속 (state.access): ${labelOf(ACCESS_TEXT, event.state?.access)}`);
        add(stateList, 'li', `세션 (state.session): ${labelOf(SESSION_TEXT, event.state?.session)}`);
        add(stateList, 'li', `기기 (state.device): ${labelOf(DEVICE_TEXT, event.state?.device)}`);

        // 16단계: 원천이 넘긴 조치가 있을 때만, 요청을 보내지 않는 비활성 「<action> 미지원」 버튼을 둡니다.
        const actions = Array.isArray(event.supportedActions) ? event.supportedActions.filter((a) => typeof a === 'string' && a.length > 0) : [];
        if (actions.length > 0) {
          add(detail, 'h5', '조치 (supportedActions)');
          add(detail, 'p', '아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중이며, 아래 버튼은 누를 수 없고 어떤 요청도 보내지 않습니다.');
          for (const action of actions) {
            const button = add(detail, 'button', `${action} 미지원`);
            button.type = 'button';
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
          }
        }
      };

      const drawList = () => {
        const shown = events.filter((event) => FILTERS.every((filter) => (
          eventFilterState[filter.key] === 'all' || filter.read(event) === eventFilterState[filter.key]
        )));
        countLine.textContent = `표시 ${shown.length}건 / 받은 기록 ${events.length}건 (본인의 최근 기록, 최신순)`;
        list.replaceChildren();
        if (shown.length === 0) add(list, 'li', '필터에 맞는 기록이 없습니다.');
        for (const event of shown) {
          const row = add(list, 'li');
          row.setAttribute('data-student-event-id', String(event.id));
          add(row, 'p', `사건 ID: ${valueText(event.id)}`);
          add(row, 'p', `시각: ${timeText(event.at)}`);
          add(row, 'p', `종류: ${labelOf(KIND_TEXT, event.kind)}`);
          add(row, 'p', `앱: ${appText(event.appId)}`);
          add(row, 'p', `요약: ${valueText(event.summary)}`);
          const button = add(row, 'button', `${valueText(event.id)} 상세`);
          button.type = 'button';
          button.setAttribute('aria-label', `${valueText(event.id)} 상세`);
          button.addEventListener('click', () => {
            selectedId = event.id;
            drawDetail();
          });
        }
        if (!shown.some((event) => event.id === selectedId)) selectedId = null;
        drawDetail();
      };

      drawList();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');
      root.setAttribute('aria-label', '기기·세션·알림·도움정보 상태');

      const add = (parent, tag, value) => {
        const node = document.createElement(tag);
        if (value !== undefined) node.textContent = String(value);
        parent.appendChild(node);
        return node;
      };
      // 화면과 복사본에 비밀처럼 보이는 값이 섞이지 않게 가립니다.
      const SECRET = /(?:Bearer\s+\S+|sk-[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|token|secret|비밀번호|토큰)\s*[:=]\s*\S+)/giu;
      const safe = (value) => (typeof value === 'string' && value.length > 0 ? value.replace(SECRET, '[가림]') : '확인 불가');
      const safeCode = (value) => (typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,64}$/u.test(value) ? value : '확인 불가');
      const MODE_TEXT = {
        connected: '연결됨 (connected)', demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)', unknown: '확인 불가 (unknown)',
      };
      const modeText = (value) => MODE_TEXT[value] || '확인 불가 (unknown)';
      const DEVICE_TEXT = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const SESSION_TEXT = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const RESOURCE_TEXT = {
        me: '로그인 정보', apps: '업무 앱', events: '보안 기록', devices: '기기', sessions: '세션',
        access: '접속 판정', diagnostics: '도움정보',
      };
      const withCode = (table, value) => `${table[value] || '확인 불가'} (${safeCode(value)})`;
      const TIMEOUT_CODES = new Set(['TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT']);
      const RETRY = '다시 시도는 위쪽 「다시 불러오기」 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.';

      // 실패 안내: 무엇을 불러오지 못했는지 + 시간 초과 여부 + message + 직접 다시 시도.
      const failure = (section, what, error, retryText = RETRY) => {
        const code = safeCode(error?.code);
        if (TIMEOUT_CODES.has(code)) {
          add(section, 'p', `${what}을(를) 불러오지 못했습니다: 시간 초과 (${code}). ${safe(error?.message)}`);
        } else if (code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED') {
          add(section, 'p', `${what} 확인 불가: 응답 형식을 확인할 수 없습니다 (${code}). ${safe(error?.message)}`);
        } else {
          add(section, 'p', `${what}을(를) 불러오지 못했습니다 (${code}): ${safe(error?.message)}`);
        }
        add(section, 'p', retryText);
      };

      const resourceSection = (title, what, resource, renderList) => {
        const section = add(root, 'section');
        add(section, 'h3', title);
        if (resource?.mode) add(section, 'p', `자료 모드: ${modeText(resource.mode)}`);
        if (resource?.status === 'loading') add(section, 'p', `${what}을(를) 불러오는 중`);
        else if (resource?.status === 'error') failure(section, what, resource.error);
        else if (resource?.status === 'ok' && Array.isArray(resource.data)) renderList(section, resource.data);
        else if (resource?.status === 'ok') add(section, 'p', `${what} 확인 불가: 목록 형식을 확인할 수 없습니다.`);
        else add(section, 'p', `${what} 확인 불가: 아직 불러오지 않았거나 상태를 알 수 없습니다.`);
        return section;
      };

      add(root, 'h3', '케셰브 상태 점검');
      add(root, 'p', `전체 자료 모드: ${modeText(mode)}`);

      resourceSection('등록 기기', '기기 목록', devices, (section, list) => {
        if (list.length === 0) {
          add(section, 'p', '등록된 기기가 없습니다. (조회는 성공했으며 결과가 0건입니다)');
          return;
        }
        const ul = add(section, 'ul');
        for (const device of list) {
          add(ul, 'li', `${safe(device?.label)} · ${withCode(DEVICE_TEXT, device?.status)}`);
        }
      });

      const sessionSection = resourceSection('현재 세션', '세션', sessions, (section, list) => {
        if (list.length === 0) {
          add(section, 'p', '현재 연결 없음: 지금 검증된 세션이 없습니다. (조회는 성공했으며 결과가 0건입니다)');
          return;
        }
        const ul = add(section, 'ul');
        for (const session of list) {
          add(ul, 'li', `세션 ID ${safe(session?.id)} · ${withCode(SESSION_TEXT, session?.status)}`);
        }
      });
      add(sessionSection, 'p', '세션은 지금 검증된 연결 1건만 표시합니다. 지난 세션 목록이 아닙니다.');

      const alertSection = add(root, 'section');
      add(alertSection, 'h3', '알림');
      if (!Array.isArray(notifications)) {
        add(alertSection, 'p', '알림 확인 불가: 알림 목록 형식을 확인할 수 없습니다.');
      } else if (notifications.length === 0) {
        add(alertSection, 'p', '주의할 알림이 없습니다.');
      } else {
        add(alertSection, 'p', `주의할 알림 ${notifications.length}건`);
        const ul = add(alertSection, 'ul');
        for (const item of notifications) {
          const resource = typeof item?.resource === 'string' ? item.resource : '';
          add(ul, 'li', `자료: ${RESOURCE_TEXT[resource] || '확인 불가'} (${safeCode(resource)}) · 코드: ${safeCode(item?.code)} · ${safe(item?.message)}`);
        }
      }

      // 도움정보: 제공 화면이 조회해 넘긴 값만 씁니다. 학생 코드는 진단 주소를 직접 호출하지 않습니다.
      const diagSection = add(root, 'section');
      add(diagSection, 'h3', '도움정보');
      let helpText = '';
      if (diagnostics?.status === 'ok' && diagnostics.data && typeof diagnostics.data === 'object') {
        const d = diagnostics.data;
        const fields = [
          ['requestId', d.requestId], ['component', d.component], ['version', d.version],
          ['checkedAt', d.checkedAt], ['engine.mode', d.engine?.mode], ['engine.code', d.engine?.code],
        ];
        const ul = add(diagSection, 'ul');
        for (const [name, value] of fields) add(ul, 'li', `${name}: ${safe(value)}`);
        helpText = fields.map(([name, value]) => `${name}: ${safe(value)}`).join('\n');
      } else if (diagnostics?.status === 'loading') {
        add(diagSection, 'p', '도움정보를 불러오는 중');
      } else if (diagnostics?.status === 'error') {
        failure(diagSection, '도움정보', diagnostics.error, '다시 시도는 위쪽 도움정보 카드의 「도움정보 불러오기」 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.');
      } else {
        add(diagSection, 'p', '도움정보를 아직 불러오지 않았습니다. 위쪽 도움정보 카드의 「도움정보 불러오기」 버튼을 누르면 이곳에 표시됩니다.');
      }
      add(diagSection, 'p', '「도움정보 복사」는 도움을 요청할 때 붙여 넣을 수 있도록 위 여섯 값(requestId·component·version·checkedAt·engine.mode·engine.code)만 복사합니다. 비밀번호·토큰·API 키는 포함하지 않으며, 누를 때만 복사하고 어디에도 전송하지 않습니다.');
      const copyButton = add(diagSection, 'button', '도움정보 복사');
      copyButton.type = 'button';
      copyButton.disabled = helpText.length === 0;
      const copyStatus = add(diagSection, 'p');
      copyStatus.setAttribute('role', 'status');
      copyStatus.setAttribute('aria-live', 'polite');
      if (!helpText) copyStatus.textContent = '복사할 도움정보가 없습니다. 먼저 도움정보를 불러오세요.';
      copyButton.addEventListener('click', async () => {
        if (!helpText) return;
        try {
          await navigator.clipboard.writeText(helpText);
          copyStatus.textContent = '도움정보 여섯 값을 클립보드에 복사했습니다.';
        } catch {
          copyStatus.textContent = '자동 복사를 사용할 수 없습니다. 위 목록을 직접 선택해 Ctrl+C로 복사하세요.';
        }
      });

      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
