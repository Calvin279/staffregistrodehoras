class ServiceTracker {
    constructor() {
        this.services = JSON.parse(localStorage.getItem('services')) || [];
        this.serviceForm = document.getElementById('serviceForm');
        this.notificationDiv = document.getElementById('notification');
        this.serviceTableBody = document.getElementById('serviceTableBody');
        this.weeklySummaryTableBody = document.getElementById('weeklySummaryTableBody');
        this.searchInput = document.getElementById('searchInput');

        this.initEventListeners();
        this.renderTables();
    }

    initEventListeners() {
        this.serviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startService();
        });

        this.searchInput.addEventListener('input', () => this.renderTables());
    }

    startService() {
        const nameInput = document.getElementById('nameInput');
        const rangeInput = document.getElementById('rangeInput');
        
        const service = {
            name: nameInput.value,
            range: rangeInput.value,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null
        };

        this.services.push(service);
        this.saveServices();
        this.showNotification(`Servicio iniciado para ${service.name}`);
        this.renderTables();

        nameInput.value = '';
        rangeInput.value = '';
    }

    endService(index) {
        const service = this.services[index];
        service.endTime = new Date().toISOString();
        service.duration = this.calculateDuration(service.startTime, service.endTime);
        
        this.saveServices();
        this.showNotification(`Servicio finalizado para ${service.name}`);
        this.renderTables();
    }

    calculateDuration(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = endDate - startDate;
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    saveServices() {
        localStorage.setItem('services', JSON.stringify(this.services));
    }

    renderTables() {
        this.renderServiceTable();
        this.renderWeeklySummary();
    }

    renderServiceTable() {
        const searchTerm = this.searchInput.value.toLowerCase();
        this.serviceTableBody.innerHTML = '';

        this.services
            .filter(service => service.name.toLowerCase().includes(searchTerm))
            .forEach((service, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.name}</td>
                    <td>${service.range}</td>
                    <td>${new Date(service.startTime).toLocaleString()}</td>
                    <td>${service.endTime ? new Date(service.endTime).toLocaleString() : 'En curso'}</td>
                    <td>${service.duration || 'N/A'}</td>
                    <td>
                        ${!service.endTime ? 
                            `<button onclick="serviceTracker.endService(${index})">Finalizar</button>` : 
                            'Completado'}
                    </td>
                `;
                this.serviceTableBody.appendChild(row);
            });
    }

    renderWeeklySummary() {
        this.weeklySummaryTableBody.innerHTML = '';
        const weeklyHours = this.calculateWeeklyHours();

        Object.entries(weeklyHours).forEach(([name, hours]) => {
            const row = document.createElement('tr');
            row.className = hours >= 28 ? 'completed' : 'not-completed';
            row.innerHTML = `
                <td>${name}</td>
                <td>${hours.toFixed(2)}</td>
                <td>${hours >= 28 ? 'Completado' : 'Pendiente'}</td>
            `;
            this.weeklySummaryTableBody.appendChild(row);
        });
    }

    calculateWeeklyHours() {
        const weeklyHours = {};
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        this.services
            .filter(service => service.endTime && new Date(service.endTime) > oneWeekAgo)
            .forEach(service => {
                const hours = this.parseHoursDuration(service.duration);
                weeklyHours[service.name] = (weeklyHours[service.name] || 0) + hours;
            });

        return weeklyHours;
    }

    parseHoursDuration(duration) {
        if (!duration) return 0;
        const match = duration.match(/(\d+)h/);
        return match ? parseFloat(match[1]) : 0;
    }

    showNotification(message) {
        this.notificationDiv.textContent = message;
        this.notificationDiv.style.display = 'block';
        setTimeout(() => {
            this.notificationDiv.style.display = 'none';
        }, 3000);
    }
}

const serviceTracker = new ServiceTracker();
window.serviceTracker = serviceTracker;