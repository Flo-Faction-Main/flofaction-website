// FloFaction AI-Powered Chat Widget - Complete Advanced System
// Includes: AI Chat, Live Quote Calculator, Video Booking, Smart Recommendations

(function() {
    'use strict';

    // ==================== AI CHAT WIDGET ====================
    const FloChatWidget = {
        isOpen: false,
        messages: [],
        
        init() {
            this.createWidget();
            this.attachEventListeners();
            this.loadConversationHistory();
        },

        createWidget() {
            const widgetHTML = `
                <div id="flo-chat-widget" class="flo-chat-closed">
                    <button id="flo-chat-toggle" class="flo-chat-toggle" aria-label="Open chat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <span class="flo-chat-notification" style="display:none">1</span>
                    </button>
                    
                    <div id="flo-chat-container" class="flo-chat-container" style="display:none">
                        <div class="flo-chat-header">
                            <div class="flo-chat-header-info">
                                <div class="flo-chat-avatar">🤖</div>
                                <div>
                                    <div class="flo-chat-bot-name">Flo AI Assistant</div>
                                    <div class="flo-chat-status">●
