import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';


export default class ActiveBorderExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        // Initialize instance variables
        this.borderActor = null;
        this.focusWindowSignals = [];
        this.lastFocusedWindow = null;
        this._focusSignal = null;
    }
    enable() {
        console.log("STARTING PRETTY BORDERS!")
        // Connect to the focus window signal to track the active window
        this._focusSignal = global.display.connect('notify::focus-window', () => {
            this._updateBorder(global.display.focus_window);
        });
        // Set initial border on the current window, if there is one
        this._updateBorder(global.display.focus_window);

    }

    _updateBorder(window) {
        console.log("UPDATING THE BORDER")
        // Clear the previous border if there's a last focused window
        // if (this.lastFocusedWindow) {
        //     this._clearBorder(this.lastFocusedWindow);
        // }
        this._clearBorder();
        // Set a new border for the currently focused window
        if (window) {
            this._setBorder(window);
            this.lastFocusedWindow = window;
        }
    }

    _setBorder(window) {
        console.log("SETTING THE BORDER")
        if (!window) return;

        const rect = window.get_frame_rect();
        if (!rect) return;

        // Create a new actor for the border using St.Widget
        this.borderActor = new St.Widget({
            name: 'active-window-border',
            style_class: 'active-window-border',
            reactive: false,
            x: rect.x - 4, // Adjust for border width
            y: rect.y - 4,
            width: rect.width + 8,
            height: rect.height + 8,
        });

        // Add the border actor to the UI group
        Main.layoutManager.uiGroup.add_child(this.borderActor);

        // Listen to window's changes in position and size
        this.focusWindowSignals.push(window.connect('position-changed', () => this._updateBorderPosition(window)));
        this.focusWindowSignals.push(window.connect('size-changed', () => this._updateBorderPosition(window)));
        this.focusWindowSignals.push(window.connect('unmanaged', () => this._clearBorder()));

        this._updateBorderPosition(window);
        // Add the effect to the window
        // actor.add_effect_with_name('bor/der-effect', borderEffect);
    }

    _updateBorderPosition(window) {
        if (!this.borderActor || !window) return;

        const rect = window.get_frame_rect();
        if (!rect) return;

        this.borderActor.set_position(rect.x - 4, rect.y - 4);
        this.borderActor.set_size(rect.width + 8, rect.height + 8);
    }

    _clearBorder() {
        if (this.borderActor) {
            this.borderActor.destroy();
            this.borderActor = null;
        }

        // Disconnect any signals connected to the window
        if (this.lastFocusedWindow && this.focusWindowSignals.length > 0) {
            this.focusWindowSignals.forEach(signal => {
                this.lastFocusedWindow.disconnect(signal);
            });
            this.focusWindowSignals = [];
        }
    }

    disable() {
        // Disconnect the signal and remove any existing borders
        if (this._focusSignal) {
            global.display.disconnect(this._focusSignal);
            this._focusSignal = null;
        }

        // Clear the border on the last focused window if it exists
        this._clearBorder();
        this.lastFocusedWindow = null;
    }

}

// class ActiveBorderExtension extends Extension {
//     constructor(metadata) {
//         super(metadata);
//     }
//
//     enable() {
//         // Connect to the focus window signal to track the active window
//         this._focusSignal = global.display.connect('notify::focus-window', () => {
//             this._updateBorder(global.display.focus_window);
//         });
//
//         // Set initial border on the current window, if there is one
//         this._updateBorder(global.display.focus_window);
//     }
//
//     disable() {
//         // Disconnect the signal and remove any existing borders
//         if (this._focusSignal) {
//             global.display.disconnect(this._focusSignal);
//             this._focusSignal = null;
//         }
//
//         // Clear the border on the last focused window if it exists
//         if (lastFocusedWindow) {
//             this._clearBorder(lastFocusedWindow);
//             lastFocusedWindow = null;
//         }
//     }
//
//     _updateBorder(window) {
//         // Clear the previous border if there's a last focused window
//         if (lastFocusedWindow) {
//             this._clearBorder(lastFocusedWindow);
//         }
//
//         // Set a new border for the currently focused window
//         if (window) {
//             this._setBorder(window);
//             lastFocusedWindow = window;
//         }
//     }
//
//     _setBorder(window) {
//         if (!window || !window.get_compositor_private()) return;
//         window.get_compositor_private().set_style(`
//             border: 4px solid rgba(0, 150, 255, 0.8);
//             border-radius: 5px;
//         `);
//     }
//
//     _clearBorder(window) {
//         if (!window || !window.get_compositor_private()) return;
//         window.get_compositor_private().set_style("");
//     }
// }

