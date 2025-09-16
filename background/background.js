chrome.runtime.onInstalled.addListener(() => {
    scheduleAllAlarms();
});

chrome.runtime.onStartup.addListener(() => {
    scheduleAllAlarms();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "rescheduleAlarms") {
        scheduleAllAlarms();
    }
});

function scheduleAllAlarms() {
    chrome.alarms.clearAll();
    chrome.storage.local.get(['alarms'], (result) => {
        const alarms = result.alarms || [];
        alarms.forEach(alarm => {
            const [hours, minutes] = alarm.time.split(':');
            const now = new Date();
            const alarmTime = new Date();
            
            alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (alarmTime < now) {
                alarmTime.setDate(alarmTime.getDate() + 1);
            }
            
            chrome.alarms.create(alarm.name, {
                when: alarmTime.getTime(),
                periodInMinutes: 1440 // Every 24 hours
            });
        });
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get(['urlSitio', 'alarms'], (result) => {
        const alarms = result.alarms || [];
        if (alarms.some(a => a.name === alarm.name)) {
            // Open the site automatically
            if (result.urlSitio) {
                chrome.tabs.create({ url: result.urlSitio });
            }

            // Also show a notification
            chrome.notifications.create(`notification_${alarm.name}`, {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: '⏰ Time for Check-in!',
                message: 'The site has been opened in a new tab.',
                buttons: [
                    { title: 'Go to Tab' } // Changed button text for clarity
                ],
                priority: 2
            });
        }
    });
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    // This can be used to focus the tab that was opened, but requires more complex state management.
    // For now, clicking the button won't do anything new, but the tab is already open.
    // A simple improvement could be to re-open the URL if the user closed the tab.
    if (buttonIndex === 0) {
        chrome.storage.local.get(['urlSitio'], (result) => {
            if (result.urlSitio) {
                chrome.tabs.create({ url: result.urlSitio });
            }
        });
    }
});
