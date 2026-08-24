/**
 * ============================================================
 * RENDERIZAÇÃO
 * ------------------------------------------------------------
 * Este arquivo desenha o estado na tela. E só isso.
 *
 * REGRA DE OURO: aqui não se DECIDE nada.
 * Não se filtra, não se ordena, não se calcula regra de negócio.
 * Ele recebe o que deve aparecer e coloca na tela.
 *
 * Um bom `render` é burro de propósito. Toda a inteligência
 * mora no estado.
 * ============================================================
 */

/* ------------------------------------------------------------
   SEGURANÇA - por que escapar o texto?
   ------------------------------------------------------------
   Vamos montar HTML com `innerHTML`. Se o nome de um paciente
   fosse `<img src=x onerror="alert(1)">`, o navegador executaria
   esse código. Isso se chama XSS.
   Escapar significa: transformar caractere de marcação em texto.
   Voltaremos a isso com calma em OWASP Top 10.
   ------------------------------------------------------------ */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** 1991-03-14  ->  14/03/1991 */
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Monta o HTML de UM cartão de paciente. */
function patientCardTemplate(patient) {
  const cardModifier = patient.active ? "" : " patient-card--inactive";
  const badgeModifier = patient.active ? "status-badge--active" : "status-badge--inactive";
  const badgeLabel = patient.active ? "Ativo" : "Inativo";

  return `
    <li class="patient-card${cardModifier}">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <h2 class="patient-card__name">
          <a class="patient-card__link" href="./paciente.html?id=${patient.id}">${escapeHtml(patient.name)}</a>
        </h2>
        <span class="status-badge ${badgeModifier}">${badgeLabel}</span>
      </div>
      <p class="patient-card__meta">
        Nascimento: ${formatDate(patient.birthDate)}
      </p>
      <p class="patient-card__meta patient-card__id">
        CNS ${escapeHtml(patient.nationalId)} · #${patient.id}
      </p>
      <p class="patient-card__meta patient-card__encounters">
        ${patient.encounterCount} atendimento${patient.encounterCount === 1 ? "" : "s"}
      </p>
    </li>
  `;
}

/** Tela de "nada encontrado". */
function emptyStateTemplate(searchTerm) {
  const complement = searchTerm
    ? `Nenhum paciente corresponde a “${escapeHtml(searchTerm)}”.`
    : "Nenhum paciente cadastrado ainda.";

  return `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Nada por aqui</p>
        <p class="m-0">${complement}</p>
      </div>
    </li>
  `;
}

/**
 * TODO RENDER-1 (Encontro 1, Prática 1)
 * Desenhe a lista de pacientes dentro do elemento `container`.
 *
 * Passos:
 *   1. se `patients` estiver vazio, use emptyStateTemplate(searchTerm)
 *   2. senão, transforme cada paciente em HTML com patientCardTemplate
 *      e junte tudo numa única string
 *   3. coloque o resultado em container.innerHTML
 *
 * Dica: `patients.map(...).join("")`
 *
 * Repare que redesenhamos a lista INTEIRA a cada mudança. Para
 * oito pacientes isso é instantâneo e o código fica trivial.
 * Para dez mil linhas com foco e rolagem, não seria — e é
 * exatamente esse problema que o React resolve. Você vai
 * entender o React muito melhor depois de ter vivido isso.
 */



export function renderPatientList(patients, searchTerm, container) {
  const cards = patients.map(p => patientCardTemplate(p));
  container.innerHTML =  cards.join("");
}

/** Atualiza o contador de resultados. */
export function renderCounter(visibleCount, totalCount, container) {
  container.textContent =
    visibleCount === totalCount
      ? `${totalCount} paciente(s) no prontuário`
      : `${visibleCount} de ${totalCount} paciente(s)`;
}

/**
 * Mensagem enquanto os dados não chegaram.
 * Visual diferente do erro de propósito: um spinner não assusta o
 * usuário do jeito que uma cor de alerta assustaria.
 */
export function renderLoading(container) {
  container.innerHTML = `
    <li>
      <div class="empty-state d-flex flex-column align-items-center gap-2">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Carregando…</span>
        </div>
        <p class="empty-state__title m-0">Buscando os pacientes.</p>
      </div>
    </li>
  `;
}

/**
 * Mensagem quando a comunicação falhou.
 * `alert-danger` (vermelho) em vez do `empty-state` cinza usado para
 * "nada encontrado" — erro e ausência de dados não são a mesma coisa.
 */
export function renderError(message, container) {
  container.innerHTML = `
    <li>
      <div class="alert alert-danger mb-0" role="alert">
        <p class="empty-state__title m-0">Algo deu errado</p>
        <p class="m-0">${escapeHtml(message)}</p>
      </div>
    </li>
  `;
}
