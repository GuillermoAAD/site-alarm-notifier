document.addEventListener('DOMContentLoaded', () => {
    const urlSitioInput = document.getElementById('urlSitio');
    const saveUrlButton = document.getElementById('saveUrl');
    const newAlarmTimeInput = document.getElementById('newAlarmTime');
    const addAlarmButton = document.getElementById('addAlarm');
    const alarmsList = document.getElementById('alarms-list');

    // Load and display saved data
    const loadData = () => {
        chrome.storage.local.get(['urlSitio', 'alarms'], (result) => {
            if (result.urlSitio) {
                urlSitioInput.value = result.urlSitio;
            }
            if (result.alarms) {
                renderAlarms(result.alarms);
            }
        });
    };

    // Render the list of alarms
    const renderAlarms = (alarms) => {
        alarmsList.innerHTML = '';
        alarms.forEach((alarm, index) => {
            const li = document.createElement('li');
            li.textContent = alarm.time;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => {
                deleteAlarm(index);
            });
            li.appendChild(deleteButton);
            alarmsList.appendChild(li);
        });
    };

    // Save the URL
    saveUrlButton.addEventListener('click', () => {
        const url = urlSitioInput.value;
        chrome.storage.local.set({ urlSitio: url }, () => {
            alert('URL saved!');
        });
    });

    // Add a new alarm
    addAlarmButton.addEventListener('click', () => {
        const time = newAlarmTimeInput.value;
        if (!time) return;

        chrome.storage.local.get({ alarms: [] }, (result) => {
            const alarms = result.alarms;
            if (alarms.some(a => a.time === time)) {
                alert('An alarm for that time already exists.');
                return;
            }
            alarms.push({ time: time, name: `alarm_${Date.now()}` });
            chrome.storage.local.set({ alarms: alarms }, () => {
                renderAlarms(alarms);
                chrome.runtime.sendMessage({ action: 'rescheduleAlarms' });
            });
        });
    });

    // Delete an alarm
    const deleteAlarm = (indexToDelete) => {
        chrome.storage.local.get({ alarms: [] }, (result) => {
            const alarms = result.alarms.filter((_, index) => index !== indexToDelete);
            chrome.storage.local.set({ alarms: alarms }, () => {
                renderAlarms(alarms);
                chrome.runtime.sendMessage({ action: 'rescheduleAlarms' });
            });
        });
    };

    loadData();
});
