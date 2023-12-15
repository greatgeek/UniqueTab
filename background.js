let tabsUrlMap = new Map(); // 使用映射来存储标签页ID和URL

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // 忽略空白或特殊的新标签页
    if (!tab.url || tab.url === 'chrome://newtab/' || tab.url === 'about:newtab') {
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
            // 否则添加新URL到映射
            tabsUrlMap.set(tab.url, tabId);
            console.log(`New URL added to map: ${tab.url}`);
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

// 监听标签页创建事件，以便于在创建时立即添加到集合中
chrome.tabs.onCreated.addListener(function(tab) {
    // 忽略空白或特殊的新标签页
    if (!tab.url || tab.url === 'chrome://newtab/' || tab.url === 'about:newtab') {
        return;
    }
    if (!tabsUrlMap.has(tab.url)) {
        tabsUrlMap.set(tab.url, tab.id);
        console.log(`URL added to map on creation: ${tab.url}`);
    }
});
