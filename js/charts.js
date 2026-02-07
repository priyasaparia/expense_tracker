/* ========================================
   CHART FUNCTIONALITY
   ======================================== */

/**
 * Simple Bar Chart Implementation
 */
class SimpleChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        if (!this.canvas) return;
        this.padding = 40;
    }

    /**
     * Clear canvas
     */
    clear() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw bar chart
     */
    drawBarChart(labels, data, colors = []) {
        if (!this.ctx) return;

        this.clear();

        const width = this.canvas.width;
        const height = this.canvas.height;
        const chartWidth = width - this.padding * 2;
        const chartHeight = height - this.padding * 2;

        const maxValue = Math.max(...data);
        const barWidth = chartWidth / data.length;
        const barSpacing = barWidth * 0.8;
        const barActualWidth = barWidth * 0.7;

        // Draw axes
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, height - this.padding);
        this.ctx.lineTo(width - this.padding, height - this.padding);
        this.ctx.stroke();

        // Draw bars
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = this.padding + index * barWidth + (barWidth - barActualWidth) / 2;
            const y = height - this.padding - barHeight;

            const color = colors[index] || '#6366f1';

            // Draw bar
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, barActualWidth, barHeight);

            // Draw value on top
            this.ctx.fillStyle = '#1f2937';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`$${value.toFixed(0)}`, x + barActualWidth / 2, y - 10);

            // Draw label
            this.ctx.fillStyle = '#6b7280';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.save();
            this.ctx.translate(x + barActualWidth / 2, height - this.padding + 20);
            this.ctx.rotate(-Math.PI / 6);
            this.ctx.fillText(labels[index], 0, 0);
            this.ctx.restore();
        });
    }

    /**
     * Draw pie chart
     */
    drawPieChart(labels, data, colors = []) {
        if (!this.ctx) return;

        this.clear();

        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        const total = data.reduce((sum, val) => sum + val, 0);
        let currentAngle = -Math.PI / 2;

        // Draw pie slices
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            const color = colors[index] || this.getRandomColor();

            // Draw slice
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            const percentage = ((value / total) * 100).toFixed(1);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${percentage}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw legend
        this.drawLegend(labels, colors, data, total);
    }

    /**
     * Draw legend
     */
    drawLegend(labels, colors, data, total) {
        const legendX = 20;
        const legendY = 20;
        const itemHeight = 20;

        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';

        labels.forEach((label, index) => {
            const y = legendY + index * itemHeight;
            const color = colors[index] || this.getRandomColor();
            const percentage = ((data[index] / total) * 100).toFixed(1);

            // Draw color box
            this.ctx.fillStyle = color;
            this.ctx.fillRect(legendX, y - 10, 15, 15);

            // Draw label
            this.ctx.fillStyle = '#1f2937';
            this.ctx.fillText(`${label} (${percentage}%)`, legendX + 20, y);
        });
    }

    /**
     * Draw line chart
     */
    drawLineChart(labels, data, color = '#6366f1') {
        if (!this.ctx) return;

        this.clear();

        const width = this.canvas.width;
        const height = this.canvas.height;
        const chartWidth = width - this.padding * 2;
        const chartHeight = height - this.padding * 2;

        const maxValue = Math.max(...data);
        const pointSpacing = chartWidth / (data.length - 1 || 1);

        // Draw grid
        this.ctx.strokeStyle = '#f3f4f6';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = this.padding + (chartHeight / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(width - this.padding, y);
            this.ctx.stroke();
        }

        // Draw axes
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, height - this.padding);
        this.ctx.lineTo(width - this.padding, height - this.padding);
        this.ctx.stroke();

        // Draw line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        data.forEach((value, index) => {
            const x = this.padding + index * pointSpacing;
            const y = height - this.padding - (value / maxValue) * chartHeight;

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();

        // Draw points
        this.ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = this.padding + index * pointSpacing;
            const y = height - this.padding - (value / maxValue) * chartHeight;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw value
            this.ctx.fillStyle = '#1f2937';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`$${value.toFixed(0)}`, x, y - 15);
        });

        // Draw x-axis labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = this.padding + index * pointSpacing;
            this.ctx.fillText(label, x, height - this.padding + 20);
        });
    }

    /**
     * Get random color
     */
    getRandomColor() {
        const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * Create charts on dashboard
 */
function createCharts(expenses) {
    if (expenses.length === 0) return;

    // Category Chart
    const categoryChart = document.getElementById('categoryChart');
    if (categoryChart) {
        const breakdown = storage.getCategoryBreakdown();
        const categories = Object.keys(breakdown);
        const amounts = Object.values(breakdown);

        const colors = categories.map(cat => {
            const colorMap = {
                food: '#ef4444',
                transportation: '#f97316',
                entertainment: '#eab308',
                shopping: '#22c55e',
                utilities: '#06b6d4',
                health: '#3b82f6',
                education: '#8b5cf6',
                personal: '#ec4899',
                savings: '#10b981',
                investment: '#6366f1',
                travel: '#f59e0b',
                other: '#6b7280'
            };
            return colorMap[cat] || '#6b7280';
        });

        const chart = new SimpleChart('categoryChart');
        chart.drawPieChart(
            categories.map(cat => getCategoryName(cat)),
            amounts,
            colors
        );
    }

    // Trend Chart (Monthly)
    const trendChart = document.getElementById('trendChart');
    if (trendChart) {
        const monthly = storage.getMonthlySummary();
        
        if (monthly.length > 0) {
            const labels = monthly.slice(-6).map(m => {
                const [year, month] = m.month.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
            });

            const amounts = monthly.slice(-6).map(m => m.expenses);

            const chart = new SimpleChart('trendChart');
            chart.drawLineChart(labels, amounts, '#6366f1');
        }
    }
}

/**
 * Initialize charts on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const expenses = storage.getExpenses();
    if (document.getElementById('categoryChart') || document.getElementById('trendChart')) {
        createCharts(expenses);
    }
});
