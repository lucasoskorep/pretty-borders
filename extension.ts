import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension, ExtensionMetadata } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class ActiveBorderExtension extends Extension {

    borderActor: St.Widget | null;
    focusWindowSignals: any[];
    lastFocusedWindow: Meta.Window | null;
    _focusSignal: number | null;

    constructor(metadata: ExtensionMetadata) {
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

    _updateBorder(window: Meta.Window) {
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

    _setBorder(window: Meta.Window) {
        console.log("SETTING THE BORDER")
        if (!window) return;

        const rect = window.get_frame_rect();
        if (!rect) return;

        // Create a new actor for the border using St.Widget
        this.borderActor = new St.Widget({
            name: 'active-window-border',
            style_class: 'active-window-border',
            reactive: false,
            x: rect.x - 2, // Adjust for border width
            y: rect.y - 2,
            width: rect.width + 2,
            height: rect.height + 2,
        });
        // this.borderActor = new St.BorderImage({
        //
        // })
        // Add the border actor to the UI group
        Main.layoutManager.uiGroup.add_child(this.borderActor);

        // Listen to window's changes in position and size
        this.focusWindowSignals?.push(window.connect('position-changed', () => this._updateBorderPosition(window)));
        this.focusWindowSignals?.push(window.connect('size-changed', () => this._updateBorderPosition(window)));
        this.focusWindowSignals?.push(window.connect('unmanaged', () => this._clearBorder()));

        this._updateBorderPosition(window);
        // Add the effect to the window
        // actor.add_effect_with_name('bor/der-effect', borderEffect);
    }

    _updateBorderPosition(window: Meta.Window) {
        if (!this.borderActor || !window) return;

        const rect = window.get_frame_rect();
        if (!rect) return;

        this.borderActor.set_position(rect.x - 2, rect.y - 2);
        this.borderActor.set_size(rect.width + 2, rect.height + 2);
    }

    _clearBorder() {
        if (this.borderActor) {
            this.borderActor.destroy();
            this.borderActor = null;
        }

        // Disconnect any signals connected to the window
        if (this.lastFocusedWindow && this.focusWindowSignals.length > 0) {
            this.focusWindowSignals.forEach(signal => {
                this.lastFocusedWindow?.disconnect(signal);
            });
            this.focusWindowSignals = [];
        }
    }

    disable() {
        console.log("DISABLED PRETTY BORDERS!")
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
