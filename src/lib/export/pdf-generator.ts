import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generatePDFReport(projectId: string, projectName: string) {
  const res = await fetch(`/api/projects/${projectId}/export?format=json`);
  if (!res.ok) throw new Error('Failed to fetch export data');
  const data = await res.json();

  const pdf = new jsPDF();

  // Title
  pdf.setFontSize(22);
  pdf.setTextColor(40, 40, 40);
  pdf.text(`${projectName}`, 14, 20);

  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Scrum Report', 14, 28);
  pdf.text(`Generated: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);

  // Velocity Table
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Velocity por Sprint', 14, 50);

  if (data.velocity?.length > 0) {
    autoTable(pdf, {
      startY: 55,
      head: [['Sprint', 'Velocity', 'Pontos Comprometidos', 'Conclusão %', 'Carry-over']],
      body: data.velocity.map((v: Record<string, unknown>) => [
        v.sprint_name,
        v.velocity,
        v.total_committed_points,
        `${v.completion_rate ?? 0}%`,
        v.carry_over_count,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Nenhum sprint concluído ainda.', 14, 60);
  }

  // Features summary
  const lastY = (pdf as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 70;
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Resumo de Features', 14, lastY + 15);

  const features: Record<string, unknown>[] = data.features ?? [];
  const done = features.filter((f) => f.status === 'done').length;
  const total = features.length;

  autoTable(pdf, {
    startY: lastY + 20,
    head: [['Total', 'Done', 'Em Progresso', 'Backlog', 'Spikes']],
    body: [[
      total,
      done,
      features.filter((f) => f.status === 'in_progress').length,
      features.filter((f) => f.status === 'backlog' || f.status === 'todo').length,
      features.filter((f) => f.is_spike).length,
    ]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  pdf.save(`${projectName.replace(/\s+/g, '-')}-report.pdf`);
}
