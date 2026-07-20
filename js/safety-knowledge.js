let phaseChart;

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    renderPhaseChart();
    initFaq();
    document.addEventListener('languageChanged', () => {
        renderPhaseChart();
    });
});

function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('open');
        });
    });
}

// 【绘制飞行阶段事故分布图表】
function renderPhaseChart() {
    const ctx = document.getElementById('phaseChart');
    if (!ctx) return;
    
    if (phaseChart) {
        phaseChart.destroy();
    }
    
    phaseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                t('knowledge.takeoff'),
                t('knowledge.cruise'),
                t('knowledge.descent'),
                t('knowledge.preflight')
            ],
            datasets: [{
                data: [35, 12, 48, 5],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(255, 136, 0, 0.8)',
                    'rgba(0, 102, 204, 0.8)'
                ],
                borderColor: [
                    '#22c55e',
                    '#7c3aed',
                    '#ff8800',
                    '#0066CC'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.parsed}%`
                    }
                }
            }
        }
    });
}