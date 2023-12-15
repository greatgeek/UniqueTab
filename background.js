let tabsUrlMap = new Map(); // 使用映射来存储标签页ID和URL
let featureEnabled = true; // 默认启用功能

// 从存储中加载用户的设置
chrome.storage.sync.get(['duplicateTabPreventionEnabled'], function(result) {
    featureEnabled = result.duplicateTabPreventionEnabled !== false;
});

// 监听来自popup.js的设置更改
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'duplicateTabPreventionEnabled') {
            featureEnabled = newValue;
        }
    }
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!featureEnabled) return; // 如果功能未启用，则不执行任何操作

    // 忽略空白或特殊的新标签页
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
        return;
    }

    if (changeInfo.status === 'complete') {
        console.log(`Tab Updated: ${tabId}, Status: ${changeInfo.status}, URL: ${tab.url}`);
        // 如果URL已经存在于映射中，就关闭新标签页并聚焦到已存在的标签页
        if (tabsUrlMap.has(tab.url) && tabsUrlMap.get(tab.url) !== tabId) {
            console.log(`Duplicate URL detected. Closing tab with ID: ${tabId}`);
            chrome.tabs.remove(tabId);
            // 聚焦到已存在的标签页
            chrome.tabs.update(tabsUrlMap.get(tab.url), { active: true });
        } else {
            // 更新映射中的URL和标签页ID
            tabsUrlMap.set(tab.url, tabId);
            console.log(`URL updated in map: ${tab.url}`);
        }
    }
});

// 监听标签页关闭事件，从映射中移除对应的URL
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    // 逆向查找并删除该标签页的URL
    for (let [url, id] of tabsUrlMap.entries()) {
        if (id === tabId) {
            tabsUrlMap.delete(url);
            console.log(`URL removed from map on removal: ${url}`);
            break;
        }
    }
});

// 注意：不再需要监听标签页创建事件，因为在标签页创建时URL通常是未知的
// 所有关于新标签页的逻辑都应该在onUpdated监听器中处理
