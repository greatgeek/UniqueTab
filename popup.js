// popup.js

document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('toggleFeature');
    const statusIcon = document.getElementById('statusIcon');

    // 更新图标函数
    function updateIcon(isEnabled) {
        statusIcon.src = isEnabled ? 'images/icon-enabled.png' : 'images/icon-disabled.png';
        if (isEnabled) {
            // 设置为启用状态的图标
            chrome.action.setIcon({path: "images/icon-enabled.png"});
        } else {
            // 设置为禁用状态的图标
            chrome.action.setIcon({path: "images/icon-disabled.png"});
        }
    }

    // 当popup加载时，检查存储的状态并更新复选框和图标
    chrome.storage.sync.get(['duplicateTabPreventionEnabled'], function(result) {
        const isEnabled = result.duplicateTabPreventionEnabled !== false;
        checkbox.checked = isEnabled;
        updateIcon(isEnabled);
    });

    // 当用户更改复选框时，更新存储的状态和图标
    checkbox.addEventListener('change', function() {
        const isEnabled = checkbox.checked;
        chrome.storage.sync.set({duplicateTabPreventionEnabled: isEnabled}, function() {
            updateIcon(isEnabled);
        });
    });
});

// 一键移除重复标签
document.getElementById('removeDuplicates').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "removeDuplicateTabs" });
});

