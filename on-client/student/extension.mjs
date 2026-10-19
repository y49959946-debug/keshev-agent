// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
