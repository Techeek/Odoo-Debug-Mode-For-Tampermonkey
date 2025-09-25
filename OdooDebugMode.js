// ==UserScript==
// @name         Odoo Debug Mode Switcher in Navbar
// @namespace    https://www.einfo-tech.com/
// @version      0.3
// @description  Add a debug switch button into Odoo main navbar, supporting single/double click debug mode toggle
// @match        *://*/web*
// @match        *://*/odoo*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // --- 检测 Odoo debug 并写入 body ---
    function checkOdooDebug() {
        if (window.hasOwnProperty('odoo') && window.odoo && window.odoo.hasOwnProperty('debug')) {
            let odooVersion = 'legacy';
            let debugMode = '';
            const body = document.getElementsByTagName('body')[0];
            if (typeof odoo.debug === 'boolean') {
                const url = window.location.href;
                if (url.search(/[&|?]debug=assets/) !== -1) {
                    debugMode = 'assets';
                } else if (url.search(/[&|?]debug/) !== -1) {
                    debugMode = '1';
                }
            } else {
                odooVersion = 'new';
                debugMode = odoo.debug;
            }
            debugMode = debugMode === '0' ? '' : debugMode;
            body.setAttribute('data-odoo', odooVersion);
            body.setAttribute('data-odoo-debug-mode', debugMode);
        }
    }

    const timer = setInterval(checkOdooDebug, 500);

    // --- 创建按钮并插入到 navbar ---
    function createNavbarButton() {
        // 防止重复创建
        if (document.getElementById('tm-odoo-debug-btn')) return;

        const navbar = document.querySelector('.o_main_navbar');
        if (!navbar) return;

        const debugManager = navbar.querySelector('.o_debug_manager');
        const messagingMenu = navbar.querySelector('.o-mail-DiscussSystray-class');

        const btn = document.createElement('button');
        btn.id = 'tm-odoo-debug-btn';
        btn.className = 'btn btn-sm btn-secondary';
        btn.style.marginRight = '8px';
        btn.style.fontSize = '12px';
        btn.style.cursor = 'pointer';

        function updateLabel() {
            const url = new URL(window.location.href);
            const mode = url.searchParams.get('debug') || '';
            if (mode === '1') {
                btn.textContent = 'Debug: ON';
                btn.style.backgroundColor = '#186F66';
            } else if (mode === 'assets') {
                btn.textContent = 'Debug: Assets';
                btn.style.backgroundColor = '#FBB945';
            } else {
                btn.textContent = 'Debug: OFF';
                btn.style.backgroundColor = '#985184';
            }
        }

        let clickCount = 0;
        let clickTimer = null;

        btn.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);

            clickTimer = setTimeout(() => {
                if (clickCount === 1) {
                    setDebugMode('1');
                } else if (clickCount === 2) {
                    setDebugMode('assets');
                }
                clickCount = 0;
            }, 400);
        });

        function setDebugMode(mode) {
            const url = new URL(window.location.href);
            if (mode) {
                url.searchParams.set('debug', mode);
            } else {
                url.searchParams.delete('debug');
            }
            window.location.href = url.toString();
        }

        updateLabel();

        // 核心插入逻辑
        if (debugManager && debugManager.parentNode) {
            debugManager.parentNode.insertBefore(btn, debugManager);
        } else if (messagingMenu && messagingMenu.parentNode) {
            messagingMenu.parentNode.insertBefore(btn, messagingMenu);
        } else {
            navbar.appendChild(btn);
        }
    }



    // SPA 页面路由可能变化，用定时器持续检查
    setInterval(createNavbarButton, 1000);
})();
