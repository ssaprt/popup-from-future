import { CSSProperties } from "react";
import {
    AnimationDuration,
    AnimationsPopupType,
} from "../types/animations.type";
import { SizeType } from "../types/general.type";
import { PopupBlur } from "../types/popup.interface";

interface DefaultAnimationConfig {
    animationName: AnimationsPopupType;
    duration: AnimationDuration;
    easing: NonNullable<CSSProperties["animationTimingFunction"]>;
}

interface StylesConfigItem {
    style: CSSProperties;
    className?: string;
}

interface StylesConfig {
    index: number;

    animation: {
        open: DefaultAnimationConfig;
        close: DefaultAnimationConfig;
    };

    layer: {
        backgroundColor: NonNullable<CSSProperties["backgroundColor"]>;
        blur: PopupBlur;
        style: CSSProperties;
        className?: string;
    };

    close: {
        size?: SizeType;
        timeOutShow?: AnimationDuration;
        style: CSSProperties;
        className?: string;

        timer: {
            style: CSSProperties;
            className?: string;
        };
    };

    customStyle: {
        container: StylesConfigItem;
        header: StylesConfigItem;
        body: StylesConfigItem;
    };
}

export const stylesConfig: StylesConfig = {
    index: 99999,

    animation: {
        open: {
            animationName: "fade-in",
            duration: 0,
            easing: "linear",
        },

        close: {
            animationName: "fade-out",
            duration: 0,
            easing: "linear",
        },
    },

    layer: {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        blur: "0px",
        className: "",
        style: {},
    },

    close: {
        className: "",

        style: {},

        timer: {
            className: "",
            style: {},
        },
    },

    customStyle: {
        container: {
            className: "",
            style: {},
        },

        header: {
            className: "",
            style: {},
        },

        body: {
            className: "",
            style: {},
        },
    },
} satisfies StylesConfig;
