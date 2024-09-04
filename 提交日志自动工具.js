// Submission Logging Tool V 0.2.0
// Author: Leah.Fort

// 使用方法：
// 加载到你的浏览器插件中，在网站加载时自动注入
// 提交任务时，需要在暂存界面，点击“提交并记录”
// 会弹出输入描述的选项，这会显示在你最终的报告中
// 点击下载记录保存当日报告

// 记录存储在浏览器中，清除缓存可以删除

// Helper methods for date and time
const createDayString = () => {
    const newDate = new Date();
    // Beware, the getMonth and getDay return vals start from 0 to 11.
    const naturalMonth = newDate.getMonth() + 1;
    const naturalDay = newDate.getDay() + 1;
    return newDate.getFullYear() + "/" + naturalMonth + "/" + naturalDay;
}

let todayString = createDayString();

const createTimeString = () => {
    const newDate = new Date();
    return newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
}

// Button formatting 
const templateHTMLString = (name, id) => {
    return '<li class="mtd-tooltip-rel mtd-menu-item" id="' + id + '"><div style="display: flex; align-items: center; -webkit-box-align: center; -ms-flex-align: center; justify-items: flex-start; width: 100%; height: 100%; padding: 0 0 0 48px;"><span class="menu-text" style="font-size: 14px;">' + name + '</span></div></li>';
}

// Selectors
const sideBarLastChildSelector = "div.home > div > div.side-bar > ul.side-menu > li:last-child";
const saveButtonSelector = "div.storage-wrap-container > div.mtd-row > div > div > button:nth-child(2)"
const finishedCountSelector = "div.storage-wrap-container > div.mtd-pagination > span.mtd-pagination-total";

// Create a button to trigger job id field insertion 
// -> inserted button object
const injectButton = (locationAfterSelector, buttonHTMLString, buttonName) => {
    const insertAfter = (element, htmlString) =>
        element.insertAdjacentHTML("afterend", htmlString);
    const locationAfter = document.querySelector(locationAfterSelector)
    insertAfter(locationAfter, buttonHTMLString);
    const buttonId = "#" + buttonName;

    const insertButton = document.querySelector(buttonId);
    return insertButton;
}

// Capture counter element and desc element
// -> null
const reportToLocalStorage = () => {
    const finishedCount = document.querySelector(finishedCountSelector).innerText;
    const jobDesc = prompt("请描述当前要提交的任务（例如任务号）：", "无描述");

    let entry = createTimeString() + " - " + jobDesc + " - " + finishedCount;
    const existingContent = localStorage.getItem(todayString);

    if (existingContent) {
        entry = existingContent + '\n' + entry;
    }

    localStorage.setItem(todayString, entry);

    const alertMsg = '任务“' + jobDesc + '”已记录到本地：' + finishedCount;
    alert(alertMsg);
}

// Create blob download request
// -> null
const downloadEntry = (entry, fileName) => {
    console.log(entry, fileName);
    const value = localStorage.getItem(entry, null)
    if (value == null) {
        alert("当天无可下载的记录。");
        return;
    };
    const blob = new Blob([value], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Capture save button and create job id field
// Use a closure to keep saveButton pointing to the relevant element.
// Every time the sub page reloads, a new save button will be created. A query ad hoc is hence needed.

let saveButton = null;
setTimeout(() => {
    injectButton(sideBarLastChildSelector, templateHTMLString('提交并记录', 'submit_and_record_button'), 'submit_and_record_button')
        .addEventListener("click", () => {
            if (saveButton == null || document.querySelector(saveButtonSelector) !== saveButton) {
                saveButton = document.querySelector(saveButtonSelector);
            };
            reportToLocalStorage();
            saveButton.click();
            console.log("Helper script has been injected to record your work submission progress locally.")
        });
    injectButton(sideBarLastChildSelector, templateHTMLString('下载本日提交记录', 'download_button'), 'download_button')
        .addEventListener("click", () => {
            downloadEntry(todayString, todayString.replaceAll("/", "-") + ".txt");
        });
}, 2000);
