import GLib from 'gi://GLib';
import St from 'gi://St';
import Meta from 'gi://Meta';
import {Extension, ExtensionMetadata} from 'resource:///org/gnome/shell/extensions/extension.js';
import {HSLColor} from "./utils/color.js";
import RGBColor from "./utils/color.js";
// import Gio from 'gi://Gio';
// import cairo from "cairo";
// import Shell from 'gi://Shell';
// import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class PrettyBorders extends Extension {

    borderActor: St.Widget | null;
    focusWindowSignals: number[];
    lastFocusedWindow: Meta.Window | null;
    _focusSignal: number | null;
    _windowCreateId : number | null;

    // New variables for color.ts cycling
    colorTimeoutId: number | null;
    currentColor: HSLColor;

    constructor(metadata: ExtensionMetadata) {
        super(metadata);
        // Initialize instance variables
        this.borderActor = null;
        this.focusWindowSignals = [];
        this.lastFocusedWindow = null;
        this._focusSignal = null;
        this._windowCreateId = null;

        // Initialize color.ts cycling variables
        this.colorTimeoutId = null;
        this.currentColor = new HSLColor(0, 1, .3); // Starting hue value
    }

    enable() {
        console.log("STARTING PRETTY BORDERS!")
        // Connect to the focus window signal to track the active window
        this._focusSignal = global.display.connect('notify::focus-window', () => {
            // console.log("Focus Changed")
            this._updateBorder(global.display.focus_window);
        })
        // Set initial border on the current window, if there is one
        this._updateBorder(global.display.focus_window);

    }


    _updateBorder(window: Meta.Window) {
        // console.log("UPDATING THE BORDER")
        // Clear the previous border
        this._clearBorder();
        // Set a new border for the currently focused window
        if (window) {
            this._setBorder(window);
            this.lastFocusedWindow = window;
        }
    }

    _setBorder(window: Meta.Window) {
        // console.log("SETTING THE BORDER")
        if (!window) return;

        const rect = window.get_frame_rect();
        if (!rect) return;

        // Create a new actor for the border using St.Widget
        this.borderActor = new St.Widget({
            name: 'active-window-border',
            // style_class: 'active-window-border',
            reactive: false,
            x: rect.x - 1, // Adjust for border width
            y: rect.y - 1,
            width: rect.width + 2, // Increased to accommodate border
            height: rect.height + 2,
            // Initial style with default color.ts
            // style: `border: 4px solid hsl(${this.hue}, 100%, 50%); border-radius: 5px;`,
            // style: `border: 2px solid rgba(0, 0, 0, 0.5); border-radius: 3px;`
        });

        // Add the border actor to the UI group
        global.window_group.add_child(this.borderActor);
        // Main.layoutManager.uiGroup.add_child(this.borderActor);

        // Listen to window's changes in position and size
        this.focusWindowSignals?.push(window.connect('position-changed', () => this._updateBorderPosition(window)));
        this.focusWindowSignals?.push(window.connect('size-changed', () => this._updateBorderPosition(window)));
        this.focusWindowSignals?.push(window.connect('unmanaged', () => this._clearBorder()));

        this._updateBorderPosition(window);

        // Start the color.ts cycling
        this._startColorCycle();
    }

    _updateBorderPosition(window: Meta.Window) {
        if (!this.borderActor || !window) return;

        const rect = window.get_frame_rect();
        if (!rect) return;

        this.borderActor.set_position(rect.x - 1, rect.y - 1);
        this.borderActor.set_size(rect.width + 2, rect.height + 2);
    }

    _clearBorder() {
        // console.log("Clearing Border!")
        // Stop the color.ts cycling
        this._stopColorCycle();

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


    // Start the color.ts cycling using GLib.timeout_add
    _startColorCycle() {
        if (this.colorTimeoutId === null) {
            // Update every 100 milliseconds
            this.colorTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 33, () => {
                this._updateColor();
                // Continue the timeout
                return GLib.SOURCE_CONTINUE;
            });
        }
    }


    _getStyleRGBA() {
        const rgb = RGBColor.fromHSL(this.currentColor)
        return `border: 3px solid rgba(${rgb.r}, ${rgb.b}, ${rgb.g}, ${rgb.a}); border-radius: 10px;`
    }

    // Stop the color.ts cycling
    _stopColorCycle() {
        if (this.colorTimeoutId !== null) {
            GLib.source_remove(this.colorTimeoutId);
            this.colorTimeoutId = null;
        }
    }

    // Update the border color.ts based on the current hue
    _updateColor() {
        if (!this.borderActor) return;
        // console.log("updating color.ts")

        // console.log(this.borderActor.get_style());
        // Increment hue and wrap around at 360
        this.currentColor.h = (this.currentColor.h + 1) % 360;

        // Update the border color.ts
        this.borderActor.set_style(this._getStyleRGBA());
        return true; // Continue the timeout
    }

    disable() {
        console.log("DISABLED PRETTY BORDERS!")
        // Disconnect the focus signal and remove any existing borders
        if (this._focusSignal) {
            global.display.disconnect(this._focusSignal);
            this._focusSignal = null;
        }

        // Clear the border on the last focused window if it exists
        this._clearBorder();
        this.lastFocusedWindow = null;
    }


}