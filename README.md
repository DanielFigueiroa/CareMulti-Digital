 # CareMulti Digital

 Interface demonstrativa para acompanhamento de pacientes e rotinas de equipes de cuidado. O projeto usa React, TypeScript, Vite e Tailwind CSS 4, com identidade baseada em `#009999` e `#0099CC`.

 ## Executar

 Requisitos: Node.js e npm.

 ```bash
 npm install
 npm run dev
 ```

 O Vite inicia em `http://localhost:5173`.

 ## Verificações

 ```bash
 npm run build
 npm run lint
 ```

## Estrutura

- `src/data/patients.ts` — fonte única de verdade dos 12 pacientes, com sinais vitais, diagnóstico, comorbidades, alergias, foco assistencial e status canônico. Também concentra os rótulos de status por área.
- `src/hooks/usePatientRecord.ts` — seleção, busca e contadores derivados da lista de pacientes.
- `src/hooks/useNotice.ts` — mensagens demonstrativas com o prefixo de classe de cada dashboard.
- `src/components/shared/` — primitivas de apresentação reaproveitadas por todos os painéis: `TabNav`, `BottomNav`, `AlertBanner`, `SectionTitle`, `FactCard`, `TimelineEntry`, `PendingRow`, `ScheduleRow`, `NoticeLine`.

Cada painel mantém seu próprio arquivo CSS e seu prefixo de classe; os componentes compartilhados recebem o nome de classe explicitamente para preservar o visual existente.

## Jornadas disponíveis

- Paciente/acompanhante: resumo, rotina do dia e cronograma demonstrativo de medicamentos.
- Médico: resumo clínico, evolução, prescrição, exames e equipe.
- Enfermagem/técnico de enfermagem: pacientes, sinais vitais com SpO2, cuidados, medicamentos e evolução, sem checklist do leito.
- Nutrição: resumo, avaliação, dieta, evolução e pendências.
- Fisioterapia: resumo, avaliação, plano terapêutico, evolução e pendências; o plano não tem campo de responsável.
- Psicologia: resumo, evolução, cuidados, plano terapêutico e pendências; sem aba Comunicação.
- Recepção: início, cadastro de paciente e relatórios. O cadastro não solicita leito nem motivo de internação.
- Administração: indicadores operacionais, ocupação de leitos, equipe e relatórios.

## Regras de consistência

- Todas as telas leem o mesmo paciente de `src/data/patients.ts`. Selecionar outro paciente atualiza diagnóstico, sinais vitais, status e pendências em todas as áreas.
- Contadores e taxas são calculados a partir dos dados: ocupação de leitos, percentual por unidade, equipe ativa, pacientes por status e evolutionários. Nenhum número exibido é digitado à mão.
- A ocupação do painel administrativo é gerada a partir da lista de pacientes e da capacidade por unidade, então os 12 pacientes e os 24 leitos ficam sempre coerentes entre a visão geral e a aba de leitos.
- A área de login é compartilhada por pacientes e profissionais. Os oito perfis passam pela tela de acesso e chegam ao painel correspondente; a validação de formulário é local, sem verificação de credencial.

## Limitações

As telas usam dados fictícios em memória. Não há autenticação real, API, banco de dados, gravação de prontuário ou persistência entre sessões. As ações clínicas continuam sendo demonstrações: exibem um aviso e não salvam registros. Não usar para decisões assistenciais.
